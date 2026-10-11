import { readinessCompletion } from "@/lib/readiness";
import type { VentureProfile } from "@/lib/domain";

const positions = Array.from({ length: 9 }, (_, index) => {
  const angle = (index / 9) * Math.PI * 2 - Math.PI / 2;
  return [50 + Math.cos(angle) * 40, 48 + Math.sin(angle) * 40];
});

export function FundabilityGraph({
  venture,
  compact = false,
  claimsCount = 0,
  milestonesCount = 0,
  matchFactorCount = 0,
}: {
  venture: VentureProfile;
  compact?: boolean;
  claimsCount?: number;
  milestonesCount?: number;
  matchFactorCount?: number;
}) {
  const completion = readinessCompletion(venture.readiness);
  return (
    <figure
      className={`fundability-graph ${compact ? "compact" : ""}`}
      aria-label={`Fundability Graph for ${venture.name}. Profile completion ${completion} percent.`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="graph-glow">
            <stop stopColor="#44e1c1" stopOpacity=".9" />
            <stop offset="1" stopColor="#0d3d51" stopOpacity=".2" />
          </radialGradient>
        </defs>
        {positions.map((position, index) => (
          <line
            key={`line-${index}`}
            x1="50"
            y1="48"
            x2={position[0]}
            y2={position[1]}
            className="graph-line"
          />
        ))}
        {venture.readiness.map((item, index) => (
          <circle
            key={item.dimension}
            cx={positions[index][0]}
            cy={positions[index][1]}
            r={item.evidenceCount ? 4.8 : 3.5}
            className={`graph-node ${item.state}`}
          />
        ))}
        <circle
          cx="50"
          cy="48"
          r="14"
          fill="url(#graph-glow)"
          className="graph-center"
        />
        <text x="50" y="46" textAnchor="middle" className="graph-score">
          {completion}%
        </text>
        <text x="50" y="52" textAnchor="middle" className="graph-label">
          complete
        </text>
      </svg>
      <div className="graph-context" aria-label="Graph inputs">
        <span>{claimsCount} claims</span>
        <span>
          {venture.readiness.reduce((sum, item) => sum + item.evidenceCount, 0)}{" "}
          evidence links
        </span>
        <span>{milestonesCount} milestones</span>
        <span>{matchFactorCount} latest match factors</span>
      </div>
      <figcaption>
        Connections summarize claims, evidence coverage, milestones, readiness
        gaps, and available match factors—not a prediction of funding success.
      </figcaption>
    </figure>
  );
}
