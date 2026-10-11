"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

type Summary = {
  title: string;
  summary: string;
  supportedClaims: Array<{ claim: string; evidenceIds: string[] }>;
  unresolvedQuestions: string[];
  limitations: string[];
};

export function AiEvidenceSummary({
  ventureId,
  items,
}: {
  ventureId: string;
  items: Array<{ id: string; title: string }>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 5) {
        setMessage("Select no more than five files for one summary.");
        return current;
      }
      return [...current, id];
    });
  }

  async function summarize() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai/evidence_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventureId,
          evidenceIds: selected,
          consent,
          content: null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.message ?? "Evidence summary is unavailable.");
        return;
      }
      setSummary(payload.data);
      setMessage(
        "Advisory summary created from the selected clean files. Verify it against the originals.",
      );
    } catch {
      setMessage(
        "Evidence summary is unavailable. Your source files and readiness state are unchanged.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!items.length) return null;
  return (
    <div className="ai-review compact-ai-review">
      <strong>Optional AI evidence summary</strong>
      <div className="check-options">
        {items.map((item) => (
          <label key={item.id}>
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggle(item.id)}
            />
            {item.title}
          </label>
        ))}
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          I consent to sending extracted text from only these selected clean
          files.
        </span>
      </label>
      <button
        className="button button-quiet"
        type="button"
        disabled={!consent || !selected.length || pending}
        onClick={summarize}
      >
        {pending ? <LoaderCircle className="spin" /> : <Sparkles />}
        {pending ? "Summarizing…" : "Create advisory summary"}
      </button>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      {summary && (
        <div className="ai-output">
          <strong>{summary.title}</strong>
          <label>
            <span>Editable summary</span>
            <textarea defaultValue={summary.summary} rows={5} />
          </label>
          <p>
            <strong>Unresolved questions:</strong>{" "}
            {summary.unresolvedQuestions.join(" · ") || "None returned."}
          </p>
          {summary.limitations.length > 0 && (
            <p>Limitations: {summary.limitations.join(" ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
