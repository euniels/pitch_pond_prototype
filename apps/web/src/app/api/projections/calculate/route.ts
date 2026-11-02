import { NextResponse } from "next/server";
import { calculateGoalProjection, PROJECTION_MODEL_VERSION } from "@/lib/projections";
import type {
  MetricDirection,
  MetricUnit,
  ProjectionScenario,
} from "@/lib/projections";
import { assertSameOrigin } from "@/lib/request-security";
import { projectionCalculationSchema } from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ScenarioInputs = {
  expectedMonthlyChange?: number;
  monthlyVolatility?: number;
  customerAcquisitionPerMonth?: number;
  retentionPercent?: number;
  monthlyBurnAmount?: number;
  milestoneReliability?: number;
  evidenceCadencePerMonth?: number;
};

function scenarioInputs(value: unknown): ScenarioInputs {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  return Object.fromEntries(
    [
      "expectedMonthlyChange",
      "monthlyVolatility",
      "customerAcquisitionPerMonth",
      "retentionPercent",
      "monthlyBurnAmount",
      "milestoneReliability",
      "evidenceCadencePerMonth",
    ]
      .filter((key) => typeof input[key] === "number")
      .map((key) => [key, input[key]]),
  ) as ScenarioInputs;
}

function indexedSeries(
  series: Array<{ month: number; date: string; p10: number; p50: number; p90: number }>,
  baseline: number,
) {
  const denominator = Math.max(Math.abs(baseline), 1);
  return series.map((point) => ({
    month: point.month,
    date: point.date,
    p10: Math.round((point.p10 / denominator) * 10_000) / 100,
    p50: Math.round((point.p50 / denominator) * 10_000) / 100,
    p90: Math.round((point.p90 / denominator) * 10_000) / 100,
  }));
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = projectionCalculationSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { message: "Choose a valid projection goal and scenario." },
        { status: 422 },
      );

    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user)
      return NextResponse.json(
        { message: "Sign in is required." },
        { status: 401 },
      );

    const [{ data: flag }, { data: allowed }] = await Promise.all([
      supabase
        .from("feature_flags")
        .select("enabled")
        .eq("key", "venture_projections")
        .maybeSingle(),
      supabase.rpc("check_rate_limit", {
        p_key: `projection:${auth.user.id}`,
        p_limit: 20,
        p_window_seconds: 3600,
      }),
    ]);
    if (!flag?.enabled)
      return NextResponse.json(
        { message: "Venture projections are not enabled for this pilot yet." },
        { status: 503 },
      );
    if (!allowed)
      return NextResponse.json(
        { message: "Projection calculation limit reached. Try again later." },
        { status: 429 },
      );

    const { data: goal } = await supabase
      .from("projection_goals")
      .select("*,venture_metrics(*)")
      .eq("id", parsed.data.goalId)
      .eq("status", "active")
      .maybeSingle();
    if (!goal)
      return NextResponse.json(
        { message: "The selected goal is unavailable." },
        { status: 403 },
      );
    const metric = goal.venture_metrics as unknown as {
      id: string;
      unit: MetricUnit;
      direction: MetricDirection;
      cadence: "weekly" | "monthly" | "quarterly";
      category: string;
      name: string;
    } | null;
    if (!metric)
      return NextResponse.json(
        { message: "The goal metric is unavailable." },
        { status: 422 },
      );
    const { data: observations } = await supabase
      .from("metric_observations")
      .select("value,observed_on,verification_state,evidence_id")
      .eq("metric_id", goal.metric_id)
      .order("observed_on", { ascending: true });

    const today = new Date().toISOString().slice(0, 10);
    const asOfDate = parsed.data.asOfDate ?? today;
    if (asOfDate > today)
      return NextResponse.json(
        { message: "The projection as-of date cannot be in the future." },
        { status: 422 },
      );
    const assumptions = scenarioInputs(goal.scenario_inputs);
    let result;
    try {
      result = calculateGoalProjection({
        goalId: goal.id,
        asOfDate,
        dueDate: goal.target_date,
        baselineValue: Number(goal.baseline_value),
        targetValue: Number(goal.target_value),
        direction: metric.direction,
        unit: metric.unit,
        scenario: parsed.data.scenario as ProjectionScenario,
        expectedMonthlyChange: assumptions.expectedMonthlyChange ?? 0,
        monthlyVolatility: assumptions.monthlyVolatility ?? 0,
        cadence: metric.cadence,
        observations: (observations ?? []).map((observation) => ({
          value: Number(observation.value),
          observedOn: observation.observed_on,
          verified: observation.verification_state !== "self_reported",
          evidenceLinked: Boolean(observation.evidence_id),
        })),
      });
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "The projection inputs could not be calculated.",
        },
        { status: 422 },
      );
    }

    const { data: activeModel } = await supabase
      .from("projection_model_versions")
      .select("version")
      .eq("active", true)
      .maybeSingle();
    if (activeModel?.version !== PROJECTION_MODEL_VERSION)
      return NextResponse.json(
        { message: "The active projection model is not available in this release." },
        { status: 503 },
      );

    const admin = createAdminClient();
    const staleDays =
      metric.cadence === "weekly" ? 14 : metric.cadence === "monthly" ? 45 : 120;
    const { data: saved, error } = await admin
      .from("projection_runs")
      .insert({
        goal_id: goal.id,
        venture_id: goal.venture_id,
        created_by: auth.user.id,
        model_version: result.modelVersion,
        scenario: parsed.data.scenario,
        horizon_months: result.horizonMonths,
        input_hash: result.inputHash,
        input_kind: result.inputKind,
        probability: result.probability,
        confidence: result.confidence,
        status_band: result.status,
        indexed_series: indexedSeries(result.forecast, Number(goal.baseline_value)),
        exact_series: result.forecast,
        drivers: result.drivers,
        limitations: result.limitations,
        sensitivity: result.sensitivity,
        input_summary: {
          metric: metric.name,
          category: metric.category,
          unit: metric.unit,
          direction: metric.direction,
          observationCount: observations?.length ?? 0,
          asOfDate,
          dueDate: goal.target_date,
          assumptions,
        },
        expected_target_date: result.expectedTargetDate,
        stale_after: new Date(Date.now() + staleDays * 86_400_000).toISOString(),
      })
      .select("id")
      .single();
    if (error || !saved)
      return NextResponse.json(
        { message: "The projection was calculated but could not be saved." },
        { status: 500 },
      );

    return NextResponse.json({
      data: { ...result, id: saved.id },
      advisory: true,
      source: "deterministic",
    });
  } catch {
    return NextResponse.json(
      { message: "Projection calculation is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export const maxDuration = 30;
