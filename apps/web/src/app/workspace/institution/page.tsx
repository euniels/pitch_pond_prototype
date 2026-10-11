import { redirect } from "next/navigation";
import {
  BarChart3,
  Building2,
  Clock3,
  Handshake,
  UserPlus,
  Users,
} from "lucide-react";
import { WorkspaceFrame } from "@/components/workspace-frame";
import { ActionForm } from "@/components/action-form";
import {
  addVentureToCohortAction,
  assignCohortReviewerFormAction,
  createCohortAction,
  createInvitationAction,
  coordinateIntroductionAction,
  reviewReadinessSectionAction,
} from "../actions";
import { getWorkspaceContext, hasRole } from "@/lib/workspace";

export const metadata = {
  title: "Institution workspace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export default async function Page() {
  const { supabase, user, profile, memberships } = await getWorkspaceContext();
  if (
    !hasRole(memberships, [
      "institution_reviewer",
      "institution_manager",
      "platform_admin",
    ])
  )
    redirect("/workspace");
  const isManager = hasRole(memberships, [
    "institution_manager",
    "platform_admin",
  ]);
  const roles = [...new Set(memberships.map((item) => item.role))];
  if (isManager) {
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.data?.currentLevel !== "aal2")
      redirect("/workspace/security?next=/workspace/institution");
  }
  const org =
    memberships.find((item) =>
      ["institution_reviewer", "institution_manager"].includes(item.role),
    )?.organizations ?? memberships[0]?.organizations;
  const { data: cohorts } = org
    ? await supabase
        .from("cohorts")
        .select("*")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false })
    : { data: [] };
  const cohortIds = (cohorts ?? []).map((cohort) => cohort.id);
  const [{ data: cohortVentures }, { data: reviewers }] = org
    ? await Promise.all([
        cohortIds.length
          ? supabase
              .from("cohort_ventures")
              .select("cohort_id,venture_id,ventures(id,name,sector,stage)")
              .in("cohort_id", cohortIds)
          : Promise.resolve({ data: [] }),
        supabase
          .from("organization_memberships")
          .select("user_id,role,profiles(display_name)")
          .eq("organization_id", org.id)
          .in("role", ["institution_reviewer", "institution_manager"]),
      ])
    : [{ data: [] }, { data: [] }];
  const ventureIds = [
    ...new Set((cohortVentures ?? []).map((item) => item.venture_id)),
  ];
  const [
    { data: snapshots },
    { data: introductions },
    { data: matchSnapshots },
    { data: reveals },
  ] = ventureIds.length
    ? await Promise.all([
        supabase
          .from("readiness_snapshots")
          .select("venture_id,completion_percent,created_at")
          .in("venture_id", ventureIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("introductions")
          .select("id,venture_id,status,meeting_at,outcome,created_at")
          .in("venture_id", ventureIds),
        supabase
          .from("match_snapshots")
          .select("venture_id,reviewer_id,calculated_at")
          .in("venture_id", ventureIds),
        supabase
          .from("blind_reveals")
          .select("venture_id,reviewer_id,revealed_at")
          .in("venture_id", ventureIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];
  const latestCompletion = new Map<string, number>();
  for (const snapshot of snapshots ?? [])
    if (!latestCompletion.has(snapshot.venture_id))
      latestCompletion.set(snapshot.venture_id, snapshot.completion_percent);
  const completion = median([...latestCompletion.values()]);
  const introductionCount = introductions?.length ?? 0;
  const acceptedCount = (introductions ?? []).filter((item) =>
    ["accepted", "completed"].includes(item.status),
  ).length;
  const acceptanceRate = introductionCount
    ? Math.round((acceptedCount / introductionCount) * 100)
    : 0;
  const meetingCount = (introductions ?? []).filter(
    (item) => item.meeting_at,
  ).length;
  const outcomeCount = (introductions ?? []).filter(
    (item) => item.status === "completed" || item.outcome,
  ).length;
  const screeningDurations = (reveals ?? []).flatMap((reveal) => {
    const calculated = (matchSnapshots ?? [])
      .filter(
        (match) =>
          match.venture_id === reveal.venture_id &&
          match.reviewer_id === reveal.reviewer_id &&
          new Date(match.calculated_at) <= new Date(reveal.revealed_at),
      )
      .sort(
        (a, b) =>
          new Date(b.calculated_at).getTime() -
          new Date(a.calculated_at).getTime(),
      )[0];
    return calculated
      ? [
          Math.max(
            0,
            Math.round(
              (new Date(reveal.revealed_at).getTime() -
                new Date(calculated.calculated_at).getTime()) /
                60_000,
            ),
          ),
        ]
      : [];
  });
  const screeningMinutes = median(screeningDurations);

  return (
    <WorkspaceFrame
      name={profile?.display_name ?? user.email ?? "Institution member"}
      roles={roles}
      eyebrow="Institution workspace"
      title={org?.name ?? "Cohort operations"}
      intro="Coordinate readiness reviews, permissions, introductions, and measurable pilot outcomes."
    >
      <div className="cohort-stats">
        <div>
          <Users />
          <strong>{ventureIds.length}</strong>
          <span>active founders</span>
        </div>
        <div>
          <BarChart3 />
          <strong>{completion}%</strong>
          <span>median completion</span>
        </div>
        <div>
          <Clock3 />
          <strong>
            {screeningDurations.length ? `${screeningMinutes}m` : "—"}
          </strong>
          <span>screening time</span>
        </div>
        <div>
          <Handshake />
          <strong>{introductionCount}</strong>
          <span>introductions</span>
        </div>
        <div>
          <Handshake />
          <strong>{acceptanceRate}%</strong>
          <span>match acceptance</span>
        </div>
        <div>
          <Users />
          <strong>{meetingCount}</strong>
          <span>meetings scheduled</span>
        </div>
        <div>
          <BarChart3 />
          <strong>{outcomeCount}</strong>
          <span>outcomes recorded</span>
        </div>
      </div>
      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Cohorts</span>
              <h2>Private programs</h2>
            </div>
            <Building2 />
          </div>
          {cohorts?.length ? (
            <div className="membership-list">
              {cohorts.map((cohort) => (
                <div key={cohort.id}>
                  <div>
                    <strong>{cohort.name}</strong>
                    <span>
                      {cohort.starts_on ?? "Dates not set"} · {cohort.status}
                    </span>
                  </div>
                  <code>{cohort.id}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Building2 />
              <h3>No cohort yet</h3>
              <p>
                Create a draft before inviting founders or assigning reviewers.
              </p>
            </div>
          )}
        </section>
        {org && isManager && (
          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">New cohort</span>
                <h2>Start as a private draft</h2>
              </div>
            </div>
            <ActionForm action={createCohortAction} submitLabel="Create cohort">
              <input type="hidden" name="organizationId" value={org.id} />
              <label>
                <span>Cohort name</span>
                <input name="name" required minLength={3} />
              </label>
              <div className="form-grid">
                <label>
                  <span>Start date</span>
                  <input name="startsOn" type="date" />
                </label>
                <label>
                  <span>End date</span>
                  <input name="endsOn" type="date" />
                </label>
              </div>
            </ActionForm>
          </section>
        )}
      </div>

      {org && isManager && (
        <div className="workspace-columns">
          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Pilot invitations</span>
                <h2>Invite a founder or reviewer</h2>
              </div>
              <UserPlus />
            </div>
            <ActionForm
              action={createInvitationAction}
              submitLabel="Create invitation"
            >
              <label>
                <span>Email</span>
                <input name="email" type="email" required />
              </label>
              <label>
                <span>Role</span>
                <select name="role">
                  <option value="founder">
                    Founder (new private venture workspace)
                  </option>
                  <option value="institution_reviewer">
                    Reviewer (this institution)
                  </option>
                </select>
              </label>
              <label>
                <span>Institution organization for reviewers</span>
                <select name="organizationId">
                  <option value="">
                    No institution membership—for founders
                  </option>
                  <option value={org.id}>{org.name}</option>
                </select>
              </label>
            </ActionForm>
          </section>
          <section className="workspace-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Cohort membership</span>
                <h2>Add a consented venture</h2>
              </div>
              <Users />
            </div>
            <ActionForm
              action={addVentureToCohortAction}
              submitLabel="Add venture"
            >
              <label>
                <span>Cohort</span>
                <select name="cohortId" required>
                  {(cohorts ?? []).map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  Venture ID supplied by the founder or pilot administrator
                </span>
                <input name="ventureId" placeholder="UUID" required />
              </label>
            </ActionForm>
          </section>
        </div>
      )}

      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Review assignments</span>
            <h2>Founder records in this pilot</h2>
          </div>
          <Users />
        </div>
        {cohortVentures?.length ? (
          <div
            className="cohort-table"
            role="table"
            aria-label="Cohort ventures"
          >
            <div role="row">
              <span>Venture</span>
              <span>Program</span>
              <span>Stage</span>
              <span>Review controls</span>
            </div>
            {cohortVentures.map((item) => {
              const venture = (
                Array.isArray(item.ventures) ? item.ventures[0] : item.ventures
              ) as Record<string, unknown> | null;
              const cohort = (cohorts ?? []).find(
                (entry) => entry.id === item.cohort_id,
              );
              return (
                <div role="row" key={`${item.cohort_id}-${item.venture_id}`}>
                  <strong>{String(venture?.name ?? item.venture_id)}</strong>
                  <span>{cohort?.name ?? "Cohort"}</span>
                  <span>{String(venture?.stage ?? "—")}</span>
                  <div className="review-controls">
                    {isManager ? (
                      <form action={assignCohortReviewerFormAction}>
                        <input
                          type="hidden"
                          name="cohortId"
                          value={item.cohort_id}
                        />
                        <input
                          type="hidden"
                          name="ventureId"
                          value={item.venture_id}
                        />
                        <select
                          name="reviewerId"
                          aria-label="Reviewer"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Assign reviewer
                          </option>
                          {(reviewers ?? []).map((reviewer) => (
                            <option
                              key={reviewer.user_id}
                              value={reviewer.user_id}
                            >
                              {String(
                                reviewer.profiles?.[0]?.display_name ??
                                  reviewer.user_id,
                              )}
                            </option>
                          ))}
                        </select>
                        <button className="button button-quiet">Assign</button>
                      </form>
                    ) : (
                      <span>Assigned privately</span>
                    )}
                    {hasRole(memberships, [
                      "institution_reviewer",
                      "platform_admin",
                    ]) && (
                      <form action={reviewReadinessSectionAction}>
                        <input
                          type="hidden"
                          name="ventureId"
                          value={item.venture_id}
                        />
                        <select
                          name="dimension"
                          aria-label="Readiness dimension to review"
                        >
                          <option value="problem">Problem</option>
                          <option value="market">Market</option>
                          <option value="solution">Solution</option>
                          <option value="traction">Traction</option>
                          <option value="team">Team</option>
                          <option value="business_model">Business model</option>
                          <option value="use_of_funds">Use of funds</option>
                          <option value="financial_readiness">Financial</option>
                          <option value="legal_readiness">Legal</option>
                        </select>
                        <button className="button button-quiet">
                          Mark reviewed
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <BarChart3 />
            <h3>No cohort activity yet</h3>
            <p>
              Completion, screening time, match acceptance, meetings, and
              outcomes appear only after real consented activity.
            </p>
          </div>
        )}
      </section>

      {isManager && introductionCount > 0 && (
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Introduction coordination</span>
              <h2>Record meetings and pilot outcomes</h2>
            </div>
            <Handshake />
          </div>
          <div className="record-list">
            {(introductions ?? []).map((introduction) => {
              const cohortVenture = (cohortVentures ?? []).find(
                (item) => item.venture_id === introduction.venture_id,
              );
              const venture = (
                Array.isArray(cohortVenture?.ventures)
                  ? cohortVenture.ventures[0]
                  : cohortVenture?.ventures
              ) as Record<string, unknown> | null | undefined;
              return (
                <article key={introduction.id}>
                  <span>{introduction.status}</span>
                  <p>
                    <strong>
                      {String(venture?.name ?? introduction.venture_id)}
                    </strong>
                    {introduction.meeting_at
                      ? ` · meeting ${new Date(introduction.meeting_at).toLocaleString("en-PH")}`
                      : " · no meeting recorded"}
                    {introduction.outcome ? ` · ${introduction.outcome}` : ""}
                  </p>
                  <ActionForm
                    action={coordinateIntroductionAction}
                    submitLabel="Save coordination"
                  >
                    <input
                      type="hidden"
                      name="introductionId"
                      value={introduction.id}
                    />
                    <label>
                      <span>Meeting date and time</span>
                      <input
                        name="meetingAt"
                        type="datetime-local"
                        defaultValue={
                          introduction.meeting_at
                            ? new Date(introduction.meeting_at)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                      />
                    </label>
                    <label>
                      <span>Outcome note</span>
                      <textarea
                        name="outcome"
                        defaultValue={introduction.outcome ?? ""}
                        maxLength={1200}
                        placeholder="Meeting held, next step, or no-fit reason"
                      />
                    </label>
                  </ActionForm>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </WorkspaceFrame>
  );
}
