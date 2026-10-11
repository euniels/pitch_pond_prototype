import { redirect } from "next/navigation";
import {
  Activity,
  Building2,
  FileWarning,
  KeyRound,
  ShieldCheck,
  ToggleLeft,
} from "lucide-react";
import { WorkspaceFrame } from "@/components/workspace-frame";
import { ActionForm } from "@/components/action-form";
import {
  activateMatchingRubricAction,
  assignPlanAction,
  createInvitationAction,
  createOrganizationAction,
  rejectQuarantinedEvidenceAction,
  setFeatureFlagAction,
} from "../actions";
import { getWorkspaceContext, hasRole } from "@/lib/workspace";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function Page() {
  const { supabase, user, profile, memberships } = await getWorkspaceContext();
  if (!hasRole(memberships, ["platform_admin"])) redirect("/workspace");
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.data?.currentLevel !== "aal2")
    redirect("/workspace/security?next=/workspace/admin");
  const roles = [...new Set(memberships.map((item) => item.role))];
  const [
    inviteResult,
    quarantineResult,
    aiResult,
    auditResult,
    organizationResult,
    planResult,
    flagResult,
    rubricResult,
  ] = await Promise.all([
    supabase
      .from("invitations")
      .select("id", { count: "exact", head: true })
      .is("accepted_at", null),
    supabase
      .from("evidence_items")
      .select("id,title,file_name,status,created_at", { count: "exact" })
      .in("status", ["quarantined", "scanning"])
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("ai_runs").select("id", { count: "exact", head: true }),
    supabase
      .from("audit_events")
      .select("id,action,entity_type,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("organizations").select("id,name,kind,region").order("name"),
    supabase.from("plans").select("id,name").eq("active", true).order("name"),
    supabase
      .from("feature_flags")
      .select("key,description,enabled")
      .order("key"),
    supabase
      .from("matching_rubrics")
      .select("version,name,weights,hard_exclusions,active,created_at")
      .order("created_at", { ascending: false }),
  ]);
  const organizations = organizationResult.data ?? [];
  const plans = planResult.data ?? [];
  const flags = flagResult.data ?? [];
  const quarantine = quarantineResult.data ?? [];
  const audit = auditResult.data ?? [];
  const rubrics = rubricResult.data ?? [];
  const activeRubric = rubrics.find((rubric) => rubric.active);

  return (
    <WorkspaceFrame
      name={profile?.display_name ?? user.email ?? "Administrator"}
      roles={roles}
      eyebrow="Platform administration"
      title="Operate the pilot with an audit trail."
      intro="Administrative access manages workflow and entitlements—it cannot silently alter readiness or compatibility calculations."
    >
      <div className="cohort-stats">
        <div>
          <KeyRound />
          <strong>{inviteResult.count ?? 0}</strong>
          <span>open invitations</span>
        </div>
        <div>
          <FileWarning />
          <strong>{quarantineResult.count ?? 0}</strong>
          <span>files in quarantine</span>
        </div>
        <div>
          <Activity />
          <strong>{aiResult.count ?? 0}</strong>
          <span>AI runs recorded</span>
        </div>
        <div>
          <ShieldCheck />
          <strong>{activeRubric?.version ?? "None"}</strong>
          <span>active match rubric</span>
        </div>
      </div>

      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Invitation control</span>
              <h2>Invite a pilot member</h2>
            </div>
            <KeyRound />
          </div>
          <ActionForm
            action={createInvitationAction}
            submitLabel="Create invitation"
          >
            <label>
              <span>Email address</span>
              <input name="email" type="email" required />
            </label>
            <label>
              <span>Role</span>
              <select name="role">
                <option value="founder">Founder</option>
                <option value="investor_mentor">Investor / mentor</option>
                <option value="institution_reviewer">
                  Institution reviewer
                </option>
                <option value="institution_manager">Institution manager</option>
                <option value="platform_admin">Platform administrator</option>
              </select>
            </label>
            <label>
              <span>Organization</span>
              <select name="organizationId">
                <option value="">
                  Create a role-appropriate workspace on acceptance
                </option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name} · {organization.kind}
                  </option>
                ))}
              </select>
            </label>
          </ActionForm>
        </section>
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Organizations</span>
              <h2>Create a managed workspace</h2>
            </div>
            <Building2 />
          </div>
          <ActionForm
            action={createOrganizationAction}
            submitLabel="Create organization"
          >
            <label>
              <span>Name</span>
              <input name="name" minLength={2} required />
            </label>
            <div className="form-grid">
              <label>
                <span>Type</span>
                <select name="kind">
                  <option value="institution">Institution</option>
                  <option value="investor">Investor</option>
                  <option value="venture">Venture</option>
                  <option value="platform">Platform</option>
                </select>
              </label>
              <label>
                <span>Region</span>
                <input name="region" placeholder="CALABARZON" />
              </label>
            </div>
          </ActionForm>
        </section>
      </div>

      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Matching governance</span>
            <h2>Versioned deterministic rubrics</h2>
          </div>
          <ShieldCheck />
        </div>
        <p className="panel-intro">
          Rubric definitions are shipped through reviewed migrations. Activation
          is atomic, requires MFA, and creates an immutable audit event;
          existing match snapshots keep their original version and factor
          breakdown.
        </p>
        <div className="control-list">
          {rubrics.map((rubric) => (
            <div key={rubric.version}>
              <div>
                <strong>
                  {rubric.name} · {rubric.version}
                </strong>
                <span>
                  {rubric.active ? "Active" : "Inactive"} · weights total{" "}
                  {Object.values(
                    rubric.weights as Record<string, number>,
                  ).reduce((sum, weight) => sum + Number(weight), 0)}
                </span>
              </div>
              {!rubric.active && (
                <form action={activateMatchingRubricAction}>
                  <input type="hidden" name="version" value={rubric.version} />
                  <button className="button button-quiet">Activate</button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Manual plans</span>
              <h2>Assign pilot entitlements</h2>
            </div>
            <ShieldCheck />
          </div>
          <ActionForm action={assignPlanAction} submitLabel="Assign plan">
            <label>
              <span>Organization</span>
              <select name="organizationId" required>
                <option value="">Select organization</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                <span>Plan</span>
                <select name="planId" required>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Optional end date</span>
                <input name="endsAt" type="date" />
              </label>
            </div>
          </ActionForm>
        </section>
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Feature controls</span>
              <h2>Explicit pilot flags</h2>
            </div>
            <ToggleLeft />
          </div>
          <div className="control-list">
            {flags.map((flag) => (
              <div key={flag.key}>
                <div>
                  <strong>{flag.key.replaceAll("_", " ")}</strong>
                  <span>{flag.description}</span>
                </div>
                <form action={setFeatureFlagAction}>
                  <input type="hidden" name="key" value={flag.key} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={String(!flag.enabled)}
                  />
                  <button className="button button-quiet">
                    {flag.enabled ? "Disable" : "Enable"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Quarantine</span>
              <h2>Files awaiting a clean result</h2>
            </div>
            <FileWarning />
          </div>
          {quarantine.length ? (
            <div className="control-list">
              {quarantine.map((item) => (
                <div key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {item.file_name} · {item.status}
                    </span>
                  </div>
                  <form action={rejectQuarantinedEvidenceAction}>
                    <input type="hidden" name="evidenceId" value={item.id} />
                    <button className="button button-quiet">Reject</button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck />
              <h3>Quarantine is clear</h3>
              <p>
                Only a configured scanner can mark a file clean; administrators
                may reject but cannot bypass scanning.
              </p>
            </div>
          )}
        </section>
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Immutable activity</span>
              <h2>Recent audit events</h2>
            </div>
            <Activity />
          </div>
          {audit.length ? (
            <div className="audit-list">
              {audit.map((event) => (
                <div key={event.id}>
                  <strong>{event.action.replaceAll("_", " ")}</strong>
                  <span>
                    {event.entity_type} ·{" "}
                    {new Date(event.created_at).toLocaleString("en-PH")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck />
              <h3>No events yet</h3>
              <p>
                Identity reveals, grants, role changes, and administrative
                actions will be recorded here.
              </p>
            </div>
          )}
        </section>
      </div>
    </WorkspaceFrame>
  );
}
