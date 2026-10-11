import { createHash } from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/lib/auth";
import { hasSupabaseAdminConfig } from "@/lib/env";
import { invitationState } from "@/lib/invitations";
import { acceptInvitationAction } from "./actions";

export const metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  if (!hasSupabaseAdminConfig())
    return (
      <InviteState
        icon={<ShieldAlert />}
        title="Invitations are not configured"
        body="This deployment is not connected to its pilot database."
      />
    );
  const { token } = await params;
  const admin = createAdminClient();
  const hash = createHash("sha256").update(token).digest("hex");
  const { data: invite } = await admin
    .from("invitations")
    .select("*")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!invite || invitationState(invite) !== "available")
    return (
      <InviteState
        icon={<Clock3 />}
        title="This invitation is unavailable"
        body="It may have expired, already been accepted, or been revoked."
      />
    );
  const user = await getOptionalUser();
  if (!user || user.email?.toLowerCase() !== invite.email.toLowerCase())
    redirect(`/sign-in?next=/invite/${encodeURIComponent(token)}`);
  const { error } = await searchParams;
  return (
    <InviteState
      icon={<CheckCircle2 />}
      title="Accept your invitation"
      body={`Confirm ${invite.role.replaceAll("_", " ")} access for ${invite.email}.`}
      token={token}
      error={error === "acceptance"}
    />
  );
}
function InviteState({
  icon,
  title,
  body,
  token,
  error = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  token?: string;
  error?: boolean;
}) {
  return (
    <main className="state-page">
      <div className="state-card">
        {icon}
        <span className="eyebrow">PitchPond pilot</span>
        <h1>{title}</h1>
        <p>{body}</p>
        {error && (
          <p className="form-error" role="alert">
            Acceptance failed. The invitation may have expired or already been
            used.
          </p>
        )}
        {token ? (
          <form action={acceptInvitationAction}>
            <input type="hidden" name="token" value={token} />
            <button className="button button-primary">Accept invitation</button>
          </form>
        ) : (
          <Link className="button button-primary" href="/pilot">
            Return to pilot page
          </Link>
        )}
      </div>
    </main>
  );
}
