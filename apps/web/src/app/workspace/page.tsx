import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  ShieldCheck,
  Sprout,
  Target,
} from "lucide-react";
import { WorkspaceFrame } from "@/components/workspace-frame";
import { getWorkspaceContext } from "@/lib/workspace";
import { formatState } from "@/lib/format";
import { markNotificationReadAction } from "./actions";

export const metadata = {
  title: "Workspace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function Page() {
  const { supabase, profile, user, memberships } = await getWorkspaceContext();
  const [{ data: notifications }, { data: consents }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id,title,body,link,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("consent_records")
      .select("id,purpose,granted,evidence_ids,policy_version,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const roles = [...new Set(memberships.map((item) => item.role))];
  const name = profile?.display_name ?? user.email ?? "Pilot member";
  const cards = [
    {
      role: "founder",
      href: "/workspace/founder",
      icon: Sprout,
      title: "Founder Studio",
      body: "Build the venture profile, readiness map, claims, evidence, and Fundability Graph.",
    },
    {
      role: "investor_mentor",
      href: "/workspace/investor",
      icon: Target,
      title: "Thesis & matches",
      body: "Define explicit criteria, use Blind First Look, and understand every match.",
    },
    {
      role: "institution_manager",
      also: "institution_reviewer",
      href: "/workspace/institution",
      icon: Building2,
      title: "Institution workspace",
      body: "Manage cohorts, assignments, progress, introductions, and pilot outcomes.",
    },
    {
      role: "platform_admin",
      href: "/workspace/admin",
      icon: ShieldCheck,
      title: "Administration",
      body: "Manage invitations, entitlements, configuration, and audit operations.",
    },
  ].filter(
    (card) =>
      roles.includes(card.role as (typeof roles)[number]) ||
      (card.also && roles.includes(card.also as (typeof roles)[number])),
  );
  return (
    <WorkspaceFrame
      name={name}
      roles={roles}
      eyebrow="Private pilot workspace"
      title={`Welcome, ${name.split(" ")[0]}.`}
      intro="Choose a workspace based on your active organization memberships."
    >
      <section className="workspace-grid">
        {cards.map(({ href, icon: Icon, title, body }) => (
          <Link className="workspace-launch" href={href} key={href}>
            <Icon />
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
            <ArrowRight />
          </Link>
        ))}
      </section>
      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Access context</span>
            <h2>Your memberships</h2>
          </div>
        </div>
        {memberships.length ? (
          <div className="membership-list">
            {memberships.map((membership) => (
              <div key={membership.id}>
                <div>
                  <strong>{membership.organizations.name}</strong>
                  <span>
                    {membership.organizations.region ?? "Philippines"}
                  </span>
                </div>
                <span className="status-pill">
                  {formatState(membership.role)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShieldCheck />
            <h3>No active membership</h3>
            <p>
              Your account is authenticated, but an administrator still needs to
              assign your pilot role.
            </p>
          </div>
        )}
      </section>
      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Privacy record</span>
            <h2>Consent history</h2>
          </div>
          <ShieldCheck />
        </div>
        {consents?.length ? (
          <div className="record-list">
            {consents.map((consent) => (
              <article key={consent.id}>
                <span>{formatState(consent.purpose)}</span>
                <p>
                  {consent.granted ? "Granted" : "Declined"} ·{" "}
                  {consent.evidence_ids.length} selected evidence item
                  {consent.evidence_ids.length === 1 ? "" : "s"} · policy{" "}
                  {consent.policy_version} ·{" "}
                  {new Date(consent.created_at).toLocaleString("en-PH")}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShieldCheck />
            <h3>No consent events yet</h3>
            <p>Explicit AI and evidence-sharing decisions will appear here.</p>
          </div>
        )}
      </section>
      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Activity</span>
            <h2>Notifications</h2>
          </div>
          <Bell />
        </div>
        {notifications?.length ? (
          <div className="record-list notification-list">
            {notifications.map((notification) => (
              <article key={notification.id}>
                <div>
                  <span>{notification.read_at ? "Read" : "New"}</span>
                  <strong>{notification.title}</strong>
                  <p>{notification.body}</p>
                </div>
                <div className="match-actions">
                  {notification.link && (
                    <Link
                      className="button button-quiet"
                      href={notification.link}
                    >
                      Open
                    </Link>
                  )}
                  {!notification.read_at && (
                    <form action={markNotificationReadAction}>
                      <input
                        type="hidden"
                        name="notificationId"
                        value={notification.id}
                      />
                      <button className="button button-quiet">Mark read</button>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Bell />
            <h3>No notifications</h3>
            <p>
              Invitation, introduction, access, and diligence updates appear
              here.
            </p>
          </div>
        )}
      </section>
    </WorkspaceFrame>
  );
}
