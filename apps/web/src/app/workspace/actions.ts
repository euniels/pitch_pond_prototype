"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { sendInvitationEmail, sendProductEmail } from "@/lib/email";
import { calculateMatch, matchRubricSchema } from "@/lib/matching";
import { createEmptyReadiness } from "@/lib/readiness";
import {
  claimEvidenceLinkSchema,
  claimSchema,
  invitationSchema,
  milestoneSchema,
  readinessSectionSchema,
  thesisSchema,
  ventureSchema,
} from "@/lib/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InvestorThesis, VentureProfile } from "@/lib/domain";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

function fields(formData: FormData, names: string[]) {
  return Object.fromEntries(names.map((name) => [name, formData.get(name)]));
}

async function requireMfaPlatformAdmin() {
  const context = await requireUser();
  const [assurance, memberships] = await Promise.all([
    context.supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    context.supabase
      .from("organization_memberships")
      .select("role")
      .eq("user_id", context.user.id),
  ]);
  if (
    assurance.data?.currentLevel !== "aal2" ||
    !memberships.data?.some(
      (membership) => membership.role === "platform_admin",
    )
  ) {
    throw new Error("Platform administrator access with MFA is required.");
  }
  return context;
}

export async function saveVentureAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const raw = fields(formData, [
    "organizationId",
    "name",
    "tagline",
    "sector",
    "stage",
    "region",
    "city",
    "fundingNeedMin",
    "fundingNeedMax",
    "tractionLevel",
    "riskLevel",
  ]);
  const parsed = ventureSchema.safeParse({
    ...raw,
    impactGoals: formData.getAll("impactGoals"),
    consentToMatch: formData.get("consentToMatch") === "on",
  });
  if (!parsed.success)
    return {
      ok: false,
      message: "Review the highlighted venture fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  const value = parsed.data;
  const { data: previous } = await supabase
    .from("ventures")
    .select("consent_to_match")
    .eq("organization_id", value.organizationId)
    .maybeSingle();
  const { error } = await supabase.from("ventures").upsert(
    {
      organization_id: value.organizationId,
      name: value.name,
      tagline: value.tagline,
      sector: value.sector,
      stage: value.stage,
      region: value.region,
      city: value.city || null,
      funding_need_min: value.fundingNeedMin,
      funding_need_max: value.fundingNeedMax,
      traction_level: value.tractionLevel,
      risk_level: value.riskLevel,
      impact_goals: value.impactGoals,
      consent_to_match: value.consentToMatch,
    } as never,
    { onConflict: "organization_id" },
  );
  if (error) return { ok: false, message: error.message };
  if (!previous || previous.consent_to_match !== value.consentToMatch) {
    await supabase.from("consent_records").insert({
      user_id: user.id,
      purpose: "venture_matching",
      granted: value.consentToMatch,
      evidence_ids: [],
    } as never);
  }
  revalidatePath("/workspace");
  return { ok: true, message: "Venture profile saved." };
}

export async function saveThesisAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const parsed = thesisSchema.safeParse({
    organizationId: formData.get("organizationId") || null,
    sectors: formData.getAll("sectors"),
    stages: formData.getAll("stages"),
    regions: formData.getAll("regions"),
    ticketMin: Number(formData.get("ticketMin")),
    ticketMax: Number(formData.get("ticketMax")),
    minimumTraction: Number(formData.get("minimumTraction")),
    impactGoals: formData.getAll("impactGoals"),
    riskTolerance: Number(formData.get("riskTolerance")),
    excludedSectors: formData.getAll("excludedSectors"),
    mentorshipOnly: formData.get("mentorshipOnly") === "on",
  });
  if (!parsed.success)
    return {
      ok: false,
      message: "Review the thesis fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  const value = parsed.data;
  const { error } = await supabase.from("investor_theses").upsert(
    {
      owner_id: user.id,
      organization_id: value.organizationId ?? null,
      sectors: value.sectors,
      stages: value.stages,
      regions: value.regions,
      ticket_min: value.ticketMin,
      ticket_max: value.ticketMax,
      minimum_traction: value.minimumTraction,
      impact_goals: value.impactGoals,
      risk_tolerance: value.riskTolerance,
      excluded_sectors: value.excludedSectors,
      mentorship_only: value.mentorshipOnly,
    } as never,
    { onConflict: "owner_id" },
  );
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace");
  return { ok: true, message: "Investor thesis saved." };
}

export async function saveReadinessSectionAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const parsed = readinessSectionSchema.safeParse(
    fields(formData, ["ventureId", "dimension", "summary"]),
  );
  if (!parsed.success) {
    return {
      ok: false,
      message: "Add a focused summary of at least 20 characters.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const { error } = await supabase.from("venture_sections").upsert(
    {
      venture_id: parsed.data.ventureId,
      dimension: parsed.data.dimension,
      state: "in_progress",
      content: { summary: parsed.data.summary },
      reviewed_by: null,
      reviewed_at: null,
    } as never,
    { onConflict: "venture_id,dimension" },
  );
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace/founder");
  return { ok: true, message: "Readiness section saved for review." };
}

export async function createClaimAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const parsed = claimSchema.safeParse(
    fields(formData, ["ventureId", "dimension", "statement"]),
  );
  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter a valid claim of at least 20 characters.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const { error } = await supabase.from("claims").insert({
    venture_id: parsed.data.ventureId,
    created_by: user.id,
    dimension: parsed.data.dimension,
    statement: parsed.data.statement,
    status: "active",
  } as never);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace/founder");
  return {
    ok: true,
    message: "Claim added. Link evidence when it is available.",
  };
}

export async function createMilestoneAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const parsed = milestoneSchema.safeParse(
    fields(formData, [
      "ventureId",
      "title",
      "occurredOn",
      "status",
      "evidenceId",
    ]),
  );
  if (!parsed.success) {
    return {
      ok: false,
      message: "Review the milestone details.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const { error } = await supabase.from("milestones").insert({
    venture_id: parsed.data.ventureId,
    created_by: user.id,
    title: parsed.data.title,
    occurred_on: parsed.data.occurredOn || null,
    status: parsed.data.status,
    evidence_id: parsed.data.evidenceId || null,
  } as never);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace/founder");
  return { ok: true, message: "Milestone added." };
}

export async function linkClaimEvidenceAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const parsed = claimEvidenceLinkSchema.safeParse(
    fields(formData, ["claimId", "evidenceId"]),
  );
  if (!parsed.success)
    return { ok: false, message: "Choose a valid claim and evidence item." };
  const { error } = await supabase.from("claim_evidence_links").insert({
    claim_id: parsed.data.claimId,
    evidence_id: parsed.data.evidenceId,
    linked_by: user.id,
  } as never);
  if (error) return { ok: false, message: error.message };
  const [{ data: claim }, { data: cleanEvidence }] = await Promise.all([
    supabase
      .from("claims")
      .select("venture_id,dimension")
      .eq("id", parsed.data.claimId)
      .single(),
    supabase
      .from("evidence_items")
      .select("id")
      .eq("id", parsed.data.evidenceId)
      .eq("status", "ready")
      .maybeSingle(),
  ]);
  if (claim && cleanEvidence) {
    await supabase
      .from("venture_sections")
      .update({ state: "evidence_linked" })
      .eq("venture_id", claim.venture_id)
      .eq("dimension", claim.dimension)
      .neq("state", "reviewed");
  }
  revalidatePath("/workspace/founder");
  return { ok: true, message: "Evidence linked to the claim." };
}

export async function revealVentureAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const ventureId = String(formData.get("ventureId"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (
    !/^[0-9a-f-]{36}$/i.test(ventureId) ||
    reason.length < 10 ||
    reason.length > 240
  )
    throw new Error("A valid venture and review reason are required.");
  const { error } = await supabase
    .from("blind_reveals")
    .insert({ venture_id: ventureId, reviewer_id: user.id, reason } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/workspace");
}

export async function refreshMatchesAction(
  _: ActionState,
): Promise<ActionState> {
  void _;
  const { supabase, user } = await requireUser();
  const [{ data: memberships }, { data: thesis }] = await Promise.all([
    supabase
      .from("organization_memberships")
      .select("role")
      .eq("user_id", user.id),
    supabase
      .from("investor_theses")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle(),
  ]);
  if (
    !memberships?.some((membership) =>
      ["investor_mentor", "platform_admin"].includes(membership.role),
    )
  ) {
    return { ok: false, message: "Investor or mentor access is required." };
  }
  if (!thesis)
    return {
      ok: false,
      message: "Save an investor thesis before calculating matches.",
    };
  const { data: allowed } = await supabase.rpc("check_rate_limit", {
    p_key: "match-refresh",
    p_limit: 6,
    p_window_seconds: 3600,
  });
  if (!allowed) {
    return {
      ok: false,
      message: "Match refresh limit reached. Try again later.",
    };
  }

  const admin = createAdminClient();
  const [{ data: candidates, error: candidateError }, { data: activeRubric }] =
    await Promise.all([
      admin
        .from("ventures")
        .select("*")
        .eq("consent_to_match", true)
        .is("deletion_requested_at", null),
      admin
        .from("matching_rubrics")
        .select("version,weights")
        .eq("active", true)
        .maybeSingle(),
    ]);
  const rubric = matchRubricSchema.safeParse(activeRubric);
  if (candidateError || !rubric.success)
    return { ok: false, message: "Matching is temporarily unavailable." };

  const thesisInput: InvestorThesis = {
    id: thesis.id,
    sectors: thesis.sectors,
    stages: thesis.stages,
    regions: thesis.regions,
    ticketMin: Number(thesis.ticket_min),
    ticketMax: Number(thesis.ticket_max),
    minimumTraction: thesis.minimum_traction,
    impactGoals: thesis.impact_goals,
    riskTolerance: thesis.risk_tolerance,
    excludedSectors: thesis.excluded_sectors,
    mentorshipOnly: thesis.mentorship_only,
  };
  const snapshots = (candidates ?? []).flatMap((candidate) => {
    const venture: VentureProfile = {
      id: candidate.id,
      name: candidate.name,
      tagline: candidate.tagline,
      sector: candidate.sector,
      stage: candidate.stage,
      region: candidate.region,
      city: candidate.city ?? undefined,
      fundingNeedMin: Number(candidate.funding_need_min),
      fundingNeedMax: Number(candidate.funding_need_max),
      tractionLevel: candidate.traction_level,
      impactGoals: candidate.impact_goals,
      riskLevel: candidate.risk_level,
      consentToMatch: candidate.consent_to_match,
      readiness: createEmptyReadiness(),
    };
    const result = calculateMatch(venture, thesisInput, rubric.data);
    if (!result.eligible) return [];
    return [
      {
        venture_id: candidate.id,
        thesis_id: thesis.id,
        reviewer_id: user.id,
        rubric_version: result.rubricVersion,
        compatibility_score: result.score,
        factors: result.factors,
        reasons: result.reasons,
        mismatches: result.mismatches,
        eligible: true,
      },
    ];
  });
  const { error: insertError } = snapshots.length
    ? await admin.from("match_snapshots").insert(snapshots)
    : { error: null };
  if (insertError) return { ok: false, message: "Matches could not be saved." };
  await admin.from("audit_events").insert({
    actor_id: user.id,
    action: "matches_calculated",
    entity_type: "investor_thesis",
    entity_id: thesis.id,
    metadata: {
      rubric_version: rubric.data.version,
      eligible_matches: snapshots.length,
    },
  });
  revalidatePath("/workspace/investor");
  return {
    ok: true,
    message: snapshots.length
      ? `${snapshots.length} consented match${snapshots.length === 1 ? "" : "es"} calculated.`
      : "No eligible consented ventures matched the current thesis.",
  };
}

export async function setMatchDispositionAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const matchId = String(formData.get("matchId") ?? "");
  const disposition = String(formData.get("disposition") ?? "");
  if (
    !/^[0-9a-f-]{36}$/i.test(matchId) ||
    !["saved", "dismissed"].includes(disposition)
  ) {
    throw new Error("Invalid match action.");
  }
  const { error } = await supabase
    .from("saved_matches")
    .upsert({ match_id: matchId, user_id: user.id, disposition } as never, {
      onConflict: "match_id,user_id",
    });
  if (error) throw new Error(error.message);
  revalidatePath("/workspace/investor");
}

export async function createPrivateNoteAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const ventureId = String(formData.get("ventureId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (
    !/^[0-9a-f-]{36}$/i.test(ventureId) ||
    body.length < 3 ||
    body.length > 4000
  ) {
    return {
      ok: false,
      message: "Enter a private note between 3 and 4,000 characters.",
    };
  }
  const { error } = await supabase.from("notes").insert({
    author_id: user.id,
    venture_id: ventureId,
    body,
  } as never);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace/investor");
  return {
    ok: true,
    message: "Private note saved. It is visible only to you.",
  };
}

export async function requestMatchIntroductionAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const matchId = String(formData.get("matchId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (
    !/^[0-9a-f-]{36}$/i.test(matchId) ||
    message.length < 20 ||
    message.length > 1200
  ) {
    return {
      ok: false,
      message:
        "Add a clear introduction message between 20 and 1,200 characters.",
    };
  }
  const { data: match } = await supabase
    .from("match_snapshots")
    .select("id,venture_id,thesis_id,reviewer_id,eligible")
    .eq("id", matchId)
    .eq("reviewer_id", user.id)
    .eq("eligible", true)
    .maybeSingle();
  if (!match)
    return {
      ok: false,
      message: "This eligible match is no longer available.",
    };
  const admin = createAdminClient();
  const { data: venture } = await admin
    .from("ventures")
    .select("organization_id")
    .eq("id", match.venture_id)
    .single();
  const { data: founder } = venture
    ? await admin
        .from("organization_memberships")
        .select("user_id")
        .eq("organization_id", venture.organization_id)
        .eq("role", "founder")
        .limit(1)
        .maybeSingle()
    : { data: null };
  if (!founder)
    return {
      ok: false,
      message: "No founder contact is available for this venture.",
    };
  const { error } = await admin.from("introductions").insert({
    venture_id: match.venture_id,
    thesis_id: match.thesis_id,
    requested_by: user.id,
    recipient_id: founder.user_id,
    status: "requested",
    message,
  });
  if (error)
    return {
      ok: false,
      message: "The introduction request could not be created.",
    };
  await admin.from("notifications").insert({
    user_id: founder.user_id,
    kind: "introduction_requested",
    title: "A reviewer requested an introduction",
    body: "Review the request in your private PitchPond workspace.",
    link: "/workspace/founder",
  });
  const founderAccount = await admin.auth.admin.getUserById(founder.user_id);
  if (founderAccount.data.user?.email) {
    await sendProductEmail({
      email: founderAccount.data.user.email,
      subject: "New PitchPond introduction request",
      text: "A matched reviewer requested an introduction. Your identity and contact details remain private until you accept in PitchPond.",
    });
  }
  revalidatePath("/workspace/investor");
  return {
    ok: true,
    message:
      "Introduction requested. The founder must consent before contact is shared.",
  };
}

export async function createInvitationAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.data?.currentLevel !== "aal2")
    return {
      ok: false,
      message: "Multi-factor authentication is required for invitations.",
    };
  const parsed = invitationSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    organizationId: formData.get("organizationId") || null,
  });
  if (!parsed.success)
    return {
      ok: false,
      message: "Enter a valid invitation.",
      errors: parsed.error.flatten().fieldErrors,
    };
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { error } = await supabase.from("invitations").insert({
    email: parsed.data.email.toLowerCase(),
    token_hash: tokenHash,
    role: parsed.data.role,
    organization_id: parsed.data.organizationId,
    expires_at: expiresAt,
    invited_by: user.id,
  } as never);
  if (error) return { ok: false, message: error.message };
  await sendInvitationEmail({
    email: parsed.data.email,
    inviter: user.email ?? "A PitchPond pilot administrator",
    role: parsed.data.role,
    inviteUrl: `${publicEnv.siteUrl}/invite/${token}`,
  });
  revalidatePath("/workspace");
  return {
    ok: true,
    message:
      "Invitation created. Email delivery depends on the configured sender.",
  };
}

export async function createOrganizationAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireMfaPlatformAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const region = String(formData.get("region") ?? "").trim();
  if (
    name.length < 2 ||
    name.length > 160 ||
    !["venture", "investor", "institution", "platform"].includes(kind)
  ) {
    return { ok: false, message: "Enter a valid organization name and type." };
  }
  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name,
      kind,
      region: region || null,
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };
  await createAdminClient()
    .from("audit_events")
    .insert({
      actor_id: user.id,
      organization_id: data.id,
      action: "organization_created",
      entity_type: "organization",
      entity_id: data.id,
      metadata: { kind },
    } as never);
  revalidatePath("/workspace/admin");
  return { ok: true, message: "Organization created." };
}

export async function setFeatureFlagAction(formData: FormData) {
  const { supabase, user } = await requireMfaPlatformAdmin();
  const key = String(formData.get("key") ?? "");
  const enabled = formData.get("enabled") === "true";
  if (!/^[a-z0-9_]{2,80}$/.test(key)) throw new Error("Invalid feature flag.");
  const { error } = await supabase
    .from("feature_flags")
    .update({
      enabled,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key);
  if (error) throw new Error(error.message);
  await createAdminClient()
    .from("audit_events")
    .insert({
      actor_id: user.id,
      action: "feature_flag_updated",
      entity_type: "feature_flag",
      metadata: { key, enabled },
    } as never);
  revalidatePath("/workspace/admin");
}

export async function activateMatchingRubricAction(formData: FormData) {
  const { supabase } = await requireMfaPlatformAdmin();
  const version = String(formData.get("version") ?? "");
  if (!/^[a-z0-9._-]{1,40}$/i.test(version))
    throw new Error("Invalid matching rubric version.");
  const { error } = await supabase.rpc("activate_matching_rubric", {
    p_version: version,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/workspace/admin");
}

export async function assignPlanAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireMfaPlatformAdmin();
  const organizationId = String(formData.get("organizationId") ?? "");
  const planId = String(formData.get("planId") ?? "");
  const endsAt = String(formData.get("endsAt") ?? "");
  if (
    !/^[0-9a-f-]{36}$/i.test(organizationId) ||
    !/^[a-z0-9_-]{2,80}$/.test(planId)
  ) {
    return { ok: false, message: "Choose a valid organization and plan." };
  }
  const { error } = await supabase.from("workspace_entitlements").insert({
    organization_id: organizationId,
    plan_id: planId,
    assigned_by: user.id,
    ends_at: endsAt ? new Date(`${endsAt}T23:59:59.999Z`).toISOString() : null,
    features: {},
  } as never);
  if (error) return { ok: false, message: error.message };
  await createAdminClient()
    .from("audit_events")
    .insert({
      actor_id: user.id,
      organization_id: organizationId,
      action: "plan_assigned",
      entity_type: "workspace_entitlement",
      metadata: { plan_id: planId, ends_at: endsAt || null },
    } as never);
  revalidatePath("/workspace/admin");
  return { ok: true, message: "Manual pilot entitlement assigned." };
}

export async function rejectQuarantinedEvidenceAction(formData: FormData) {
  const { user } = await requireMfaPlatformAdmin();
  const evidenceId = String(formData.get("evidenceId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(evidenceId))
    throw new Error("Invalid evidence item.");
  const admin = createAdminClient();
  const { error } = await admin
    .from("evidence_items")
    .update({
      status: "rejected",
      rejection_reason:
        "Rejected by a platform administrator during quarantine review.",
      scanned_at: new Date().toISOString(),
    })
    .eq("id", evidenceId)
    .in("status", ["quarantined", "scanning"]);
  if (error) throw new Error("The quarantined file could not be rejected.");
  await admin.from("audit_events").insert({
    actor_id: user.id,
    action: "quarantined_evidence_rejected",
    entity_type: "evidence_item",
    entity_id: evidenceId,
    metadata: {},
  });
  revalidatePath("/workspace/admin");
}

export async function createCohortAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.data?.currentLevel !== "aal2")
    return {
      ok: false,
      message: "Multi-factor authentication is required to manage cohorts.",
    };
  const organizationId = String(formData.get("organizationId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const startsOn = String(formData.get("startsOn") ?? "") || null;
  const endsOn = String(formData.get("endsOn") ?? "") || null;
  if (
    !/^[0-9a-f-]{36}$/i.test(organizationId) ||
    name.length < 3 ||
    name.length > 140
  )
    return {
      ok: false,
      message: "Enter a valid cohort name and organization.",
    };
  if (startsOn && endsOn && endsOn < startsOn)
    return {
      ok: false,
      message: "The end date must not be before the start date.",
    };
  const { error } = await supabase.from("cohorts").insert({
    organization_id: organizationId,
    name,
    starts_on: startsOn,
    ends_on: endsOn,
    status: "draft",
  } as never);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace/institution");
  return { ok: true, message: "Cohort created as a private draft." };
}

export async function addVentureToCohortAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.data?.currentLevel !== "aal2") {
    return { ok: false, message: "Multi-factor authentication is required." };
  }
  const cohortId = String(formData.get("cohortId") ?? "");
  const ventureId = String(formData.get("ventureId") ?? "");
  if (![cohortId, ventureId].every((value) => /^[0-9a-f-]{36}$/i.test(value))) {
    return {
      ok: false,
      message: "Enter valid cohort and venture identifiers.",
    };
  }
  const { error } = await supabase.from("cohort_ventures").insert({
    cohort_id: cohortId,
    venture_id: ventureId,
  } as never);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace/institution");
  return { ok: true, message: "Venture added to the private cohort." };
}

export async function assignCohortReviewerAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.data?.currentLevel !== "aal2") {
    return { ok: false, message: "Multi-factor authentication is required." };
  }
  const cohortId = String(formData.get("cohortId") ?? "");
  const ventureId = String(formData.get("ventureId") ?? "");
  const reviewerId = String(formData.get("reviewerId") ?? "");
  if (
    ![cohortId, ventureId, reviewerId].every((value) =>
      /^[0-9a-f-]{36}$/i.test(value),
    )
  ) {
    return {
      ok: false,
      message: "Choose a valid cohort venture and reviewer.",
    };
  }
  const { error } = await supabase.from("reviewer_assignments").insert({
    cohort_id: cohortId,
    venture_id: ventureId,
    reviewer_id: reviewerId,
    assigned_by: user.id,
    status: "assigned",
  } as never);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace/institution");
  return { ok: true, message: "Reviewer assigned." };
}

export async function assignCohortReviewerFormAction(formData: FormData) {
  const result = await assignCohortReviewerAction(
    { ok: false, message: "" },
    formData,
  );
  if (!result.ok) throw new Error(result.message);
}

export async function reviewReadinessSectionAction(formData: FormData) {
  const { supabase } = await requireUser();
  const ventureId = String(formData.get("ventureId") ?? "");
  const dimension = String(formData.get("dimension") ?? "");
  if (
    !/^[0-9a-f-]{36}$/i.test(ventureId) ||
    ![
      "problem",
      "market",
      "solution",
      "traction",
      "team",
      "business_model",
      "use_of_funds",
      "financial_readiness",
      "legal_readiness",
    ].includes(dimension)
  )
    throw new Error("Invalid readiness review.");
  const { error } = await supabase.rpc("review_readiness_section", {
    p_venture_id: ventureId,
    p_dimension: dimension,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/workspace/institution");
}

export async function requestIntroductionAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const ventureId = String(formData.get("ventureId") ?? "");
  const recipientId = String(formData.get("recipientId") ?? "");
  const thesisId = String(formData.get("thesisId") ?? "") || null;
  const message = String(formData.get("message") ?? "").trim();
  if (
    ![ventureId, recipientId].every((value) =>
      /^[0-9a-f-]{36}$/i.test(value),
    ) ||
    message.length < 20 ||
    message.length > 1200
  )
    return {
      ok: false,
      message:
        "A valid recipient, venture, and introduction message are required.",
    };
  const { error } = await supabase.from("introductions").insert({
    venture_id: ventureId,
    thesis_id: thesisId,
    requested_by: user.id,
    recipient_id: recipientId,
    status: "requested",
    message,
  } as never);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace");
  return { ok: true, message: "Introduction request sent for consent." };
}

export async function updateIntroductionStatusAction(formData: FormData) {
  const { supabase } = await requireUser();
  const introductionId = String(formData.get("introductionId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (
    !/^[0-9a-f-]{36}$/i.test(introductionId) ||
    !["accepted", "declined", "cancelled", "completed"].includes(status)
  ) {
    throw new Error("Invalid introduction update.");
  }
  const { error } = await supabase
    .from("introductions")
    .update({ status })
    .eq("id", introductionId);
  if (error) throw new Error(error.message);
  revalidatePath("/workspace/founder");
  revalidatePath("/workspace/investor");
}

export async function coordinateIntroductionAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const introductionId = String(formData.get("introductionId") ?? "");
  const meetingAt = String(formData.get("meetingAt") ?? "");
  const outcome = String(formData.get("outcome") ?? "").trim();
  if (
    !/^[0-9a-f-]{36}$/i.test(introductionId) ||
    (!meetingAt && outcome.length < 3) ||
    outcome.length > 1200
  ) {
    return {
      ok: false,
      message: "Add a valid meeting date or an outcome note.",
    };
  }
  const parsedMeeting = meetingAt ? new Date(meetingAt) : null;
  if (parsedMeeting && Number.isNaN(parsedMeeting.getTime()))
    return { ok: false, message: "Choose a valid meeting date and time." };
  const { error } = await supabase
    .from("introductions")
    .update({
      meeting_at: parsedMeeting?.toISOString(),
      outcome: outcome || null,
    })
    .eq("id", introductionId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/workspace/institution");
  return { ok: true, message: "Introduction coordination details saved." };
}

export async function grantEvidenceAccessAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const evidenceId = String(formData.get("evidenceId") ?? "");
  const introductionId = String(formData.get("introductionId") ?? "");
  const expiresAt = String(formData.get("expiresAt") ?? "");
  if (
    ![evidenceId, introductionId].every((value) =>
      /^[0-9a-f-]{36}$/i.test(value),
    )
  ) {
    return {
      ok: false,
      message: "Choose valid evidence and an accepted introduction.",
    };
  }
  const expiry = new Date(`${expiresAt}T23:59:59.999Z`);
  const maximum = Date.now() + 90 * 86_400_000;
  if (
    !expiresAt ||
    expiry.getTime() <= Date.now() ||
    expiry.getTime() > maximum
  ) {
    return { ok: false, message: "Choose an expiry within the next 90 days." };
  }
  const { data: introduction } = await supabase
    .from("introductions")
    .select("requested_by,recipient_id,status,venture_id")
    .eq("id", introductionId)
    .eq("status", "accepted")
    .maybeSingle();
  if (!introduction)
    return { ok: false, message: "The accepted introduction is unavailable." };
  const grantedTo =
    introduction.requested_by === user.id
      ? introduction.recipient_id
      : introduction.requested_by;
  const { error } = await supabase.from("document_access_grants").insert({
    evidence_id: evidenceId,
    introduction_id: introductionId,
    granted_to: grantedTo,
    granted_by: user.id,
    expires_at: expiry.toISOString(),
  } as never);
  if (error) return { ok: false, message: error.message };
  await supabase.from("consent_records").insert({
    user_id: user.id,
    purpose: "evidence_sharing",
    granted: true,
    evidence_ids: [evidenceId],
  } as never);
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: grantedTo,
    kind: "evidence_access_granted",
    title: "Time-limited evidence access granted",
    body: `Selected evidence is available until ${expiry.toLocaleDateString("en-PH")}.`,
    link: "/workspace/investor",
  });
  const recipientAccount = await admin.auth.admin.getUserById(grantedTo);
  if (recipientAccount.data.user?.email) {
    await sendProductEmail({
      email: recipientAccount.data.user.email,
      subject: "PitchPond evidence access granted",
      text: `A founder granted you time-limited access to selected evidence until ${expiry.toLocaleDateString("en-PH")}.`,
    });
  }
  revalidatePath("/workspace/founder");
  return { ok: true, message: "Time-limited evidence access granted." };
}

export async function revokeEvidenceGrantAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const grantId = String(formData.get("grantId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(grantId))
    throw new Error("Invalid evidence grant.");
  const { data: revoked, error } = await supabase
    .from("document_access_grants")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", grantId)
    .is("revoked_at", null)
    .select("evidence_id")
    .single();
  if (error) throw new Error(error.message);
  await supabase.from("consent_records").insert({
    user_id: user.id,
    purpose: "evidence_sharing",
    granted: false,
    evidence_ids: [revoked.evidence_id],
  } as never);
  revalidatePath("/workspace/founder");
}

export async function createDiligenceRequestAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const introductionId = String(formData.get("introductionId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueAt = String(formData.get("dueAt") ?? "");
  if (
    !/^[0-9a-f-]{36}$/i.test(introductionId) ||
    title.length < 3 ||
    title.length > 180 ||
    description.length < 10 ||
    description.length > 1200
  ) {
    return {
      ok: false,
      message: "Enter a valid diligence request and description.",
    };
  }
  const { data: introduction } = await supabase
    .from("introductions")
    .select("requested_by,recipient_id,status")
    .eq("id", introductionId)
    .eq("status", "accepted")
    .maybeSingle();
  if (!introduction)
    return { ok: false, message: "The accepted introduction is unavailable." };
  const { error } = await supabase.from("diligence_requests").insert({
    introduction_id: introductionId,
    requested_by: user.id,
    title,
    description,
    due_at: dueAt ? new Date(`${dueAt}T23:59:59.999Z`).toISOString() : null,
    status: "open",
  } as never);
  if (error) return { ok: false, message: error.message };
  const recipientId =
    introduction.requested_by === user.id
      ? introduction.recipient_id
      : introduction.requested_by;
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: recipientId,
    kind: "diligence_requested",
    title: "New diligence request",
    body: title,
    link: "/workspace",
  });
  const recipientAccount = await admin.auth.admin.getUserById(recipientId);
  if (recipientAccount.data.user?.email) {
    await sendProductEmail({
      email: recipientAccount.data.user.email,
      subject: "New PitchPond diligence request",
      text: `A participant in your accepted introduction requested: ${title}. Review it in your private PitchPond workspace.`,
    });
  }
  revalidatePath("/workspace/investor");
  revalidatePath("/workspace/founder");
  return {
    ok: true,
    message: "Diligence request added to the accepted introduction.",
  };
}

export async function updateDiligenceStatusAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (
    !/^[0-9a-f-]{36}$/i.test(requestId) ||
    !["shared", "resolved", "declined"].includes(status)
  ) {
    throw new Error("Invalid diligence update.");
  }
  const { data: updated, error } = await supabase
    .from("diligence_requests")
    .update({ status })
    .eq("id", requestId)
    .select("introduction_id,title")
    .single();
  if (error) throw new Error(error.message);
  const { data: introduction } = await supabase
    .from("introductions")
    .select("requested_by,recipient_id")
    .eq("id", updated.introduction_id)
    .single();
  if (introduction) {
    const recipientId =
      introduction.requested_by === user.id
        ? introduction.recipient_id
        : introduction.requested_by;
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      user_id: recipientId,
      kind: "diligence_updated",
      title: "Diligence request updated",
      body: `${updated.title}: ${status}`,
      link: "/workspace",
    });
    const recipientAccount = await admin.auth.admin.getUserById(recipientId);
    if (recipientAccount.data.user?.email) {
      await sendProductEmail({
        email: recipientAccount.data.user.email,
        subject: "PitchPond diligence request updated",
        text: `The diligence item “${updated.title}” is now ${status}.`,
      });
    }
  }
  revalidatePath("/workspace/investor");
  revalidatePath("/workspace/founder");
}

export async function markNotificationReadAction(formData: FormData) {
  const { supabase } = await requireUser();
  const notificationId = String(formData.get("notificationId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(notificationId))
    throw new Error("Invalid notification.");
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
  if (error) throw new Error(error.message);
  revalidatePath("/workspace");
}

export async function signOutAction() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/");
}
