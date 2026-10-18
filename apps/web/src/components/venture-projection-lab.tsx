"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  CalendarRange,
  FileCheck2,
  Gauge,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { sampleVentures } from "@/lib/sample-ventures";
import {
  calculateProjection,
  projectionPresets,
  type ProjectionScenario,
} from "@/lib/projections";

type Perspective = "founder" | "supporter";
const scenarios: readonly [ProjectionScenario, string, string][] = [
  ["cautious", "Cautious", "Slower execution and fewer new evidence records"],
  ["baseline", "Baseline", "A steady operating cadence with regular reviews"],
  ["accelerated", "Accelerated", "More capacity and a higher milestone cadence"],
];

function chartCoordinates(readiness: number, index: number, count: number) {
  const x = 34 + (index / Math.max(count - 1, 1)) * 572;
  const y = 184 - (readiness / 100) * 148;
  return [x, y] as const;
}

export function VentureProjectionLab() {
  const [ventureId, setVentureId] = useState(sampleVentures[0].id);
  const [horizon, setHorizon] = useState<6 | 12 | 18 | 24>(12);
  const [scenario, setScenario] = useState<ProjectionScenario>("baseline");
  const [monthlyGain, setMonthlyGain] = useState(projectionPresets.baseline.monthlyReadinessGain);
  const [evidencePace, setEvidencePace] = useState(projectionPresets.baseline.evidencePerQuarter);
  const [milestoneReliability, setMilestoneReliability] = useState(projectionPresets.baseline.milestoneReliability);
  const [customized, setCustomized] = useState(false);
  const [perspective, setPerspective] = useState<Perspective>("founder");
  const venture = sampleVentures.find((item) => item.id === ventureId) ?? sampleVentures[0];
  const result = useMemo(
    () => calculateProjection({
      currentReadiness: venture.readiness,
      currentEvidence: venture.evidenceCount,
      horizonMonths: horizon,
      monthlyReadinessGain: monthlyGain,
      evidencePerQuarter: evidencePace,
      milestoneReliability,
    }),
    [evidencePace, horizon, milestoneReliability, monthlyGain, venture],
  );

  const line = result.points
    .map((point, index) => chartCoordinates(point.readiness, index, result.points.length).join(","))
    .join(" ");
  const upper = result.points.map((point, index) => chartCoordinates(point.upperReadiness, index, result.points.length));
  const lower = result.points.map((point, index) => chartCoordinates(point.lowerReadiness, index, result.points.length)).reverse();
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
          <span className="eyebrow"><BrainCircuit /> Interactive scenario lab</span>
          <h2 id="projection-lab-title">Project operating progress—not the odds of success.</h2>
          <p>Change the time horizon and operating assumptions to see a transparent trajectory. Every result is synthetic, deterministic, and recalculates in your browser.</p>
        </div>
        <span className="projection-boundary"><ShieldCheck /><strong>No investment verdict</strong><small>Decision support only</small></span>
      </div>

      <div className="projection-controls">
        <label><span>Sample venture</span><select value={ventureId} onChange={(event) => setVentureId(event.target.value)}>{sampleVentures.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <fieldset><legend>Projection horizon</legend><div className="segmented-control">{([6, 12, 18, 24] as const).map((months) => <button type="button" aria-pressed={horizon === months} onClick={() => setHorizon(months)} key={months}>{months} mo</button>)}</div></fieldset>
        <fieldset className="scenario-presets"><legend>Operating scenario</legend><div>{scenarios.map(([id, label, description]) => <button type="button" aria-pressed={!customized && scenario === id} onClick={() => applyScenario(id)} title={description} key={id}><strong>{label}</strong><small>{description}</small></button>)}</div></fieldset>
      </div>

      <div className="projection-workspace">
        <div className="assumption-panel">
          <div className="panel-heading"><Gauge /><div><strong>Editable assumptions</strong><span>{customized ? "Custom scenario" : `${scenario} preset`}</span></div></div>
          <label><span><strong>Readiness work pace</strong><output>{monthlyGain.toFixed(1)} pts/month</output></span><input type="range" min="0.3" max="3" step="0.1" value={monthlyGain} onChange={(event) => { setMonthlyGain(Number(event.target.value)); setCustomized(true); }} /></label>
          <label><span><strong>New evidence pace</strong><output>{evidencePace} per quarter</output></span><input type="range" min="1" max="8" step="1" value={evidencePace} onChange={(event) => { setEvidencePace(Number(event.target.value)); setCustomized(true); }} /></label>
          <label><span><strong>Milestone reliability</strong><output>{milestoneReliability}%</output></span><input type="range" min="35" max="95" step="5" value={milestoneReliability} onChange={(event) => { setMilestoneReliability(Number(event.target.value)); setCustomized(true); }} /></label>
          <div className="assumption-note"><Target /><p>These controls describe execution assumptions. They do not represent a company valuation, probability of survival, or expected investment return.</p></div>
        </div>

        <div className="projection-output">
          <div className="projection-output-heading"><div><span className="eyebrow">{venture.name}</span><h3>{horizon}-month readiness trajectory</h3></div><div className="perspective-tabs" role="tablist" aria-label="Analytics perspective"><button type="button" role="tab" aria-selected={perspective === "founder"} onClick={() => setPerspective("founder")}><TrendingUp />Founder</button><button type="button" role="tab" aria-selected={perspective === "supporter"} onClick={() => setPerspective("supporter")}><Users />Investor / mentor</button></div></div>
          <div className="projection-chart">
            <svg viewBox="0 0 640 220" role="img" aria-labelledby="projection-chart-title projection-chart-desc">
              <title id="projection-chart-title">{`Projected readiness trajectory for ${venture.name}`}</title>
              <desc id="projection-chart-desc">{`Readiness begins at ${venture.readiness} percent and reaches a central scenario of ${result.final.readiness} percent after ${horizon} months, with a displayed uncertainty range from ${result.final.lowerReadiness} to ${result.final.upperReadiness} percent.`}</desc>
              {[25, 50, 75, 100].map((value) => <g key={value}><line x1="34" x2="606" y1={184 - value * 1.48} y2={184 - value * 1.48} /><text x="5" y={188 - value * 1.48}>{value}</text></g>)}
              <polygon className="projection-band" points={band} />
              <polyline className="projection-line" points={line} />
              {result.points.map((point, index) => { const [x, y] = chartCoordinates(point.readiness, index, result.points.length); return <g key={point.month}><circle cx={x} cy={y} r="5" /><text className="month-label" x={x} y="211" textAnchor="middle">M{point.month}</text></g>; })}
            </svg>
          </div>
          <div className="projection-metrics">
            <div><TrendingUp /><span>Readiness range</span><strong>{result.final.lowerReadiness}–{result.final.upperReadiness}%</strong><small>central scenario {result.final.readiness}%</small></div>
            <div><FileCheck2 /><span>Evidence trajectory</span><strong>+{result.evidenceGain}</strong><small>{result.final.evidence} total linked items</small></div>
            <div><CalendarRange /><span>Milestone estimate</span><strong>{result.projectedMilestones}</strong><small>verified checkpoints</small></div>
            <div><BarChart3 /><span>Evidence confidence</span><strong>{result.confidence}</strong><small>quality still requires review</small></div>
          </div>
          <div className="projection-interpretation">
            <BrainCircuit />
            <div>
              <span>AI-assisted interpretation preview</span>
              {perspective === "founder" ? <p>At the selected pace, focus the next review on <strong>{venture.topGap.toLowerCase()}</strong> The range widens over time because execution is uncertain; update assumptions as real evidence arrives.</p> : <p>The current compatibility result remains <strong>{venture.matchScore}/100</strong> regardless of this scenario. Review the evidence trail, factor breakdown, unresolved gap, and assumption sensitivity before deciding whether to request an introduction.</p>}
              <small>Synthetic template—no model call is made in this public demonstration.</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
