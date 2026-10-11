"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Mail, ShieldCheck } from "lucide-react";

export function SignInForm({
  configured,
  next = "/workspace",
}: {
  configured: boolean;
  next?: string;
}) {
  const [state, setState] = useState({ loading: false, message: "" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      setState({
        loading: false,
        message: "Authentication is not configured in this deployment.",
      });
      return;
    }
    const email = String(new FormData(event.currentTarget).get("email"));
    setState({ loading: true, message: "" });
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      const payload = await response.json();
      setState({
        loading: false,
        message:
          payload.message ?? "Check your email for a secure sign-in link.",
      });
    } catch {
      setState({
        loading: false,
        message: "Sign-in email is temporarily unavailable.",
      });
    }
  }
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        <span>Invited email address</span>
        <div className="input-with-icon">
          <Mail />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@organization.ph"
          />
        </div>
      </label>
      <button
        className="button button-primary button-large button-block"
        disabled={state.loading}
      >
        {state.loading ? (
          <LoaderCircle className="spin" />
        ) : (
          "Email me a sign-in link"
        )}
      </button>
      {state.message && (
        <div className="form-message" role="status">
          {state.message}
        </div>
      )}
      <div className="auth-security">
        <ShieldCheck />
        <p>
          PitchPond will not create an account unless your email has an active
          invitation.
        </p>
      </div>
    </form>
  );
}
