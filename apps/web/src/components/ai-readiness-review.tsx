"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

type Advice = {
  summary: string;
  gaps: Array<{
    dimension: string;
    observation: string;
    nextStep: string;
    evidenceIds: string[];
  }>;
  limitations: string[];
};

export function AiReadinessReview({
  ventureId,
  content,
}: {
  ventureId: string;
  content: unknown;
}) {
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);

  async function requestReview() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai/readiness_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventureId,
          evidenceIds: [],
          consent,
          content,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.message ?? "AI assistance is unavailable.");
        return;
      }
      setAdvice(payload.data);
      setMessage(
        "Advisory draft created. Review and edit it before using it elsewhere.",
      );
    } catch {
      setMessage(
        "AI assistance is unavailable. Your objective readiness map is unchanged.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ai-review">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Optional AI gap review</span>
          <h2>Get an editable advisory draft</h2>
        </div>
        <Sparkles />
      </div>
      <p>
        This request sends only the venture fields and readiness text shown in
        this workspace. No evidence file content is included.
      </p>
      <label className="check-row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          I consent to sending these selected profile fields for this advisory
          review.
        </span>
      </label>
      <button
        className="button button-secondary"
        type="button"
        disabled={!consent || pending}
        onClick={requestReview}
      >
        {pending ? <LoaderCircle className="spin" /> : <Sparkles />}
        {pending ? "Reviewing…" : "Request AI review"}
      </button>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      {advice && (
        <div className="ai-output">
          <label>
            <span>Editable summary</span>
            <textarea defaultValue={advice.summary} rows={5} />
          </label>
          <div className="record-list">
            {advice.gaps.map((gap, index) => (
              <article key={`${gap.dimension}-${index}`}>
                <span>{gap.dimension}</span>
                <p>{gap.observation}</p>
                <strong>Next: {gap.nextStep}</strong>
              </article>
            ))}
          </div>
          {advice.limitations.length > 0 && (
            <p className="form-message">
              Limitations: {advice.limitations.join(" ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
