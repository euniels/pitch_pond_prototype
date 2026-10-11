import { redirect } from "next/navigation";
import {
  FileKey2,
  Flag,
  Handshake,
  Link2,
  MessageSquareText,
  Network,
  Sparkles,
} from "lucide-react";
import { WorkspaceFrame } from "@/components/workspace-frame";
import { ActionForm } from "@/components/action-form";
import { EvidenceUploader } from "@/components/evidence-uploader";
import { EvidenceList } from "@/components/evidence-list";
import { FundabilityGraph } from "@/components/fundability-graph";
import { ReadinessMap } from "@/components/readiness-map";
import { AiReadinessReview } from "@/components/ai-readiness-review";
import { AiEvidenceSummary } from "@/components/ai-evidence-summary";
import { VentureDeletionButton } from "@/components/venture-deletion-button";
import {
  createClaimAction,
  createMilestoneAction,
  grantEvidenceAccessAction,
  linkClaimEvidenceAction,
  saveReadinessSectionAction,
  saveVentureAction,
  revokeEvidenceGrantAction,
  updateIntroductionStatusAction,
  updateDiligenceStatusAction,
} from "../actions";
import { demoVenture } from "@/lib/demo-data";
import {
  READINESS_DIMENSIONS,
  type ReadinessDimension,
  type VentureProfile,
} from "@/lib/domain";
import { createEmptyReadiness, readinessLabels } from "@/lib/readiness";
import { getWorkspaceContext, hasRole } from "@/lib/workspace";

export const metadata = {
  title: "Founder Studio",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Page() {
  const { supabase, user, profile, memberships } = await getWorkspaceContext();
  if (!hasRole(memberships, ["founder", "platform_admin"]))
    redirect("/workspace");
  const roles = [...new Set(memberships.map((item) => item.role))];
  const org =
    memberships.find((item) => item.role === "founder")?.organizations ??
    memberships[0]?.organizations;
  const { data: row } = org
    ? await supabase
        .from("ventures")
        .select("*")
        .eq("organization_id", org.id)
        .maybeSingle()
    : { data: null };
  const [
    sectionsResult,
    claimsResult,
    evidenceResult,
    linksResult,
    milestonesResult,
    introductionsResult,
    grantsResult,
    diligenceResult,
    matchResult,
  ] = row
    ? await Promise.all([
        supabase.from("venture_sections").select("*").eq("venture_id", row.id),
        supabase
          .from("claims")
          .select("*")
          .eq("venture_id", row.id)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("evidence_items")
          .select("id,title,file_name,status,evidence_date")
          .eq("venture_id", row.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
        supabase.from("claim_evidence_links").select("claim_id,evidence_id"),
        supabase
          .from("milestones")
          .select("*")
          .eq("venture_id", row.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("introductions")
          .select("id,status,message,created_at,requested_by,recipient_id")
          .eq("venture_id", row.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("document_access_grants")
          .select("id,evidence_id,introduction_id,expires_at,revoked_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("diligence_requests")
          .select("id,introduction_id,title,description,status,due_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("match_snapshots")
          .select("factors")
          .eq("venture_id", row.id)
          .order("calculated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])
    : [
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: null },
      ];
  const sections = sectionsResult.data ?? [];
  const claims = claimsResult.data ?? [];
  const evidence = evidenceResult.data ?? [];
  const links = linksResult.data ?? [];
  const milestones = milestonesResult.data ?? [];
  const introductions = introductionsResult.data ?? [];
  const grants = grantsResult.data ?? [];
  const diligence = diligenceResult.data ?? [];
  const latestMatchFactors = Array.isArray(matchResult.data?.factors)
    ? matchResult.data.factors.length
    : 0;
  const cleanEvidence = evidence.filter((item) =>
    ["clean", "ready"].includes(item.status),
  );
  const readiness: VentureProfile["readiness"] = row
    ? READINESS_DIMENSIONS.map((dimension) => {
        const section = sections.find((item) => item.dimension === dimension);
        const dimensionClaims = claims.filter(
          (claim) => claim.dimension === dimension,
        );
        const evidenceIds = new Set(
          links
            .filter((link) =>
              dimensionClaims.some((claim) => claim.id === link.claim_id),
            )
            .map((link) => link.evidence_id),
        );
        const evidenceCount = cleanEvidence.filter((item) =>
          evidenceIds.has(item.id),
        ).length;
        const hasSummary = Boolean(
          section?.content &&
            typeof section.content === "object" &&
            "summary" in section.content &&
            String(section.content.summary).trim(),
        );
        const completedFields =
          Number(hasSummary) + Number(dimensionClaims.length > 0);
        const state: VentureProfile["readiness"][number]["state"] =
          section?.state === "reviewed" &&
          evidenceCount > 0 &&
          completedFields === 2
            ? "reviewed"
            : evidenceCount > 0 && completedFields === 2
              ? "evidence_linked"
              : completedFields > 0 || evidenceCount > 0
                ? "in_progress"
                : "not_started";
        return {
          dimension,
          label: readinessLabels[dimension],
          state,
          completedFields,
          requiredFields: 2,
          evidenceCount,
        };
      })
    : createEmptyReadiness();
  const venture: VentureProfile = row
    ? {
        id: row.id,
        name: row.name,
        tagline: row.tagline,
        sector: row.sector,
        stage: row.stage,
        region: row.region,
        city: row.city ?? undefined,
        fundingNeedMin: row.funding_need_min,
        fundingNeedMax: row.funding_need_max,
        tractionLevel: row.traction_level,
        impactGoals: row.impact_goals,
        riskLevel: row.risk_level,
        consentToMatch: row.consent_to_match,
        readiness,
      }
    : demoVenture;
  return (
    <WorkspaceFrame
      name={profile?.display_name ?? user.email ?? "Founder"}
      roles={roles}
      eyebrow="Founder Studio"
      title={row ? row.name : "Create your venture profile"}
      intro="Build a reviewable venture record. Completion is objective and does not forecast fundraising outcomes."
    >
      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Venture basics</span>
              <h2>Profile and matching consent</h2>
            </div>
          </div>
          {org ? (
            <ActionForm
              action={saveVentureAction}
              submitLabel="Save venture profile"
            >
              <input type="hidden" name="organizationId" value={org.id} />
              <div className="form-grid">
                <label>
                  <span>Venture name</span>
                  <input name="name" defaultValue={row?.name ?? ""} required />
                </label>
                <label>
                  <span>Sector</span>
                  <input
                    name="sector"
                    defaultValue={row?.sector ?? ""}
                    required
                  />
                </label>
                <label className="span-two">
                  <span>One-line venture summary</span>
                  <input
                    name="tagline"
                    defaultValue={row?.tagline ?? ""}
                    minLength={20}
                    required
                  />
                </label>
                <label>
                  <span>Stage</span>
                  <select name="stage" defaultValue={row?.stage ?? "Prototype"}>
                    <option>Idea</option>
                    <option>Prototype</option>
                    <option>Pilot</option>
                    <option>Early revenue</option>
                    <option>Growth</option>
                  </select>
                </label>
                <label>
                  <span>Region</span>
                  <input
                    name="region"
                    defaultValue={row?.region ?? "CALABARZON"}
                    required
                  />
                </label>
                <label>
                  <span>City or municipality</span>
                  <input name="city" defaultValue={row?.city ?? ""} />
                </label>
                <label>
                  <span>Minimum funding need (PHP)</span>
                  <input
                    name="fundingNeedMin"
                    type="number"
                    min="0"
                    defaultValue={row?.funding_need_min ?? 0}
                  />
                </label>
                <label>
                  <span>Maximum funding need (PHP)</span>
                  <input
                    name="fundingNeedMax"
                    type="number"
                    min="0"
                    defaultValue={row?.funding_need_max ?? 0}
                  />
                </label>
                <label>
                  <span>Traction level (0–5)</span>
                  <input
                    name="tractionLevel"
                    type="number"
                    min="0"
                    max="5"
                    defaultValue={row?.traction_level ?? 0}
                  />
                </label>
                <label>
                  <span>Risk level (1–5)</span>
                  <input
                    name="riskLevel"
                    type="number"
                    min="1"
                    max="5"
                    defaultValue={row?.risk_level ?? 3}
                  />
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
                        defaultChecked={row?.impact_goals.includes(goal)}
                      />
                      {goal}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="check-row">
                <input
                  type="checkbox"
                  name="consentToMatch"
                  defaultChecked={row?.consent_to_match}
                />
                <span>
                  Make this venture eligible for permissioned matching. Evidence
                  remains separately protected.
                </span>
              </label>
            </ActionForm>
          ) : (
            <div className="empty-state">
              <p>
                A founder organization membership is required before creating a
                venture.
              </p>
            </div>
          )}
        </section>
        <section className="workspace-panel graph-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Fundability Graph</span>
              <h2>Coverage at a glance</h2>
            </div>
            <Network />
          </div>
          <FundabilityGraph
            venture={venture}
            claimsCount={claims.length}
            milestonesCount={milestones.length}
            matchFactorCount={latestMatchFactors}
          />
        </section>
      </div>
      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Readiness Map</span>
            <h2>Nine practical dimensions</h2>
          </div>
          <span className="advisory-label">
            <Sparkles />
            AI review available on request
          </span>
        </div>
        <ReadinessMap items={venture.readiness} />
      </section>
      {row && (
        <section className="workspace-panel">
          <AiReadinessReview
            ventureId={row.id}
            content={{
              venture: {
                tagline: row.tagline,
                sector: row.sector,
                stage: row.stage,
                region: row.region,
                fundingNeedMin: row.funding_need_min,
                fundingNeedMax: row.funding_need_max,
                tractionLevel: row.traction_level,
                impactGoals: row.impact_goals,
              },
              readiness: sections.map((section) => ({
                dimension: section.dimension,
                state: section.state,
                content: section.content,
              })),
              claims: claims.map((claim) => ({
                dimension: claim.dimension,
                statement: claim.statement,
              })),
            }}
          />
        </section>
      )}
      {row && (
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Data control</span>
              <h2>Export or delete</h2>
            </div>
          </div>
          <div className="workspace-columns data-controls">
            <div>
              <strong>Account export</strong>
              <p>
                Download profile, venture, readiness, evidence metadata,
                consent, and collaboration records.
              </p>
              <a className="button button-secondary" href="/api/account/export">
                Download JSON export
              </a>
            </div>
            <VentureDeletionButton ventureId={row.id} />
          </div>
        </section>
      )}
      {row && (
        <div className="workspace-columns">
          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Readiness detail</span>
                <h2>Build one dimension at a time</h2>
              </div>
              <MessageSquareText />
            </div>
            <ActionForm
              action={saveReadinessSectionAction}
              submitLabel="Save readiness section"
            >
              <input type="hidden" name="ventureId" value={row.id} />
              <label>
                <span>Dimension</span>
                <select name="dimension">
                  {READINESS_DIMENSIONS.map((dimension) => (
                    <option key={dimension} value={dimension}>
                      {readinessLabels[dimension]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Current position, gap, and next proof point</span>
                <textarea name="summary" rows={6} minLength={20} required />
              </label>
            </ActionForm>
          </section>
          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Claims editor</span>
                <h2>State what the evidence supports</h2>
              </div>
              <Link2 />
            </div>
            <ActionForm action={createClaimAction} submitLabel="Add claim">
              <input type="hidden" name="ventureId" value={row.id} />
              <label>
                <span>Dimension</span>
                <select name="dimension">
                  {READINESS_DIMENSIONS.map((dimension) => (
                    <option key={dimension} value={dimension}>
                      {readinessLabels[dimension]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Evidence-backed statement</span>
                <textarea name="statement" rows={4} minLength={20} required />
              </label>
            </ActionForm>
            {claims.length > 0 && (
              <div className="record-list">
                {claims.map((claim) => (
                  <article key={claim.id}>
                    <span>
                      {readinessLabels[claim.dimension as ReadinessDimension] ??
                        claim.dimension}
                    </span>
                    <p>{claim.statement}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      {row && (
        <div className="workspace-columns">
          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Evidence links</span>
                <h2>Connect clean files to specific claims</h2>
              </div>
              <Link2 />
            </div>
            {claims.length > 0 && cleanEvidence.length > 0 ? (
              <ActionForm
                action={linkClaimEvidenceAction}
                submitLabel="Link evidence"
              >
                <label>
                  <span>Claim</span>
                  <select name="claimId">
                    {claims.map((claim) => (
                      <option key={claim.id} value={claim.id}>
                        {claim.statement}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Clean evidence</span>
                  <select name="evidenceId">
                    {cleanEvidence.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
              </ActionForm>
            ) : (
              <div className="empty-state">
                <Link2 />
                <h3>A claim and clean evidence are required</h3>
                <p>
                  Uploaded files remain quarantined until scanning succeeds.
                </p>
              </div>
            )}
          </section>
          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Milestones</span>
                <h2>Record progress without embellishment</h2>
              </div>
              <Flag />
            </div>
            <ActionForm
              action={createMilestoneAction}
              submitLabel="Add milestone"
            >
              <input type="hidden" name="ventureId" value={row.id} />
              <label>
                <span>Milestone</span>
                <input name="title" minLength={3} required />
              </label>
              <div className="form-grid">
                <label>
                  <span>Date</span>
                  <input name="occurredOn" type="date" />
                </label>
                <label>
                  <span>Status</span>
                  <select name="status">
                    <option value="planned">Planned</option>
                    <option value="achieved">Achieved</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Supporting evidence (optional)</span>
                <select name="evidenceId">
                  <option value="">None</option>
                  {cleanEvidence.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
            </ActionForm>
            {milestones.length > 0 && (
              <div className="record-list">
                {milestones.map((milestone) => (
                  <article key={milestone.id}>
                    <span>
                      {milestone.status}
                      {milestone.occurred_on
                        ? ` · ${milestone.occurred_on}`
                        : ""}
                    </span>
                    <p>{milestone.title}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      {row && (
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Introductions</span>
              <h2>Consent before contact</h2>
            </div>
            <Handshake />
          </div>
          {introductions.length ? (
            <div className="control-list">
              {introductions.map((introduction) => (
                <div key={introduction.id}>
                  <div>
                    <strong>{introduction.status}</strong>
                    <span>{introduction.message}</span>
                  </div>
                  {introduction.recipient_id === user.id &&
                    introduction.status === "requested" && (
                      <div className="match-actions">
                        <form action={updateIntroductionStatusAction}>
                          <input
                            type="hidden"
                            name="introductionId"
                            value={introduction.id}
                          />
                          <input type="hidden" name="status" value="accepted" />
                          <button className="button button-secondary">
                            Accept
                          </button>
                        </form>
                        <form action={updateIntroductionStatusAction}>
                          <input
                            type="hidden"
                            name="introductionId"
                            value={introduction.id}
                          />
                          <input type="hidden" name="status" value="declined" />
                          <button className="button button-quiet">
                            Decline
                          </button>
                        </form>
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Handshake />
              <h3>No introduction requests</h3>
              <p>
                Requests appear here for explicit founder acceptance or decline.
              </p>
            </div>
          )}
          {diligence.length > 0 && (
            <div className="record-list">
              {diligence.map((request) => (
                <article key={request.id}>
                  <span>
                    {request.status}
                    {request.due_at
                      ? ` · due ${new Date(request.due_at).toLocaleDateString("en-PH")}`
                      : ""}
                  </span>
                  <p>
                    <strong>{request.title}</strong> — {request.description}
                  </p>
                  {request.status === "open" && (
                    <div className="match-actions">
                      <form action={updateDiligenceStatusAction}>
                        <input
                          type="hidden"
                          name="requestId"
                          value={request.id}
                        />
                        <input type="hidden" name="status" value="shared" />
                        <button className="button button-secondary">
                          Mark shared
                        </button>
                      </form>
                      <form action={updateDiligenceStatusAction}>
                        <input
                          type="hidden"
                          name="requestId"
                          value={request.id}
                        />
                        <input type="hidden" name="status" value="declined" />
                        <button className="button button-quiet">Decline</button>
                      </form>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      {row && (
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Evidence Vault</span>
              <h2>Private supporting evidence</h2>
            </div>
            <FileKey2 />
          </div>
          <EvidenceList
            items={evidence.map((item) => ({
              id: item.id,
              title: item.title,
              fileName: item.file_name,
              status: item.status,
              evidenceDate: item.evidence_date,
            }))}
          />
          <EvidenceUploader ventureId={row.id} />
          <AiEvidenceSummary
            ventureId={row.id}
            items={cleanEvidence.map((item) => ({
              id: item.id,
              title: item.title,
            }))}
          />
        </section>
      )}
      {row && (
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Evidence permissions</span>
              <h2>Time-limited, revocable access</h2>
            </div>
            <FileKey2 />
          </div>
          {introductions.some((item) => item.status === "accepted") &&
          cleanEvidence.length ? (
            <ActionForm
              action={grantEvidenceAccessAction}
              submitLabel="Grant document access"
            >
              <label>
                <span>Accepted introduction</span>
                <select name="introductionId">
                  {introductions
                    .filter((item) => item.status === "accepted")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.message}
                      </option>
                    ))}
                </select>
              </label>
              <div className="form-grid">
                <label>
                  <span>Evidence</span>
                  <select name="evidenceId">
                    {cleanEvidence.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Access expires</span>
                  <input name="expiresAt" type="date" required />
                </label>
              </div>
            </ActionForm>
          ) : (
            <p className="form-message">
              An accepted introduction and clean evidence are required before
              access can be granted.
            </p>
          )}
          {grants.length > 0 && (
            <div className="control-list">
              {grants.map((grant) => (
                <div key={grant.id}>
                  <div>
                    <strong>
                      {grant.revoked_at ? "Revoked" : "Active grant"}
                    </strong>
                    <span>
                      Expires{" "}
                      {new Date(grant.expires_at).toLocaleDateString("en-PH")}
                    </span>
                  </div>
                  {!grant.revoked_at && (
                    <form action={revokeEvidenceGrantAction}>
                      <input type="hidden" name="grantId" value={grant.id} />
                      <button className="button button-quiet">Revoke</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </WorkspaceFrame>
  );
}
