import Link from "next/link";
import { LockKeyhole, Network, ShieldCheck } from "lucide-react";
import { SignInForm } from "@/components/sign-in-form";
import { hasSupabaseConfig } from "@/lib/env";
import { safeAuthenticatedPath } from "@/lib/request-security";
export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="auth-page">
      <section className="auth-story">
        <div>
          <span className="eyebrow light">Invitation-only pilot</span>
          <h1>
            Your evidence. Your permissions. Your next right conversation.
          </h1>
          <p>Use the email address that received your PitchPond invitation.</p>
          <ul>
            <li>
              <LockKeyhole />
              Passwordless secure sign-in
            </li>
            <li>
              <ShieldCheck />
              Private evidence with explicit grants
            </li>
            <li>
              <Network />
              Transparent readiness and matching
            </li>
          </ul>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to PitchPond</h2>
          <p>
            We will send a one-time secure link to an invited email address.
          </p>
          <SignInForm
            configured={hasSupabaseConfig()}
            next={safeAuthenticatedPath(next)}
          />
          <p className="auth-help">
            Not invited yet? <Link href="/pilot">Apply for the pilot.</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
