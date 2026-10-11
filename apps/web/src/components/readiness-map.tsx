import { Check, CircleDot, FileCheck2, Minus } from "lucide-react";
import type { ReadinessItem } from "@/lib/domain";
import { formatState } from "@/lib/format";

const icons = {
  not_started: <Minus />,
  in_progress: <CircleDot />,
  evidence_linked: <FileCheck2 />,
  reviewed: <Check />,
};

export function ReadinessMap({ items }: { items: ReadinessItem[] }) {
  return (
    <div className="readiness-grid">
      {items.map((item) => (
        <article
          key={item.dimension}
          className={`readiness-card ${item.state}`}
        >
          <span className="readiness-icon">{icons[item.state]}</span>
          <div>
            <h3>{item.label}</h3>
            <p>
              {item.completedFields}/{item.requiredFields} fields ·{" "}
              {item.evidenceCount} evidence item
              {item.evidenceCount === 1 ? "" : "s"}
            </p>
            <strong>{formatState(item.state)}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
