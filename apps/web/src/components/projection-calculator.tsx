"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calculator, LoaderCircle } from "lucide-react";

type Result = {
  probability: number;
  confidence: number;
  inputKind: "assumption_based" | "data_backed";
  status: "on_track" | "watch" | "at_risk";
};

export function ProjectionCalculator({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<
    "cautious" | "baseline" | "accelerated"
  >("baseline");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function calculate() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/projections/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, scenario }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.message ?? "Projection could not be calculated.");
        return;
      }
      setResult(payload.data);
      setMessage(
        "A new immutable snapshot was saved. Previous results remain available.",
      );
      router.refresh();
    } catch {
      setMessage(
        "Projection calculation is unavailable. The previous snapshot was not changed.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="projection-calculate-control">
      <fieldset>
        <legend>Operating scenario</legend>
        <div className="segmented-control">
          {(["cautious", "baseline", "accelerated"] as const).map((item) => (
            <button
              type="button"
              aria-pressed={scenario === item}
              onClick={() => setScenario(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        className="button button-primary"
        type="button"
        onClick={calculate}
        disabled={pending}
      >
        {pending ? <LoaderCircle className="spin" /> : <Calculator />}
        {pending ? "Running 10,000 paths…" : "Calculate and save snapshot"}
      </button>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
      {result && (
        <div className="projection-inline-result" aria-live="polite">
          <strong>{result.probability}%</strong>
          <span>
            {result.inputKind === "data_backed"
              ? "Data-backed likelihood"
              : "Assumption-based scenario likelihood"}
          </span>
          <small>{result.confidence}/100 data confidence · {result.status.replace("_", " ")}</small>
        </div>
      )}
    </div>
  );
}
