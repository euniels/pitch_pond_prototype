import type { CSSProperties, ReactNode } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarRange,
  Database,
  Gauge,
  ShieldCheck,
} from "lucide-react";

export type StoredForecastPoint = {
  month: number;
  date: string;
  p10: number;
  p50: number;
  p90: number;
};

function pathPoints(
  points: StoredForecastPoint[],
  key: "p10" | "p50" | "p90",
  minimum: number,
  range: number,
) {
  return points
    .map((point, index) => {
      const x = 50 + (index / Math.max(points.length - 1, 1)) * 600;
      const y = 220 - ((point[key] - minimum) / range) * 160;
      return `${x},${y}`;
    })
    .join(" ");
}

function formatValue(value: number, unit: string, indexed: boolean) {
  if (indexed) return `${Math.round(value)} index`;
  if (unit === "php")
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      notation: Math.abs(value) >= 1_000_000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(value);
  if (unit === "percent" || unit === "score") return `${Math.round(value)}%`;
  if (unit === "months") return `${value.toFixed(1)} mo`;
  return new Intl.NumberFormat("en-PH", { maximumFractionDigits: 1 }).format(value);
}

export function ProjectionSnapshot({
  label,
  unit,
  probability,
  confidence,
  inputKind,
  status,
  scenario,
  modelVersion,
  calculatedAt,
  expectedTargetDate,
  series,
  sensitivity,
  drivers,
  limitations,
  stale = false,
  indexed = false,
  previousProbability,
  children,
}: {
  label: string;
  unit: string;
  probability: number;
  confidence: number;
  inputKind: string;
  status: string;
  scenario: string;
  modelVersion: string;
  calculatedAt: string;
  expectedTargetDate: string | null;
  series: StoredForecastPoint[];
  sensitivity: Record<string, number>;
  drivers: string[];
  limitations: string[];
  stale?: boolean;
  indexed?: boolean;
  previousProbability?: number;
  children?: ReactNode;
}) {
  const allValues = series.flatMap((point) => [point.p10, point.p50, point.p90]);
  const minimum = allValues.length ? Math.min(...allValues) : 0;
  const maximum = allValues.length ? Math.max(...allValues) : 100;
  const range = Math.max(maximum - minimum, 1);
  const upper = pathPoints(series, "p90", minimum, range)
    .split(" ")
    .map((point) => point.split(","));
  const lower = pathPoints(series, "p10", minimum, range)
    .split(" ")
    .map((point) => point.split(","))
    .reverse();
  const band = [...upper, ...lower].map((point) => point.join(",")).join(" ");
  const latest = series.at(-1);
  const delta =
    previousProbability === undefined ? null : probability - previousProbability;
  return (
    <article className="goal-snapshot-card">
      <header className="goal-snapshot-heading">
        <div>
          <span className="eyebrow">
            <Activity /> Saved projection
          </span>
          <h3>{label}</h3>
          <p>
            {scenario} scenario · {series.length ? `${series.length - 1} month path` : "No path"}
          </p>
          {stale && (
            <span className="projection-stale-badge">
              Refresh needed · add a current actual before recalculating
            </span>
          )}
        </div>
        <div
          className={`likelihood-gauge likelihood-${status}`}
          style={{ "--likelihood": `${probability * 3.6}deg` } as CSSProperties}
          aria-label={`${probability} percent goal attainment likelihood`}
        >
          <span>
            <strong>{probability}%</strong>
            <small>likelihood</small>
          </span>
        </div>
      </header>

      <div className="projection-snapshot-stats">
        <div>
          <Database />
          <span>Data confidence</span>
          <strong>{confidence}/100</strong>
          <small>{inputKind.replace("_", " ")}</small>
        </div>
        <div>
          <Gauge />
          <span>Status</span>
          <strong>{status.replace("_", " ")}</strong>
          <small>{delta === null ? "first snapshot" : `${delta >= 0 ? "+" : ""}${delta} pts vs prior`}</small>
        </div>
        <div>
          <CalendarRange />
          <span>Median target date</span>
          <strong>{expectedTargetDate ?? "Beyond horizon"}</strong>
          <small>not a guaranteed date</small>
        </div>
        <div>
          <BadgeCheck />
          <span>End P50</span>
          <strong>{latest ? formatValue(latest.p50, unit, indexed) : "—"}</strong>
          <small>P10–P90 forecast band</small>
        </div>
      </div>

      {series.length > 1 && (
        <div className="goal-forecast-chart">
          <div className="forecast-legend" aria-hidden="true">
            <span className="legend-band">P10–P90 range</span>
            <span className="legend-line">P50 path</span>
          </div>
          <svg
            viewBox="0 0 700 270"
            role="img"
            aria-labelledby={`forecast-title-${label.replace(/\W/g, "")}`}
          >
            <title id={`forecast-title-${label.replace(/\W/g, "")}`}>
              {`${label} median forecast from ${formatValue(series[0].p50, unit, indexed)} to ${formatValue(latest?.p50 ?? 0, unit, indexed)}, with a final range from ${formatValue(latest?.p10 ?? 0, unit, indexed)} to ${formatValue(latest?.p90 ?? 0, unit, indexed)}.`}
            </title>
            {[0, 1, 2, 3].map((row) => (
              <line x1="50" x2="650" y1={60 + row * 53} y2={60 + row * 53} key={row} />
            ))}
            <polygon className="goal-forecast-band" points={band} />
            <polyline
              className="goal-forecast-median"
              points={pathPoints(series, "p50", minimum, range)}
            />
            {series.map((point, index) => {
              const x = 50 + (index / Math.max(series.length - 1, 1)) * 600;
              const y = 220 - ((point.p50 - minimum) / range) * 160;
              if (index !== 0 && index !== series.length - 1 && index % 3 !== 0)
                return null;
              return (
                <g key={point.month}>
                  <circle cx={x} cy={y} r="4" />
                  <text x={x} y="252" textAnchor="middle">
                    M{point.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="projection-sensitivity" aria-label="Scenario sensitivity">
        {(["cautious", "baseline", "accelerated"] as const).map((item) => (
          <div key={item}>
            <span>{item}</span>
            <strong>{sensitivity[item] ?? 0}%</strong>
            <div aria-hidden="true">
              <i style={{ width: `${sensitivity[item] ?? 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      <details className="projection-method">
        <summary>How this was calculated</summary>
        <div>
          <p>
            Model {modelVersion} · calculated {new Date(calculatedAt).toLocaleString("en-PH")}
          </p>
          <strong>Primary numeric drivers</strong>
          <ul>{drivers.map((driver) => <li key={driver}>{driver}</li>)}</ul>
          <strong>Limitations</strong>
          <ul>{limitations.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="projection-boundary-copy">
            <ShieldCheck /> This estimates one declared goal. It does not estimate
            company survival, fundraising success, valuation, or investment return.
          </p>
        </div>
      </details>
      {children}
    </article>
  );
}
