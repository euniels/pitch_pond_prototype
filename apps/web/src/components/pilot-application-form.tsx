"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";

export function PilotApplicationForm() {
  const [state, setState] = useState<{
    loading: boolean;
    message: string;
    ok: boolean;
  }>({ loading: false, message: "", ok: false });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, message: "", ok: false });
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/pilot/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, consent: values.consent === "on" }),
      });
      const data = await response.json();
      setState({ loading: false, message: data.message, ok: response.ok });
      if (response.ok) form.reset();
    } catch {
      setState({
        loading: false,
        message:
          "The application service is unavailable. Email the pilot team instead.",
        ok: false,
      });
    }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-grid">
        <label>
          <span>Name</span>
          <input name="name" autoComplete="name" required minLength={2} />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Organization or venture</span>
          <input name="organization" autoComplete="organization" required />
        </label>
        <label>
          <span>Your role</span>
          <select name="role" required defaultValue="founder">
            <option value="founder">Founder</option>
            <option value="investor_mentor">Investor or mentor</option>
            <option value="institution">Institution or program</option>
          </select>
        </label>
        <label>
          <span>Region</span>
          <select name="region" defaultValue="CALABARZON">
            <option>CALABARZON</option>
            <option>NCR</option>
            <option>Central Luzon</option>
            <option>Other Philippine region</option>
          </select>
        </label>
        <label className="honeypot" aria-hidden="true">
          <span>Website</span>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label>
        <span>What would make this pilot valuable to you?</span>
        <textarea
          name="goals"
          required
          minLength={20}
          maxLength={1200}
          rows={5}
        />
      </label>
      <label className="check-row">
        <input name="consent" type="checkbox" required />
        <span>
          I consent to PitchPond using this information to assess pilot
          participation and contact me about the pilot.
        </span>
      </label>
      {state.message && (
        <div className={state.ok ? "form-success" : "form-error"} role="status">
          {state.ok && <CheckCircle2 />}
          {state.message}
        </div>
      )}
      <button
        className="button button-primary button-large"
        disabled={state.loading}
      >
        {state.loading ? (
          <LoaderCircle className="spin" />
        ) : (
          <>
            Submit application <ArrowRight />
          </>
        )}
      </button>
    </form>
  );
}
