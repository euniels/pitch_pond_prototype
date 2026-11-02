import { redirect } from "next/navigation";
import { Eye, EyeOff, Scale, ShieldCheck } from "lucide-react";
import { WorkspaceFrame } from "@/components/workspace-frame";
import { ActionForm } from "@/components/action-form";
import { MatchBreakdown } from "@/components/match-breakdown";
import { AiMatchNarrative } from "@/components/ai-match-narrative";
import { AiProjectionExplanation } from "@/components/ai-projection-explanation";
import {
  ProjectionSnapshot,
  type StoredForecastPoint,
} from "@/components/projection-snapshot";
import {
  createPrivateNoteAction,
  createDiligenceRequestAction,
  refreshMatchesAction,
  requestMatchIntroductionAction,
  revealVentureAction,
  saveThesisAction,
  setMatchDispositionAction,
} from "../actions";
import { demoThesis } from "@/lib/demo-data";
import { getWorkspaceContext, hasRole } from "@/lib/workspace";
import { formatPeso } from "@/lib/format";
import type { MatchResult } from "@/lib/domain";

export const metadata = {
  title: "Thesis and matches",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function Page() {
  const { supabase, user, profile, memberships } = await getWorkspaceContext();
  if (!hasRole(memberships, ["investor_mentor", "platform_admin"]))
    redirect("/workspace");
  const roles = [...new Set(memberships.map((item) => item.role))];
  const [
    { data: thesis },
    { data: matchRows },
    { data: reveals },
    { data: dispositions },
    { data: introductions },
    { data: diligence },
    { data: projectionShares },
  ] = await Promise.all([
    supabase
      .from("investor_theses")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("match_snapshots")
      .select("*,ventures(*)")
      .eq("reviewer_id", user.id)
      .eq("eligible", true)
      .order("calculated_at", { ascending: false }),
    supabase
      .from("blind_reveals")
      .select("venture_id")
      .eq("reviewer_id", user.id),
    supabase
      .from("saved_matches")
      .select("match_id,disposition")
      .eq("user_id", user.id),
    supabase
      .from("introductions")
      .select("id,venture_id,status,message,created_at")
      .eq("requested_by", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("diligence_requests")
      .select("id,introduction_id,title,status,due_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("projection_shares")
      .select("run_id,venture_id,visibility,expires_at,revoked_at")
      .eq("recipient_id", user.id)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString()),
  ]);
  const seenVentures = new Set<string>();
  const matches = (matchRows ?? []).filter((match) => {
    if (seenVentures.has(match.venture_id)) return false;
    seenVentures.add(match.venture_id);
    return true;
  });
  const revealedIds = new Set((reveals ?? []).map((item) => item.venture_id));
  const dispositionByMatch = new Map(
    (dispositions ?? []).map((item) => [item.match_id, item.disposition]),
  );
  const sharedProjectionResults = await Promise.all(
    (projectionShares ?? []).map(async (share) => {
      const { data } = await supabase.rpc("get_shared_projection", {
        p_run_id: share.run_id,
      });
      return data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : null;
    }),
  );
  const sharedProjectionByVenture = new Map<string, Record<string, unknown>>();
  for (const projection of sharedProjectionResults) {
    if (projection && typeof projection.ventureId === "string")
      sharedProjectionByVenture.set(projection.ventureId, projection);
  }

  return (
    <WorkspaceFrame
      name={profile?.display_name ?? user.email ?? "Supporter"}
      roles={roles}
      eyebrow="Investor / mentor workbench"
      title="Make the thesis explicit."
      intro="Compatibility is calculated from criteria you can inspect and facts founders have consented to share."
    >
      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Investor Thesis Builder</span>
              <h2>Review preferences</h2>
            </div>
            <Scale />
          </div>
          <ActionForm action={saveThesisAction} submitLabel="Save thesis">
            <div className="form-grid">
              <label>
                <span>Sectors</span>
                <select
                  name="sectors"
                  multiple
                  defaultValue={thesis?.sectors ?? demoThesis.sectors}
                >
                  <option>Climate technology</option>
                  <option>Agriculture</option>
                  <option>Health</option>
                  <option>Education</option>
                  <option>Enterprise software</option>
                </select>
              </label>
              <label>
                <span>Stages</span>
                <select
                  name="stages"
                  multiple
                  defaultValue={thesis?.stages ?? demoThesis.stages}
                >
                  <option>Idea</option>
                  <option>Prototype</option>
                  <option>Pilot</option>
                  <option>Early revenue</option>
                  <option>Growth</option>
                </select>
              </label>
              <label>
                <span>Minimum ticket (PHP)</span>
                <input
                  name="ticketMin"
                  type="number"
                  min="0"
                  defaultValue={thesis?.ticket_min ?? demoThesis.ticketMin}
                />
              </label>
              <label>
                <span>Maximum ticket (PHP)</span>
                <input
                  name="ticketMax"
                  type="number"
                  min="0"
                  defaultValue={thesis?.ticket_max ?? demoThesis.ticketMax}
                />
              </label>
              <label>
                <span>Regions</span>
                <select
                  name="regions"
                  multiple
                  defaultValue={thesis?.regions ?? demoThesis.regions}
                >
                  <option>CALABARZON</option>
                  <option>NCR</option>
                  <option>Central Luzon</option>
                  <option>Nationwide</option>
                </select>
              </label>
              <label>
                <span>Minimum traction (0–5)</span>
                <input
                  name="minimumTraction"
                  type="number"
                  min="0"
                  max="5"
                  defaultValue={thesis?.minimum_traction ?? 2}
                />
              </label>
              <label>
                <span>Risk tolerance (1–5)</span>
                <input
                  name="riskTolerance"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={thesis?.risk_tolerance ?? 3}
                />
              </label>
              <label>
                <span>Excluded sectors</span>
                <select
                  name="excludedSectors"
                  multiple
                  defaultValue={thesis?.excluded_sectors ?? ["Gambling"]}
                >
                  <option>Gambling</option>
                  <option>Tobacco</option>
                  <option>Weapons</option>
                </select>
              </label>
            </div>
            <fieldset>
              <legend>Impact goals</legend>
              <div className="check-options">
                {["SDG 8", "SDG 9", "SDG 10"].map((goal) => (
                  <label key={goal}>
                    <input
                      type="checkbox"
                      name="impactGoals"
                      value={goal}
                      defaultChecked={(
                        thesis?.impact_goals ?? demoThesis.impactGoals
                      ).includes(goal)}
                    />
                    {goal}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="check-row">
              <input
                name="mentorshipOnly"
                type="checkbox"
                defaultChecked={thesis?.mentorship_only}
              />
              <span>
                Mentorship only—do not include ticket size as an active
                investment intention.
              </span>
            </label>
          </ActionForm>
        </section>
        <section className="workspace-panel thesis-summary">
          <span className="eyebrow">Current criteria</span>
          <h2>{(thesis?.sectors ?? demoThesis.sectors).join(" + ")}</h2>
          <strong>
            {formatPeso(thesis?.ticket_min ?? demoThesis.ticketMin)}–
            {formatPeso(thesis?.ticket_max ?? demoThesis.ticketMax)}
          </strong>
          <p>{(thesis?.regions ?? demoThesis.regions).join(" · ")}</p>
          <div className="blind-banner">
            <ShieldCheck />
            <div>
              <strong>Blind First Look</strong>
              <p>
                Identity, precise location, and prestige cues stay hidden until
                a reasoned reveal.
              </p>
            </div>
          </div>
          <ActionForm
            action={refreshMatchesAction}
            submitLabel="Calculate consented matches"
          >
            <p className="form-message">
              Uses the published 100-point rubric. Plans and sponsored
              visibility are never inputs.
            </p>
          </ActionForm>
        </section>
      </div>

      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Explainable matches</span>
            <h2>Factor-by-factor review</h2>
          </div>
          <EyeOff />
        </div>
        {matches.length === 0 ? (
          <div className="empty-state">
            <Scale />
            <h3>No calculated matches yet</h3>
            <p>
              Save the thesis, then calculate matches against ventures that have
              explicitly opted in.
            </p>
          </div>
        ) : (
          <div className="match-list">
            {matches.map((match) => {
              const venture = match.ventures as Record<string, unknown> | null;
              const revealed = revealedIds.has(match.venture_id);
              const result: MatchResult = {
                eligible: match.eligible,
                score: match.compatibility_score,
                rubricVersion: "2026.1",
                factors: match.factors as MatchResult["factors"],
                reasons: match.reasons as string[],
                mismatches: match.mismatches as string[],
                blockedBy: [],
              };
              const projection = sharedProjectionByVenture.get(match.venture_id);
              const projectionSeries = Array.isArray(
                projection?.exactSeries ?? projection?.indexedSeries,
              )
                ? ((projection?.exactSeries ??
                    projection?.indexedSeries) as StoredForecastPoint[])
                : [];
              const projectionVisibility = String(
                projection?.visibility ?? "indexed",
              );
              return (
                <article className="match-card" key={match.id}>
                  <div className="match-card-heading">
                    <div>
                      <span className="eyebrow">
                        {revealed ? "Identity revealed" : "Blind First Look"}
                      </span>
                      <h3>
                        {revealed
                          ? String(venture?.name ?? "Venture")
                          : "Identity hidden"}
                      </h3>
                      <p>
                        {String(
                          venture?.tagline ??
                            "Founder-approved venture profile",
                        )}
                      </p>
                    </div>
                    <span className="status-pill">
                      {dispositionByMatch.get(match.id) ?? "new"}
                    </span>
                  </div>
                  <div className="blind-facts">
                    <span>{String(venture?.sector ?? "Sector withheld")}</span>
                    <span>{String(venture?.stage ?? "Stage withheld")}</span>
                    <span>{String(venture?.region ?? "Region withheld")}</span>
                    <span>
                      Traction {String(venture?.traction_level ?? "—")}/5
                    </span>
                  </div>
                  <MatchBreakdown result={result} />
                  {projection && (
                    <div className="investor-projection-section">
                      <div className="projection-permission-banner">
                        <ShieldCheck />
                        <div>
                          <strong>Founder-shared projection</strong>
                          <span>
                            {projectionVisibility === "exact"
                              ? "Exact values available through an accepted, expiring diligence grant."
                              : "Financial values are indexed; identity and exact amounts remain protected."}
                          </span>
                        </div>
                      </div>
                      <ProjectionSnapshot
                        label="Shared operating goal"
                        unit={projectionVisibility === "exact" ? "custom" : "score"}
                        probability={Number(projection.probability ?? 0)}
                        confidence={Number(projection.confidence ?? 0)}
                        inputKind={String(projection.inputKind ?? "assumption_based")}
                        status={String(projection.statusBand ?? "watch")}
                        scenario={String(projection.scenario ?? "baseline")}
                        modelVersion={String(projection.modelVersion ?? "2026.2")}
                        calculatedAt={String(projection.calculatedAt ?? new Date(0).toISOString())}
                        expectedTargetDate={
                          typeof projection.expectedTargetDate === "string"
                            ? projection.expectedTargetDate
                            : null
                        }
                        series={projectionSeries}
                        sensitivity={
                          projection.sensitivity &&
                          typeof projection.sensitivity === "object" &&
                          !Array.isArray(projection.sensitivity)
                            ? (projection.sensitivity as Record<string, number>)
                            : {}
                        }
                        drivers={
                          Array.isArray(projection.drivers)
                            ? projection.drivers.filter(
                                (item): item is string => typeof item === "string",
                              )
                            : []
                        }
                        limitations={
                          Array.isArray(projection.limitations)
                            ? projection.limitations.filter(
                                (item): item is string => typeof item === "string",
                              )
                            : []
                        }
                        indexed={projectionVisibility !== "exact"}
                      >
                        <AiProjectionExplanation
                          runId={String(projection.id)}
                          ventureId={match.venture_id}
                          allowExactValues={projectionVisibility === "exact"}
                        />
                      </ProjectionSnapshot>
                    </div>
                  )}
                  <AiMatchNarrative
                    ventureId={match.venture_id}
                    matchId={match.id}
                    result={result}
                  />
                  <div className="match-actions">
                    <form action={setMatchDispositionAction}>
                      <input type="hidden" name="matchId" value={match.id} />
                      <input type="hidden" name="disposition" value="saved" />
                      <button className="button button-secondary">Save</button>
                    </form>
                    <form action={setMatchDispositionAction}>
                      <input type="hidden" name="matchId" value={match.id} />
                      <input
                        type="hidden"
                        name="disposition"
                        value="dismissed"
                      />
                      <button className="button button-quiet">Dismiss</button>
                    </form>
                  </div>
                  {!revealed && (
                    <form
                      action={revealVentureAction}
                      className="inline-action-form"
                    >
                      <input
                        type="hidden"
                        name="ventureId"
                        value={match.venture_id}
                      />
                      <label>
                        <span>Reason for revealing identity</span>
                        <input
                          name="reason"
                          minLength={10}
                          maxLength={240}
                          required
                        />
                      </label>
                      <button className="button button-secondary">
                        <Eye /> Reveal and audit
                      </button>
                    </form>
                  )}
                  <div className="workspace-columns match-collaboration">
                    <ActionForm
                      action={createPrivateNoteAction}
                      submitLabel="Save private note"
                    >
                      <input
                        type="hidden"
                        name="ventureId"
                        value={match.venture_id}
                      />
                      <label>
                        <span>Private review note</span>
                        <textarea name="body" rows={3} minLength={3} required />
                      </label>
                    </ActionForm>
                    <ActionForm
                      action={requestMatchIntroductionAction}
                      submitLabel="Request introduction"
                    >
                      <input type="hidden" name="matchId" value={match.id} />
                      <label>
                        <span>Message to the founder</span>
                        <textarea
                          name="message"
                          rows={3}
                          minLength={20}
                          required
                        />
                      </label>
                    </ActionForm>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Introductions and diligence</span>
            <h2>Track consented next steps</h2>
          </div>
          <Scale />
        </div>
        {introductions?.length ? (
          <div className="record-list">
            {introductions.map((introduction) => (
              <article key={introduction.id}>
                <span>{introduction.status}</span>
                <p>{introduction.message}</p>
                {introduction.status === "accepted" && (
                  <ActionForm
                    action={createDiligenceRequestAction}
                    submitLabel="Add diligence request"
                  >
                    <input
                      type="hidden"
                      name="introductionId"
                      value={introduction.id}
                    />
                    <label>
                      <span>Request title</span>
                      <input name="title" minLength={3} required />
                    </label>
                    <label>
                      <span>What is needed and why</span>
                      <textarea
                        name="description"
                        rows={3}
                        minLength={10}
                        required
                      />
                    </label>
                    <label>
                      <span>Optional due date</span>
                      <input name="dueAt" type="date" />
                    </label>
                  </ActionForm>
                )}
                {(diligence ?? [])
                  .filter(
                    (request) => request.introduction_id === introduction.id,
                  )
                  .map((request) => (
                    <div className="form-message" key={request.id}>
                      {request.title} · {request.status}
                      {request.due_at
                        ? ` · due ${new Date(request.due_at).toLocaleDateString("en-PH")}`
                        : ""}
                    </div>
                  ))}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Scale />
            <h3>No introduction activity</h3>
            <p>
              Accepted introductions unlock controlled diligence requests and
              evidence access.
            </p>
          </div>
        )}
      </section>
    </WorkspaceFrame>
  );
}
