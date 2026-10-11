import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { MatchResult } from "@/lib/domain";

export function MatchBreakdown({ result }: { result: MatchResult }) {
  return (
    <div className="match-breakdown">
      <div className="match-score">
        <strong>{result.score}</strong>
        <span>/ 100 compatibility</span>
        <small>Rubric {result.rubricVersion}</small>
      </div>
      <div className="factor-list">
        {result.factors.map((factor) => (
          <div key={factor.key} className={factor.matched ? "fit" : "gap"}>
            {factor.matched ? <CheckCircle2 /> : <AlertCircle />}
            <div>
              <strong>
                {factor.label} · {factor.score}/{factor.weight}
              </strong>
              <p>{factor.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
