import { NextResponse } from "next/server";
import {
  calculateGoalProjection,
  type MetricDirection,
  type MetricUnit,
  type ProjectionScenario,
} from "@/lib/projections";
import { createAdminClient } from "@/lib/supabase/admin";

function assumptions(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { expectedMonthlyChange: 0, monthlyVolatility: 0 };
  const record = value as Record<string, unknown>;
  return {
    expectedMonthlyChange:
      typeof record.expectedMonthlyChange === "number"
        ? record.expectedMonthlyChange
        : 0,
    monthlyVolatility:
      typeof record.monthlyVolatility === "number"
        ? record.monthlyVolatility
        : 0,
    customerAcquisitionPerMonth:
      typeof record.customerAcquisitionPerMonth === "number"
        ? record.customerAcquisitionPerMonth
        : undefined,
    retentionPercent:
      typeof record.retentionPercent === "number"
        ? record.retentionPercent
        : undefined,
    monthlyBurnAmount:
      typeof record.monthlyBurnAmount === "number"
        ? record.monthlyBurnAmount
        : undefined,
    milestoneReliability:
      typeof record.milestoneReliability === "number"
        ? record.milestoneReliability
        : undefined,
    evidenceCadencePerMonth:
      typeof record.evidenceCadencePerMonth === "number"
        ? record.evidenceCadencePerMonth
        : undefined,
  };
}

function indexForecast(
  forecast: Array<{ month: number; date: string; p10: number; p50: number; p90: number }>,
  baseline: number,
) {
  const denominator = Math.max(Math.abs(baseline), 1);
  return forecast.map((point) => ({
    ...point,
    p10: Math.round((point.p10 / denominator) * 10_000) / 100,
    p50: Math.round((point.p50 / denominator) * 10_000) / 100,
    p90: Math.round((point.p90 / denominator) * 10_000) / 100,
  }));
}

async function notifyStale(
  admin: ReturnType<typeof createAdminClient>,
  run: { id: string; created_by: string },
  goalLabel: string,
) {
  const { data: prior } = await admin
    .from("product_events")
    .select("id")
    .eq("user_id", run.created_by)
    .eq("event_name", "projection_stale")
    .contains("properties", { runId: run.id })
    .maybeSingle();
  if (prior) return;
  await Promise.all([
    admin.from("notifications").insert({
      user_id: run.created_by,
      kind: "projection_stale",
      title: "Projection needs a fresh observation",
      body: `${goalLabel} is now stale. Record a current actual before recalculating.`,
      link: "/workspace/founder/projections",
    } as never),
    admin.from("product_events").insert({
      user_id: run.created_by,
      event_name: "projection_stale",
      properties: { runId: run.id },
    } as never),
  ]);
}

async function runProjectionRefresh(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const admin = createAdminClient();
  const { data: flag } = await admin
    .from("feature_flags")
    .select("enabled")
    .eq("key", "venture_projections")
    .maybeSingle();
  if (!flag?.enabled)
    return NextResponse.json({ ok: true, refreshed: 0, stale: 0, disabled: true });

  const { data: goals, error: goalError } = await admin
    .from("projection_goals")
    .select("*")
    .eq("status", "active")
    .limit(50);
  if (goalError)
    return NextResponse.json({ message: "Projection refresh query failed." }, { status: 500 });
  const goalIds = (goals ?? []).map((goal) => goal.id);
  if (!goalIds.length)
    return NextResponse.json({ ok: true, refreshed: 0, stale: 0 });
  const metricIds = [...new Set((goals ?? []).map((goal) => goal.metric_id))];
  const [{ data: metrics }, { data: observations }, { data: runRows }] =
    await Promise.all([
      admin.from("venture_metrics").select("*").in("id", metricIds),
      admin
        .from("metric_observations")
        .select("*")
        .in("metric_id", metricIds)
        .order("observed_on", { ascending: true }),
      admin
        .from("projection_runs")
        .select("*")
        .in("goal_id", goalIds)
        .order("calculated_at", { ascending: false }),
    ]);
  const metricById = new Map((metrics ?? []).map((metric) => [metric.id, metric]));
  const latestRunByGoal = new Map<string, NonNullable<typeof runRows>[number]>();
  for (const run of runRows ?? [])
    if (!latestRunByGoal.has(run.goal_id)) latestRunByGoal.set(run.goal_id, run);

  const today = new Date().toISOString().slice(0, 10);
  let refreshed = 0;
  let stale = 0;
  for (const goal of goals ?? []) {
    const previous = latestRunByGoal.get(goal.id);
    const metric = metricById.get(goal.metric_id);
    if (!previous || !metric || previous.stale_after > new Date().toISOString()) continue;
    const metricObservations = (observations ?? []).filter(
      (item) => item.metric_id === goal.metric_id,
    );
    const changed = metricObservations.some(
      (item) => item.created_at > previous.calculated_at,
    );
    if (!changed || goal.target_date <= today) {
      stale += 1;
      await notifyStale(admin, previous, goal.label);
      continue;
    }
    const inputAssumptions = assumptions(goal.scenario_inputs);
    let result;
    try {
      result = calculateGoalProjection({
        goalId: goal.id,
        asOfDate: today,
        dueDate: goal.target_date,
        baselineValue: Number(goal.baseline_value),
        targetValue: Number(goal.target_value),
        direction: metric.direction as MetricDirection,
        unit: metric.unit as MetricUnit,
        scenario: previous.scenario as ProjectionScenario,
        expectedMonthlyChange: inputAssumptions.expectedMonthlyChange,
        monthlyVolatility: inputAssumptions.monthlyVolatility,
        cadence: metric.cadence as "weekly" | "monthly" | "quarterly",
        observations: metricObservations.map((item) => ({
          value: Number(item.value),
          observedOn: item.observed_on,
          verified: item.verification_state !== "self_reported",
          evidenceLinked: Boolean(item.evidence_id),
        })),
      });
    } catch {
      stale += 1;
      await notifyStale(admin, previous, goal.label);
      continue;
    }
    const staleDays =
      metric.cadence === "weekly" ? 14 : metric.cadence === "monthly" ? 45 : 120;
    const { error } = await admin.from("projection_runs").insert({
      goal_id: goal.id,
      venture_id: goal.venture_id,
      created_by: previous.created_by,
      model_version: result.modelVersion,
      scenario: previous.scenario,
      horizon_months: result.horizonMonths,
      input_hash: result.inputHash,
      input_kind: result.inputKind,
      probability: result.probability,
      confidence: result.confidence,
      status_band: result.status,
      indexed_series: indexForecast(result.forecast, Number(goal.baseline_value)),
      exact_series: result.forecast,
      drivers: result.drivers,
      limitations: result.limitations,
      sensitivity: result.sensitivity,
      input_summary: {
        metric: metric.name,
        unit: metric.unit,
        direction: metric.direction,
        observationCount: metricObservations.length,
        asOfDate: today,
        dueDate: goal.target_date,
        automatedRefresh: true,
        assumptions: inputAssumptions,
      },
      expected_target_date: result.expectedTargetDate,
      stale_after: new Date(Date.now() + staleDays * 86_400_000).toISOString(),
    });
    if (!error) refreshed += 1;
  }
  return NextResponse.json({ ok: true, refreshed, stale });
}

export const GET = runProjectionRefresh;
export const POST = runProjectionRefresh;
export const maxDuration = 60;
