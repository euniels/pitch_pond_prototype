"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { ApiError, browserApi } from "@/lib/api";
import { Brand } from "./brand";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"backer" | "founder">("backer");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "signin") {
        await browserApi("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email: values.email, password: values.password, remember: values.remember === "on" }) });
      } else {
        await browserApi("/api/v1/auth/register", { method: "POST", body: JSON.stringify({ name: values.name, email: values.email, password: values.password, password_confirmation: values.passwordConfirmation, role, locale: "en", inviteCode: values.inviteCode }) });
      }
      router.push("/dashboard"); router.refresh();
    } catch (reason) {
      const apiError = reason as ApiError;
      setError(apiError.errors ? Object.values(apiError.errors).flat()[0] : apiError.message);
    } finally { setLoading(false); }
  };

  return <div className="auth-page"><div className="auth-side"><div><Brand /><span className="eyebrow">Invite-controlled beta</span><h1>Come in with a purpose. Leave with clarity.</h1><p>Founders build transparent campaigns. Backers see verification, risks, funding rules, and fulfilment in one place.</p><ul><li><LockKeyhole /> Secure session cookies</li><li>Donation and reward campaigns only</li><li>English and Filipino experience</li></ul></div></div><div className="auth-main"><div className="auth-card"><div className="auth-tabs"><button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Create account</button></div><div className="auth-heading"><h2>{mode === "signin" ? "Welcome back" : "Join the closed beta"}</h2><p>{mode === "signin" ? "Use your verified PitchPond account." : "You will need an invitation from the beta team."}</p></div><form onSubmit={submit}>{mode === "register" && <><label><span>Full name</span><input name="name" autoComplete="name" required /></label><fieldset><legend>I want to</legend><div className="role-picker"><button type="button" className={role === "backer" ? "selected" : ""} onClick={() => setRole("backer")}><strong>Back campaigns</strong><span>Discover and support projects</span></button><button type="button" className={role === "founder" ? "selected" : ""} onClick={() => setRole("founder")}><strong>Raise funds</strong><span>Build and submit a campaign</span></button></div></fieldset></>}<label><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label><label><span>Password</span><div className="password-field"><input name="password" type={showPassword ? "text" : "password"} minLength={12} autoComplete={mode === "signin" ? "current-password" : "new-password"} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>{mode === "register" && <><label><span>Confirm password</span><input name="passwordConfirmation" type="password" minLength={12} autoComplete="new-password" required /></label><label><span>Invite code</span><input name="inviteCode" required /></label><label className="check-label"><input type="checkbox" required /> I agree to the beta terms and privacy notice.</label></>}{mode === "signin" && <label className="check-label"><input name="remember" type="checkbox" /> Keep me signed in on this device</label>}{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary button-block button-large" disabled={loading}>{loading ? <LoaderCircle className="spin" /> : mode === "signin" ? "Sign in" : "Create account"}</button></form>{process.env.NEXT_PUBLIC_SHOW_DEV_ACCOUNTS === "true" && <div className="dev-accounts"><strong>Local development accounts</strong><code>founder@pitchpond.local</code><code>backer@pitchpond.local</code><code>admin@pitchpond.local</code><span>Password: PitchPondDemo!2026</span></div>}<p className="auth-legal">By continuing, you acknowledge that PitchPond does not currently offer investments. <Link href="/legal">Review beta policies.</Link></p></div></div></div>;
}
