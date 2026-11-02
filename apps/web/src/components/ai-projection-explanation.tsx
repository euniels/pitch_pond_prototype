"use client";

import { useState } from "react";
import { BrainCircuit, LoaderCircle, ShieldCheck } from "lucide-react";

type ProjectionExplanation = {
  summary: string;
  positiveDrivers: string[];
  negativeDrivers: string[];
  sensitivity: string[];
  missingOrStaleData: string[];
  evidenceBackedRisks: Array<{ risk: string; evidenceIds: string[] }>;
  nextActions: string[];
  investorQuestions: string[];
  limitations: string[];
};

export function AiProjectionExplanation({
  runId,
  ventureId,
  evidenceIds = [],
  allowExactValues = false,
}: {
  runId: string;
  ventureId: string;
  evidenceIds?: string[];
  allowExactValues?: boolean;
}) {
  const [consent, setConsent] = useState(false);
  const [includeExact, setIncludeExact] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [explanation, setExplanation] =
    useState<ProjectionExplanation | null>(null);

  async function explain() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai/projection_explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectionRunId: runId,
          ventureId,
          evidenceIds,
          consent,
          includeExactFinancials: allowExactValues && includeExact,
          content: null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(
          payload.message ??
            "AI explanation is unavailable. The deterministic forecast remains available.",
        );
        return;
      }
      setExplanation(payload.data);
      setMessage(
        "Advisory explanation created. The saved likelihood and forecast did not change.",
      );
    } catch {
      setMessage(
        "AI explanation is unavailable. The deterministic forecast remains authoritative.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ai-review projection-ai-review">
      <div className="projection-ai-heading">
        <BrainCircuit />
        <div>
          <strong>Explain this projection with AI</strong>
          <span>AI explains the fixed result; it cannot alter the percentage.</span>
        </div>
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          I consent to sending this saved projection and the selected clean
          evidence for an advisory explanation.
        </span>
      </label>
      {allowExactValues && (
        <label className="check-row">
          <input
            type="checkbox"
            checked={includeExact}
            onChange={(event) => setIncludeExact(event.target.checked)}
          />
          <span>Also include exact financial values in this one request.</span>
        </label>
      )}
      <button
        className="button button-secondary"
        type="button"
        disabled={!consent || pending}
        onClick={explain}
      >
        {pending ? <LoaderCircle className="spin" /> : <BrainCircuit />}
        {pending ? "Explaining…" : "Generate advisory explanation"}
      </button>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      {explanation && (
        <div className="ai-output projection-ai-output">
          <label>
            <span>Editable summary</span>
            <textarea defaultValue={explanation.summary} rows={5} />
          </label>
          <div className="projection-ai-columns">
            <div>
              <strong>Positive drivers</strong>
              <ul>
                {explanation.positiveDrivers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Risks and missing data</strong>
              <ul>
                {[...explanation.negativeDrivers, ...explanation.missingOrStaleData].map(
                  (item) => <li key={item}>{item}</li>,
                )}
              </ul>
            </div>
            <div>
              <strong>Next actions</strong>
              <ul>
                {explanation.nextActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="projection-ai-boundary">
            <ShieldCheck /> This narrative is editable and advisory. It is not
            an investment recommendation or a new forecast.
          </p>
        </div>
      )}
    </div>
  );
}
