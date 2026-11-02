"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  BrainCircuit,
  CalendarRange,
  Database,
  FileCheck2,
  Gauge,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { sampleVentures } from "@/lib/sample-ventures";
import {
  calculateGoalProjection,
  calculateProjection,
  projectionPresets,
  type ProjectionScenario,
} from "@/lib/projections";

type Perspective = "founder" | "supporter";
const scenarios: readonly [ProjectionScenario, string, string][] = [
  ["cautious", "Cautious", "Slower execution and wider operating uncertainty"],
  ["baseline", "Baseline", "Current operating trend and normal variability"],
  ["accelerated", "Accelerated", "More capacity and a higher evidence cadence"],
];
const syntheticAsOfDate = "2026-11-01";

function dueDate(months: number) {
  const date = new Date(`${syntheticAsOfDate}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function chartCoordinates(value: number, index: number, count: number) {
  const x = 42 + (index / Math.max(count - 1, 1)) * 556;
  const y = 188 - (value / 100) * 150;
  return [x, y] as const;
}

export function VentureProjectionLab() {
  const [ventureId, setVentureId] = useState(sampleVentures[0].id);
  const [horizon, setHorizon] = useState<6 | 12 | 24 | 36>(12);
  const [scenario, setScenario] = useState<ProjectionScenario>("baseline");
  const [monthlyGain, setMonthlyGain] = useState(
    projectionPresets.baseline.monthlyReadinessGain,
  );
  const [evidencePace, setEvidencePace] = useState(
    projectionPresets.baseline.evidencePerQuarter,
  );
  const [milestoneReliability, setMilestoneReliability] = useState(
    projectionPresets.baseline.milestoneReliability,
  );
  const [customized, setCustomized] = useState(false);
  const [perspective, setPerspective] = useState<Perspective>("founder");
  const venture =
    sampleVentures.find((item) => item.id === ventureId) ?? sampleVentures[0];

  const readinessResult = useMemo(
    () =>
      calculateProjection({
        currentReadiness: venture.readiness,
        currentEvidence: venture.evidenceCount,
        horizonMonths: horizon,
        monthlyReadinessGain: monthlyGain,
        evidencePerQuarter: evidencePace,
        milestoneReliability,
      }),
    [evidencePace, horizon, milestoneReliability, monthlyGain, venture],
  );
  const goalTarget = Math.min(96, Math.max(venture.readiness + 12, 88));
  const goalResult = useMemo(
    () =>
      calculateGoalProjection({
        goalId: `${venture.id}-synthetic-readiness-goal`,
        asOfDate: syntheticAsOfDate,
        dueDate: dueDate(horizon),
        baselineValue: venture.readiness,
        targetValue: goalTarget,
        direction: "increase",
        unit: "score",
        scenario,
        expectedMonthlyChange: monthlyGain,
        monthlyVolatility: Math.max(0.8, (100 - milestoneReliability) / 22),
        cadence: "monthly",
        simulationCount: 750,
        observations: [
          {
            value: Math.max(0, venture.readiness - monthlyGain * 3.4),
            observedOn: "2026-07-20",
            verified: true,
            evidenceLinked: true,
          },
          {
            value: Math.max(0, venture.readiness - monthlyGain * 1.7),
            observedOn: "2026-09-01",
            verified: true,
            evidenceLinked: true,
          },
          {
            value: venture.readiness,
            observedOn: "2026-10-25",
            verified: true,
            evidenceLinked: true,
          },
        ],
      }),
    [goalTarget, horizon, milestoneReliability, monthlyGain, scenario, venture],
  );

  const medianLine = goalResult.forecast
    .map((point, index) =>
      chartCoordinates(point.p50, index, goalResult.forecast.length).join(","),
    )
    .join(" ");
  const upper = goalResult.forecast.map((point, index) =>
    chartCoordinates(point.p90, index, goalResult.forecast.length),
  );
  const lower = goalResult.forecast
    .map((point, index) =>
      chartCoordinates(point.p10, index, goalResult.forecast.length),
    )
    .reverse();
  const band = [...upper, ...lower].map((point) => point.join(",")).join(" ");

  const applyScenario = (next: ProjectionScenario) => {
    const preset = projectionPresets[next];
    setScenario(next);
    setMonthlyGain(preset.monthlyReadinessGain);
    setEvidencePace(preset.evidencePerQuarter);
    setMilestoneReliability(preset.milestoneReliability);
    setCustomized(false);
  };

  return (
    <section className="projection-lab" aria-labelledby="projection-lab-title">
      <div className="projection-lab-header">
        <div>
          <span className="eyebrow"><BrainCircuit /> Interactive goal forecast</span>
          <h2 id="projection-lab-title">
            Estimate a measurable goal—not whether a company will “succeed.”
          </h2>
          <p>
            Explore a fictional, evidence-backed goal using a deterministic
            forecast. Every percentage includes a range, confidence score,
            model version, assumptions, and limitations.
          </p>
        </div>
        <span className="projection-boundary">
          <ShieldCheck /><strong>No investment verdict</strong>
          <small>Synthetic decision-support demo</small>
        </span>
      </div>

      <div className="projection-controls">
        <label>
          <span>Sample venture</span>
          <select value={ventureId} onChange={(event) => setVentureId(event.target.value)}>
            {sampleVentures.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>
        <fieldset>
          <legend>Projection horizon</legend>
          <div className="segmented-control">
            {([6, 12, 24, 36] as const).map((months) => (
              <button type="button" aria-pressed={horizon === months} onClick={() => setHorizon(months)} key={months}>
                {months < 12 ? `${months} mo` : `${months / 12} yr`}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="scenario-presets">
          <legend>Operating scenario</legend>
          <div>
            {scenarios.map(([id, label, description]) => (
              <button type="button" aria-pressed={!customized && scenario === id} onClick={() => applyScenario(id)} title={description} key={id}>
                <strong>{label}</strong><small>{description}</small>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="projection-workspace">
        <div className="assumption-panel">
          <div className="panel-heading"><Gauge /><div><strong>Editable assumptions</strong><span>{customized ? "Custom scenario" : `${scenario} preset`}</span></div></div>
          <label><span><strong>Readiness work pace</strong><output>{monthlyGain.toFixed(1)} pts/month</output></span><input type="range" min="0.3" max="3" step="0.1" value={monthlyGain} onChange={(event) => { setMonthlyGain(Number(event.target.value)); setCustomized(true); }} /></label>
          <label><span><strong>New evidence pace</strong><output>{evidencePace} per quarter</output></span><input type="range" min="1" max="8" step="1" value={evidencePace} onChange={(event) => { setEvidencePace(Number(event.target.value)); setCustomized(true); }} /></label>
          <label><span><strong>Milestone reliability</strong><output>{milestoneReliability}%</output></span><input type="range" min="35" max="95" step="5" value={milestoneReliability} onChange={(event) => { setMilestoneReliability(Number(event.target.value)); setCustomized(true); }} /></label>
          <div className="assumption-note"><Target /><p>Goal: move evidence-backed readiness from {venture.readiness}% to {goalTarget}% by {dueDate(horizon)}. These are fictional inputs.</p></div>
        </div>

        <div className="projection-output">
          <div className="projection-output-heading">
            <div><span className="eyebrow">{venture.name}</span><h3>{horizon}-month goal trajectory</h3></div>
            <div className="perspective-tabs" role="tablist" aria-label="Analytics perspective">
              <button type="button" role="tab" aria-selected={perspective === "founder"} onClick={() => setPerspective("founder")}><TrendingUp />Founder</button>
              <button type="button" role="tab" aria-selected={perspective === "supporter"} onClick={() => setPerspective("supporter")}><Users />Investor / mentor</button>
            </div>
          </div>

          <div className="public-likelihood-row">
            <div className={`likelihood-gauge likelihood-${goalResult.status}`} style={{ "--likelihood": `${goalResult.probability * 3.6}deg` } as CSSProperties}>
              <span><strong>{goalResult.probability}%</strong><small>goal likelihood</small></span>
            </div>
            <div><span>Data-backed likelihood</span><strong>{goalResult.status.replace("_", " ")}</strong><p>{goalResult.confidence}/100 data confidence · model {goalResult.modelVersion}</p></div>
          </div>

          <div className="projection-chart goal-likelihood-chart">
            <div className="forecast-legend"><span className="legend-band">P10–P90 range</span><span className="legend-line">P50 path</span></div>
            <svg viewBox="0 0 640 230" role="img" aria-labelledby="projection-chart-title projection-chart-desc">
              <title id="projection-chart-title">{`Goal likelihood trajectory for ${venture.name}`}</title>
              <desc id="projection-chart-desc">{`The fictional goal has a ${goalResult.probability} percent likelihood under the selected scenario. The median forecast ends at ${goalResult.forecast.at(-1)?.p50 ?? 0} percent with an uncertainty range from ${goalResult.forecast.at(-1)?.p10 ?? 0} to ${goalResult.forecast.at(-1)?.p90 ?? 0} percent.`}</desc>
              {[25, 50, 75, 100].map((value) => <g key={value}><line x1="42" x2="598" y1={188 - value * 1.5} y2={188 - value * 1.5} /><text x="5" y={192 - value * 1.5}>{value}</text></g>)}
              <polygon className="projection-band" points={band} />
              <polyline className="projection-line" points={medianLine} />
              {goalResult.forecast.map((point, index) => { const [x, y] = chartCoordinates(point.p50, index, goalResult.forecast.length); if (point.month !== 0 && point.month !== horizon && point.month % 6 !== 0) return null; return <g key={point.month}><circle cx={x} cy={y} r="5" /><text className="month-label" x={x} y="220" textAnchor="middle">M{point.month}</text></g>; })}
            </svg>
          </div>

          <div className="projection-metrics">
            <div><TrendingUp /><span>Final P10–P90</span><strong>{Math.round(goalResult.forecast.at(-1)?.p10 ?? 0)}–{Math.round(goalResult.forecast.at(-1)?.p90 ?? 0)}%</strong><small>median {Math.round(goalResult.forecast.at(-1)?.p50 ?? 0)}%</small></div>
            <div><FileCheck2 /><span>Evidence trajectory</span><strong>+{readinessResult.evidenceGain}</strong><small>{readinessResult.final.evidence} total linked items</small></div>
            <div><CalendarRange /><span>Milestone estimate</span><strong>{readinessResult.projectedMilestones}</strong><small>verified checkpoints</small></div>
            <div><Database /><span>Data confidence</span><strong>{goalResult.confidence}/100</strong><small>{goalResult.inputKind.replace("_", " ")}</small></div>
          </div>

          <div className="projection-sensitivity public-sensitivity">
            {(["cautious", "baseline", "accelerated"] as const).map((item) => <div key={item}><span>{item}</span><strong>{goalResult.sensitivity[item]}%</strong><div aria-hidden="true"><i style={{ width: `${goalResult.sensitivity[item]}%` }} /></div></div>)}
          </div>

          <div className="projection-interpretation">
            <BrainCircuit />
            <div>
              <span>AI-assisted interpretation preview</span>
              {perspective === "founder" ? <p>The strongest next move is to address <strong>{venture.topGap.toLowerCase()}</strong> Update dated actuals as new evidence arrives; confidence and the range will change without rewriting prior snapshots.</p> : <p>Compatibility result remains <strong>{venture.matchScore}/100</strong> and is not changed by this forecast. Inspect evidence age, sensitivity, permission scope, and the unresolved gap before requesting diligence.</p>}
              <small>Synthetic template—no model call is made in this public demonstration.</small>
            </div>
          </div>

          <details className="projection-method public-method">
            <summary>How this percentage was calculated</summary>
            <div><p>A seeded simulation uses three fictional verified observations, a robust trend, median-absolute-deviation variability, and the selected scenario. Identical inputs reproduce the same result.</p><ul>{goalResult.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </details>
        </div>
      </div>
    </section>
  );
}
