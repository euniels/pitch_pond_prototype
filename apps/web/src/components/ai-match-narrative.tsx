"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import type { MatchResult } from "@/lib/domain";

type Narrative = {
  headline: string;
  fitSummary: string;
  strengths: string[];
  mismatches: string[];
  questions: string[];
};

export function AiMatchNarrative({
  ventureId,
  matchId,
  result,
}: {
  ventureId: string;
  matchId: string;
  result: MatchResult;
}) {
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [narrative, setNarrative] = useState<Narrative | null>(null);

  async function explain() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai/match_explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventureId,
          matchId,
          evidenceIds: [],
          consent,
          content: {
            score: result.score,
            rubricVersion: result.rubricVersion,
            factors: result.factors,
            reasons: result.reasons,
            mismatches: result.mismatches,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.message ?? "AI explanation is unavailable.");
        return;
      }
      setNarrative(payload.data);
      setMessage(
        "Advisory explanation created from the fixed factors; the score did not change.",
      );
    } catch {
      setMessage(
        "AI explanation is unavailable. The deterministic factor breakdown remains authoritative.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ai-review compact-ai-review">
      <label className="check-row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          Use the displayed deterministic factors for an optional AI narrative.
        </span>
      </label>
      <button
        className="button button-quiet"
        type="button"
        disabled={!consent || pending}
        onClick={explain}
      >
        {pending ? <LoaderCircle className="spin" /> : <Sparkles />}
        {pending ? "Explaining…" : "Explain match with AI"}
      </button>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      {narrative && (
        <div className="ai-output">
          <strong>{narrative.headline}</strong>
          <label>
            <span>Editable explanation</span>
            <textarea defaultValue={narrative.fitSummary} rows={4} />
          </label>
          <p>
            <strong>Suggested questions:</strong>{" "}
            {narrative.questions.join(" · ") || "None returned."}
          </p>
        </div>
      )}
    </div>
  );
}
