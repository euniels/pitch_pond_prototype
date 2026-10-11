import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user)
    return NextResponse.json(
      { message: "Sign in is required." },
      { status: 401 },
    );
  const [
    profile,
    memberships,
    consents,
    aiRuns,
    theses,
    notes,
    notifications,
    matchSnapshots,
    savedMatches,
    blindReveals,
    accessGrants,
    participantIntroductions,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user.id).single(),
    supabase
      .from("organization_memberships")
      .select("*,organizations(*)")
      .eq("user_id", auth.user.id),
    supabase.from("consent_records").select("*").eq("user_id", auth.user.id),
    supabase
      .from("ai_runs")
      .select("id,purpose,model,prompt_version,evidence_ids,status,created_at")
      .eq("user_id", auth.user.id),
    supabase.from("investor_theses").select("*").eq("owner_id", auth.user.id),
    supabase.from("notes").select("*").eq("author_id", auth.user.id),
    supabase.from("notifications").select("*").eq("user_id", auth.user.id),
    supabase
      .from("match_snapshots")
      .select("*")
      .eq("reviewer_id", auth.user.id),
    supabase.from("saved_matches").select("*").eq("user_id", auth.user.id),
    supabase.from("blind_reveals").select("*").eq("reviewer_id", auth.user.id),
    supabase
      .from("document_access_grants")
      .select("*")
      .or(`granted_to.eq.${auth.user.id},granted_by.eq.${auth.user.id}`),
    supabase
      .from("introductions")
      .select("*")
      .or(`requested_by.eq.${auth.user.id},recipient_id.eq.${auth.user.id}`),
  ]);
  const participantIntroductionIds = (participantIntroductions.data ?? []).map(
    (introduction) => introduction.id,
  );
  const participantDiligence = participantIntroductionIds.length
    ? await supabase
        .from("diligence_requests")
        .select("*")
        .in("introduction_id", participantIntroductionIds)
    : { data: [] };
  const organizationIds = (memberships.data ?? []).map(
    (item) => item.organization_id,
  );
  const ventures = organizationIds.length
    ? await supabase
        .from("ventures")
        .select("*")
        .in("organization_id", organizationIds)
    : { data: [] };
  const ventureIds = (ventures.data ?? []).map((item) => item.id);
  const [sections, claims, milestones, evidence, readiness] = ventureIds.length
    ? await Promise.all([
        supabase
          .from("venture_sections")
          .select("*")
          .in("venture_id", ventureIds),
        supabase.from("claims").select("*").in("venture_id", ventureIds),
        supabase.from("milestones").select("*").in("venture_id", ventureIds),
        supabase
          .from("evidence_items")
          .select(
            "id,venture_id,title,file_name,mime_type,size_bytes,evidence_date,status,sha256,created_at",
          )
          .in("venture_id", ventureIds),
        supabase
          .from("readiness_snapshots")
          .select("*")
          .in("venture_id", ventureIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];
  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      account: { id: auth.user.id, email: auth.user.email },
      profile: profile.data,
      memberships: memberships.data,
      ventures: ventures.data,
      ventureSections: sections.data,
      claims: claims.data,
      milestones: milestones.data,
      evidenceMetadata: evidence.data,
      readinessSnapshots: readiness.data,
      introductions: participantIntroductions.data,
      investorTheses: theses.data,
      privateNotes: notes.data,
      matchSnapshots: matchSnapshots.data,
      savedMatches: savedMatches.data,
      identityReveals: blindReveals.data,
      documentAccessGrants: accessGrants.data,
      diligenceRequests: participantDiligence.data,
      notifications: notifications.data,
      consents: consents.data,
      aiRuns: aiRuns.data,
    },
    {
      headers: {
        "Content-Disposition":
          "attachment; filename=pitchpond-account-export.json",
        "Cache-Control": "no-store",
      },
    },
  );
}
