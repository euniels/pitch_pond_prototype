"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Setup = { factorId: string; qr: string; secret: string };

export function MfaSetup({ next = "/workspace" }: { next?: string }) {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [state, setState] = useState({
    loading: true,
    verified: false,
    message: "",
  });

  useEffect(() => {
    let active = true;
    async function prepare() {
      const supabase = createClient();
      const assurance =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance.data?.currentLevel === "aal2") {
        if (active)
          setState({
            loading: false,
            verified: true,
            message: "Multi-factor authentication is active for this session.",
          });
        return;
      }
      const listed = await supabase.auth.mfa.listFactors();
      const existing = listed.data?.totp[0];
      if (existing) {
        if (active) {
          setSetup({ factorId: existing.id, qr: "", secret: "" });
          setState({
            loading: false,
            verified: false,
            message: "Enter the current code from your authenticator app.",
          });
        }
        return;
      }
      const enrolled = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "PitchPond pilot",
      });
      if (enrolled.error || !enrolled.data) {
        if (active)
          setState({
            loading: false,
            verified: false,
            message: enrolled.error?.message ?? "MFA setup is unavailable.",
          });
        return;
      }
      if (active) {
        setSetup({
          factorId: enrolled.data.id,
          qr: enrolled.data.totp.qr_code,
          secret: enrolled.data.totp.secret,
        });
        setState({ loading: false, verified: false, message: "" });
      }
    }
    prepare();
    return () => {
      active = false;
    };
  }, []);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!setup) return;
    setState((value) => ({ ...value, loading: true, message: "" }));
    const code = String(
      new FormData(event.currentTarget).get("code") ?? "",
    ).replaceAll(" ", "");
    const supabase = createClient();
    const challenge = await supabase.auth.mfa.challenge({
      factorId: setup.factorId,
    });
    if (challenge.error || !challenge.data) {
      setState({
        loading: false,
        verified: false,
        message: challenge.error?.message ?? "Challenge failed.",
      });
      return;
    }
    const result = await supabase.auth.mfa.verify({
      factorId: setup.factorId,
      challengeId: challenge.data.id,
      code,
    });
    if (result.error) {
      setState({
        loading: false,
        verified: false,
        message: result.error.message,
      });
      return;
    }
    setState({
      loading: false,
      verified: true,
      message: "MFA verified. Redirecting…",
    });
    window.location.assign(next.startsWith("/workspace") ? next : "/workspace");
  }

  if (state.verified)
    return (
      <div className="mfa-success">
        <CheckCircle2 />
        <div>
          <h2>MFA is active</h2>
          <p>{state.message}</p>
        </div>
      </div>
    );
  return (
    <div className="mfa-setup">
      {state.loading && !setup ? (
        <LoaderCircle className="spin" />
      ) : (
        <KeyRound />
      )}
      <div>
        <h2>Authenticator verification</h2>
        <p>
          Scan this code with an authenticator app. PitchPond requires the
          six-digit code for sensitive manager and administrator work.
        </p>
      </div>
      {setup && (
        <>
          {setup.qr && (
            <Image
              src={setup.qr}
              alt="Authenticator QR code"
              width={220}
              height={220}
              unoptimized
            />
          )}
          {setup.secret && <code>{setup.secret}</code>}
          <form onSubmit={verify}>
            <label>
              <span>Six-digit code</span>
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                required
              />
            </label>
            <button className="button button-primary" disabled={state.loading}>
              {state.loading ? (
                <LoaderCircle className="spin" />
              ) : (
                "Verify and continue"
              )}
            </button>
          </form>
        </>
      )}
      {state.message && (
        <div className="form-message" role="status">
          {state.message}
        </div>
      )}
    </div>
  );
}
