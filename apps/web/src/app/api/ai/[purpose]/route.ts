import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { runStructuredAi } from "@/lib/ai/openai";
import type { AiPurpose } from "@/lib/ai/schemas";
import { unexpectedEvidenceIds } from "@/lib/ai/validation";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin } from "@/lib/request-security";

const bodySchema = z.object({
  ventureId: z.string().uuid().nullable().optional(),
  matchId: z.string().uuid().nullable().optional(),
  projectionRunId: z.string().uuid().nullable().optional(),
  evidenceIds: z.array(z.string().uuid()).max(20).default([]),
  consent: z.literal(true),
  includeExactFinancials: z.boolean().default(false),
  content: z.unknown(),
});
const purposes = new Set<AiPurpose>([
  "readiness_review",
  "evidence_summary",
  "match_explanation",
  "projection_explanation",
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ purpose: string }> },
) {
  try {
    assertSameOrigin(request);
    const { purpose: rawPurpose } = await context.params;
    if (!purposes.has(rawPurpose as AiPurpose))
      return NextResponse.json(
        { message: "Unknown AI purpose." },
        { status: 404 },
      );
    const purpose = rawPurpose as AiPurpose;
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { message: "Explicit consent and valid input are required." },
        { status: 422 },
      );
    if (JSON.stringify(parsed.data.content).length > 45_000) {
      return NextResponse.json(
        { message: "The selected content is too large for one AI request." },
        { status: 413 },
      );
    }
    if (
      purpose === "evidence_summary" &&
      parsed.data.evidenceIds.length === 0
    ) {
      return NextResponse.json(
        { message: "Select at least one clean evidence item to summarize." },
        { status: 422 },
      );
    }
    if (purpose === "evidence_summary" && parsed.data.evidenceIds.length > 5) {
      return NextResponse.json(
        { message: "Select no more than five evidence items per summary." },
        { status: 422 },
      );
    }
    if (purpose === "readiness_review" && !parsed.data.ventureId) {
      return NextResponse.json(
        { message: "Choose a venture to review." },
        { status: 422 },
      );
    }
    if (purpose === "match_explanation" && !parsed.data.matchId) {
      return NextResponse.json(
        { message: "Choose a calculated match to explain." },
        { status: 422 },
      );
    }
    if (purpose === "projection_explanation" && !parsed.data.projectionRunId) {
      return NextResponse.json(
        { message: "Choose a saved projection to explain." },
        { status: 422 },
      );
    }
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
        .eq(
          "key",
          purpose === "projection_explanation"
            ? "projection_ai"
            : "ai_assistance",
        )
        .maybeSingle(),
      supabase.rpc("check_rate_limit", {
        p_key: `ai:${auth.user.id}`,
        p_limit: 12,
        p_window_seconds: 3600,
      }),
    ]);
    if (!flag?.enabled)
      return NextResponse.json(
        {
          message:
            "AI assistance is not enabled for this pilot. Deterministic results remain available.",
          source: "deterministic",
        },
        { status: 503 },
      );
    if (!allowed)
      return NextResponse.json(
        {
          message:
            "AI assistance limit reached. Try again later; deterministic results remain available.",
        },
        { status: 429 },
      );

    if (parsed.data.ventureId) {
      const { data: accessibleVenture } = await supabase
        .from("ventures")
        .select("id")
        .eq("id", parsed.data.ventureId)
        .maybeSingle();
      if (!accessibleVenture) {
        return NextResponse.json(
          { message: "The selected venture is unavailable." },
          { status: 403 },
        );
      }
    }

    let aiContent = parsed.data.content;
    if (parsed.data.evidenceIds.length) {
      const { data: accessible } = await supabase
        .from("evidence_items")
        .select("id,title,status,extracted_text,source_pages")
        .in("id", parsed.data.evidenceIds)
        .eq("status", "ready");
      if ((accessible?.length ?? 0) !== parsed.data.evidenceIds.length)
        return NextResponse.json(
          {
            message: "One or more evidence items are unavailable or not clean.",
          },
          { status: 403 },
        );
      if (purpose === "evidence_summary") {
        aiContent = accessible?.map((item) => ({
          evidenceId: item.id,
          title: item.title,
          text: item.extracted_text?.slice(0, 8_000) ?? null,
          sourcePages: item.source_pages,
        }));
      }
    }

    if (purpose === "readiness_review" && parsed.data.ventureId) {
      const [{ data: venture }, { data: sections }, { data: claims }] =
        await Promise.all([
          supabase
            .from("ventures")
            .select(
              "tagline,sector,stage,region,funding_need_min,funding_need_max,traction_level,impact_goals",
            )
            .eq("id", parsed.data.ventureId)
            .single(),
          supabase
            .from("venture_sections")
            .select("dimension,state,content")
            .eq("venture_id", parsed.data.ventureId),
          supabase
            .from("claims")
            .select("dimension,statement")
            .eq("venture_id", parsed.data.ventureId)
            .eq("status", "active"),
        ]);
      aiContent = { venture, sections, claims };
    }

    if (purpose === "match_explanation" && parsed.data.matchId) {
      const { data: match } = await supabase
        .from("match_snapshots")
        .select(
          "venture_id,rubric_version,compatibility_score,factors,reasons,mismatches,eligible",
        )
        .eq("id", parsed.data.matchId)
        .eq("reviewer_id", auth.user.id)
        .maybeSingle();
      if (
        !match ||
        (parsed.data.ventureId && match.venture_id !== parsed.data.ventureId)
      ) {
        return NextResponse.json(
          { message: "The selected match is unavailable." },
          { status: 403 },
        );
      }
      aiContent = match;
    }

    if (purpose === "projection_explanation" && parsed.data.projectionRunId) {
      const { data: ownedRun } = await supabase
        .from("projection_runs")
        .select(
          "id,venture_id,model_version,scenario,horizon_months,input_kind,probability,confidence,status_band,indexed_series,exact_series,drivers,limitations,sensitivity,input_summary,expected_target_date,calculated_at",
        )
        .eq("id", parsed.data.projectionRunId)
        .maybeSingle();
      if (ownedRun) {
        if (
          parsed.data.ventureId &&
          ownedRun.venture_id !== parsed.data.ventureId
        )
          return NextResponse.json(
            { message: "The selected projection is unavailable." },
            { status: 403 },
          );
        aiContent = {
          ...ownedRun,
          series: parsed.data.includeExactFinancials
            ? ownedRun.exact_series
            : ownedRun.indexed_series,
          exact_series: undefined,
          indexed_series: undefined,
          financialValues: parsed.data.includeExactFinancials
            ? "explicitly included"
            : "indexed",
        };
      } else {
        const { data: sharedRun, error: sharedError } = await supabase.rpc(
          "get_shared_projection",
          { p_run_id: parsed.data.projectionRunId },
        );
        if (sharedError || !sharedRun)
          return NextResponse.json(
            { message: "The selected projection is unavailable." },
            { status: 403 },
          );
        const shared = sharedRun as Record<string, unknown>;
        if (
          parsed.data.ventureId &&
          shared.ventureId !== parsed.data.ventureId
        )
          return NextResponse.json(
            { message: "The selected projection is unavailable." },
            { status: 403 },
          );
        aiContent = {
          ...shared,
          series:
            parsed.data.includeExactFinancials && shared.exactSeries
              ? shared.exactSeries
              : shared.indexedSeries,
          exactSeries: undefined,
          indexedSeries: undefined,
          financialValues:
            parsed.data.includeExactFinancials && shared.exactSeries
              ? "explicitly included"
              : "indexed",
        };
      }
    }

    await supabase.from("consent_records").insert({
      user_id: auth.user.id,
      purpose,
      granted: true,
      evidence_ids: parsed.data.evidenceIds,
    } as never);
    const aiInput = {
      evidenceIds: parsed.data.evidenceIds,
      content: aiContent,
    };
    const fallbackHash = createHash("sha256")
      .update(JSON.stringify(aiInput).slice(0, 45_000))
      .digest("hex");
    let result: Awaited<ReturnType<typeof runStructuredAi>>;
    const startedAt = Date.now();
    const promptVersion =
      purpose === "projection_explanation" ? "2026.2" : "2026.1";
    try {
      result = await runStructuredAi(purpose, aiInput);
    } catch {
      await supabase.from("ai_runs").insert({
        user_id: auth.user.id,
        venture_id: parsed.data.ventureId ?? null,
        purpose,
        model: process.env.OPENAI_MODEL ?? "gpt-6-astra",
        prompt_version: promptVersion,
        input_hash: fallbackHash,
        evidence_ids: parsed.data.evidenceIds,
        status: "failed",
        latency_ms: Date.now() - startedAt,
        usage: {},
      } as never);
      return NextResponse.json(
        {
          message:
            "AI assistance is temporarily unavailable. No authoritative result was changed.",
        },
        { status: 503 },
      );
    }
    if (!result.available) {
      await supabase.from("ai_runs").insert({
        user_id: auth.user.id,
        venture_id: parsed.data.ventureId ?? null,
        purpose,
        model: result.model,
        prompt_version: promptVersion,
        input_hash: result.inputHash,
        evidence_ids: parsed.data.evidenceIds,
        status: "unavailable",
        latency_ms: null,
        usage: {},
      } as never);
      return NextResponse.json(
        {
          message:
            "AI assistance is not configured. Your deterministic readiness and match results remain available.",
          source: "deterministic",
        },
        { status: 503 },
      );
    }

    const unexpected = unexpectedEvidenceIds(
      result.output,
      parsed.data.evidenceIds,
    );
    if (unexpected.length) {
      await supabase.from("ai_runs").insert({
        user_id: auth.user.id,
        venture_id: parsed.data.ventureId ?? null,
        purpose,
        model: result.model,
        prompt_version: promptVersion,
        input_hash: result.inputHash,
        evidence_ids: parsed.data.evidenceIds,
        status: "invalid_output",
        latency_ms: result.latencyMs,
        usage: (result.usage ?? {}) as never,
      } as never);
      return NextResponse.json(
        {
          message:
            "The AI response failed evidence validation. No result was changed.",
        },
        { status: 503 },
      );
    }
    await supabase.from("ai_runs").insert({
      user_id: auth.user.id,
      venture_id: parsed.data.ventureId ?? null,
      purpose,
      model: result.model,
      prompt_version: promptVersion,
      input_hash: result.inputHash,
      evidence_ids: parsed.data.evidenceIds,
      status: "completed",
      latency_ms: result.latencyMs,
      usage: (result.usage ?? {}) as never,
    } as never);
    return NextResponse.json({
      data: result.output,
      advisory: true,
      source: "openai",
      model: result.model,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "AI assistance is temporarily unavailable. No readiness or match score was changed.",
      },
      { status: 503 },
    );
  }
}
