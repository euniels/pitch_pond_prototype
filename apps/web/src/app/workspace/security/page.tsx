import { MfaSetup } from "@/components/mfa-setup";
import { WorkspaceFrame } from "@/components/workspace-frame";
import { getWorkspaceContext } from "@/lib/workspace";

export const metadata = {
  title: "Account security",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { user, profile, memberships } = await getWorkspaceContext();
  const roles = [...new Set(memberships.map((item) => item.role))];
  const { next } = await searchParams;
  return (
    <WorkspaceFrame
      name={profile?.display_name ?? user.email ?? "Pilot member"}
      roles={roles}
      eyebrow="Account security"
      title="Protect sensitive workspace actions."
      intro="Institution managers and platform administrators must use authenticator-based multi-factor authentication."
    >
      <section className="workspace-panel">
        <MfaSetup next={next} />
      </section>
    </WorkspaceFrame>
  );
}
