import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Database,
  Eye,
  FileCheck2,
  Gauge,
  Plus,
  ShieldCheck,
  Target,
} from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { AiProjectionExplanation } from "@/components/ai-projection-explanation";
import { ProjectionCalculator } from "@/components/projection-calculator";
import { ProjectionGoalForm } from "@/components/projection-goal-form";
import {
  ProjectionSnapshot,
  type StoredForecastPoint,
} from "@/components/projection-snapshot";
import { WorkspaceFrame } from "@/components/workspace-frame";
import {
  createMetricObservationAction,
  createVentureMetricAction,
  revokeProjectionShareAction,
  shareProjectionAction,
} from "@/app/workspace/actions";
import { getWorkspaceContext, hasRole } from "@/lib/workspace";

export const metadata = {
  title: "Venture projections",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type RunRow = {
  id: string;
  goal_id: string;
  venture_id: string;
  model_version: string;
  scenario: string;
  input_kind: string;
  probability: number;
  confidence: number;
  status_band: string;
  exact_series: unknown;
  drivers: unknown;
  limitations: unknown;
  sensitivity: unknown;
  input_summary: unknown;
  expected_target_date: string | null;
  calculated_at: string;
  stale_after: string;
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function forecastSeries(value: unknown): StoredForecastPoint[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const point = item as Record<string, unknown>;
    if (
      typeof point.month !== "number" ||
      typeof point.date !== "string" ||
      typeof point.p10 !== "number" ||
      typeof point.p50 !== "number" ||
      typeof point.p90 !== "number"
    )
      return [];
    return [point as StoredForecastPoint];
  });
}

function numericRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === "number"),
  );
}

function comparableInputs(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {} as Record<string, string>;
  const record = value as Record<string, unknown>;
  const assumptions =
    record.assumptions &&
    typeof record.assumptions === "object" &&
    !Array.isArray(record.assumptions)
      ? (record.assumptions as Record<string, unknown>)
      : {};
  const pairs = {
    "As-of date": record.asOfDate,
    "Due date": record.dueDate,
    "Observation count": record.observationCount,
    "Expected monthly change": assumptions.expectedMonthlyChange,
    "Monthly volatility": assumptions.monthlyVolatility,
    "Customer acquisition / month": assumptions.customerAcquisitionPerMonth,
    "Retention rate (%)": assumptions.retentionPercent,
    "Monthly burn amount": assumptions.monthlyBurnAmount,
    "Milestone reliability (%)": assumptions.milestoneReliability,
    "Evidence cadence / month": assumptions.evidenceCadencePerMonth,
  };
  return Object.fromEntries(
    Object.entries(pairs)
      .filter((entry) => entry[1] !== undefined && entry[1] !== null)
      .map(([key, item]) => [key, String(item)]),
  );
}

function ProjectionVersionComparison({
  current,
  previous,
}: {
  current: RunRow;
  previous?: RunRow;
}) {
  if (!previous) return null;
  const currentInputs = comparableInputs(current.input_summary);
  const previousInputs = comparableInputs(previous.input_summary);
  const keys = [...new Set([...Object.keys(previousInputs), ...Object.keys(currentInputs)])];
  const changes = keys.filter((key) => currentInputs[key] !== previousInputs[key]);
  return (
    <details className="projection-version-compare">
      <summary>Compare with previous immutable snapshot</summary>
      <div className="projection-version-metrics">
        <div>
          <span>Previous · {previous.scenario}</span>
          <strong>{previous.probability}%</strong>
          <small>{previous.confidence}/100 confidence · {new Date(previous.calculated_at).toLocaleString("en-PH")}</small>
        </div>
        <div>
          <span>Current · {current.scenario}</span>
          <strong>{current.probability}%</strong>
          <small>{current.confidence}/100 confidence · {new Date(current.calculated_at).toLocaleString("en-PH")}</small>
        </div>
      </div>
      <strong>Source inputs changed</strong>
      {changes.length ? (
        <ul className="projection-input-diff">
          {changes.map((key) => (
            <li key={key}>
              <span>{key}</span>
              <del>{previousInputs[key] ?? "Not recorded"}</del>
              <ins>{currentInputs[key] ?? "Not recorded"}</ins>
            </li>
          ))}
        </ul>
      ) : (
        <p>No stored source-input field changed; the new run records a separate scenario or calculation event.</p>
      )}
      <p className="form-help">Both records remain immutable. Comparison never rewrites the earlier result.</p>
    </details>
  );
}

function dateTimeIn(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function isPast(value: string) {
  return new Date(value).getTime() <= Date.now();
}

export default async function Page() {
  const { supabase, user, profile, memberships } = await getWorkspaceContext();
  if (!hasRole(memberships, ["founder", "platform_admin"]))
    redirect("/workspace");
  const roles = [...new Set(memberships.map((item) => item.role))];
  const org =
    memberships.find((item) => item.role === "founder")?.organizations ??
    memberships[0]?.organizations;
  const { data: venture } = org
    ? await supabase
        .from("ventures")
        .select("id,name")
        .eq("organization_id", org.id)
        .maybeSingle()
    : { data: null };

  if (!venture)
    return (
      <WorkspaceFrame
        name={profile?.display_name ?? user.email ?? "Founder"}
        roles={roles}
        eyebrow="Venture intelligence"
        title="Create your venture profile first."
        intro="Projection goals belong to an evidence-backed venture record."
      >
        <div className="empty-state projection-empty-page">
          <Target />
          <h2>No venture record yet</h2>
          <p>Complete the venture basics before defining operating metrics and goals.</p>
          <Link className="button button-primary" href="/workspace/founder">
            Open Founder Studio
          </Link>
        </div>
      </WorkspaceFrame>
    );

  const [
    { data: metrics },
    { data: observations },
    { data: goals },
    { data: runRows },
    { data: evidence },
    { data: shares },
    { data: matches },
    { data: introductions },
    { data: readiness },
    { data: latestMatch },
    { data: projectionFlag },
  ] = await Promise.all([
    supabase
      .from("venture_metrics")
      .select("*")
      .eq("venture_id", venture.id)
      .eq("active", true)
      .order("created_at"),
    supabase
      .from("metric_observations")
      .select("*")
      .eq("venture_id", venture.id)
      .order("observed_on", { ascending: false }),
    supabase
      .from("projection_goals")
      .select("*")
      .eq("venture_id", venture.id)
      .neq("status", "archived")
      .order("created_at"),
    supabase
      .from("projection_runs")
      .select("*")
      .eq("venture_id", venture.id)
      .order("calculated_at", { ascending: false }),
    supabase
      .from("evidence_items")
      .select("id,title,status")
      .eq("venture_id", venture.id)
      .in("status", ["clean", "ready"])
      .is("deleted_at", null),
    supabase
      .from("projection_shares")
      .select("id,run_id,recipient_id,visibility,expires_at,revoked_at")
      .eq("venture_id", venture.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("match_snapshots")
      .select("id,reviewer_id,compatibility_score")
      .eq("venture_id", venture.id)
      .eq("eligible", true)
      .order("calculated_at", { ascending: false }),
    supabase
      .from("introductions")
      .select("id,requested_by,recipient_id,status")
      .eq("venture_id", venture.id),
    supabase
      .from("readiness_snapshots")
      .select("completion_percent,evidence_coverage_percent")
      .eq("venture_id", venture.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("match_snapshots")
      .select("compatibility_score")
      .eq("venture_id", venture.id)
      .eq("eligible", true)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", "venture_projections")
      .maybeSingle(),
  ]);

  const runs = (runRows ?? []) as unknown as RunRow[];
  const latestRunByGoal = new Map<string, RunRow>();
  const previousRunByGoal = new Map<string, RunRow>();
  for (const run of runs) {
    if (!latestRunByGoal.has(run.goal_id)) latestRunByGoal.set(run.goal_id, run);
    else if (!previousRunByGoal.has(run.goal_id)) previousRunByGoal.set(run.goal_id, run);
  }
  const activeGoals = (goals ?? []).filter((goal) => goal.status === "active");
  const weightedGoals = activeGoals.flatMap((goal) => {
    const run = latestRunByGoal.get(goal.id);
    return run ? [{ probability: run.probability, weight: goal.weight }] : [];
  });
  const totalWeight = weightedGoals.reduce((sum, item) => sum + item.weight, 0);
  const portfolioLikelihood =
    weightedGoals.length === activeGoals.length && totalWeight === 100
      ? Math.round(
          weightedGoals.reduce(
            (sum, item) => sum + item.probability * item.weight,
            0,
          ) / 100,
        )
      : null;
  const metricById = new Map((metrics ?? []).map((metric) => [metric.id, metric]));
  const observationsByMetric = new Map<string, typeof observations>();
  for (const observation of observations ?? []) {
    const existing = observationsByMetric.get(observation.metric_id) ?? [];
    existing.push(observation);
    observationsByMetric.set(observation.metric_id, existing);
  }
  const shareTargets = new Map<
    string,
    { recipientId: string; matchId: string; score: number; introductionId: string | null; exact: boolean }
  >();
  for (const match of matches ?? []) {
    if (shareTargets.has(match.reviewer_id)) continue;
    const introduction = (introductions ?? []).find(
      (item) =>
        item.requested_by === match.reviewer_id &&
        ["accepted", "completed"].includes(item.status),
    );
    shareTargets.set(match.reviewer_id, {
      recipientId: match.reviewer_id,
      matchId: match.id,
      score: match.compatibility_score,
      introductionId: introduction?.id ?? null,
      exact: Boolean(introduction),
    });
  }

  return (
    <WorkspaceFrame
      name={profile?.display_name ?? user.email ?? "Founder"}
      roles={roles}
      eyebrow="Venture intelligence"
      title={`${venture.name} projections`}
      intro="Track measurable goals with versioned, evidence-aware forecasts. Percentages estimate declared targets—not company success or investment return."
    >
      {!projectionFlag?.enabled && (
        <div className="workspace-notice projection-feature-notice">
          <ShieldCheck />
          <div>
            <strong>Configuration preview</strong>
            <p>
              Goals and observations can be prepared, but calculation remains
              disabled until the projection pilot passes staging acceptance.
            </p>
          </div>
        </div>
      )}

      <div className="projection-concept-strip">
        <div>
          <FileCheck2 />
          <span>Readiness completion</span>
          <strong>{readiness?.completion_percent ?? 0}%</strong>
          <small>{readiness?.evidence_coverage_percent ?? 0}% evidence coverage</small>
        </div>
        <div>
          <BarChart3 />
          <span>Match compatibility</span>
          <strong>{latestMatch?.compatibility_score ?? "—"}{latestMatch ? "/100" : ""}</strong>
          <small>investor-specific deterministic fit</small>
        </div>
        <div className="portfolio-likelihood-card">
          <Gauge />
          <span>Goal Portfolio Likelihood</span>
          <strong>{portfolioLikelihood === null ? "—" : `${portfolioLikelihood}%`}</strong>
          <small>
            {portfolioLikelihood === null
              ? `save all active goals and make weights total 100 (currently ${totalWeight})`
              : "weighted goal index · not company success"}
          </small>
        </div>
      </div>

      <section className="workspace-panel projection-dashboard-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Saved goals and forecasts</span>
            <h2>Actuals, ranges, likelihood, and sensitivity</h2>
          </div>
          <Activity />
        </div>
        {activeGoals.length ? (
          <div className="goal-snapshot-list">
            {activeGoals.map((goal) => {
              const metric = metricById.get(goal.metric_id);
              const latest = latestRunByGoal.get(goal.id);
              const previous = previousRunByGoal.get(goal.id);
              const metricObservations = observationsByMetric.get(goal.metric_id) ?? [];
              return (
                <div className="projection-goal-block" key={goal.id}>
                  <div className="projection-goal-summary">
                    <div>
                      <span>{metric?.name ?? "Metric"} · {goal.weight}% portfolio weight</span>
                      <strong>{goal.label}</strong>
                      <small>
                        Baseline {goal.baseline_value} → target {goal.target_value} by {goal.target_date}
                      </small>
                    </div>
                    <div>
                      <Database />
                      <strong>{metricObservations.length}</strong>
                      <span>dated actuals</span>
                    </div>
                  </div>
                  {latest ? (
                    <>
                    <ProjectionSnapshot
                      label={goal.label}
                      unit={metric?.unit ?? "custom"}
                      probability={latest.probability}
                      confidence={latest.confidence}
                      inputKind={latest.input_kind}
                      status={latest.status_band}
                      scenario={latest.scenario}
                      modelVersion={latest.model_version}
                      calculatedAt={latest.calculated_at}
                      expectedTargetDate={latest.expected_target_date}
                      series={forecastSeries(latest.exact_series)}
                      sensitivity={numericRecord(latest.sensitivity)}
                      drivers={stringArray(latest.drivers)}
                      limitations={stringArray(latest.limitations)}
                      stale={isPast(latest.stale_after)}
                      previousProbability={previous?.probability}
                    >
                      <AiProjectionExplanation
                        runId={latest.id}
                        ventureId={venture.id}
                        evidenceIds={(evidence ?? []).map((item) => item.id)}
                        allowExactValues
                      />
                    </ProjectionSnapshot>
                    <ProjectionVersionComparison current={latest} previous={previous} />
                    </>
                  ) : (
                    <div className="empty-state compact-empty-state">
                      <Gauge />
                      <h3>No saved projection yet</h3>
                      <p>
                        The first run will be assumption-based until verified
                        operating history meets the data-backed threshold.
                      </p>
                    </div>
                  )}
                  <ProjectionCalculator goalId={goal.id} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Target />
            <h3>No projection goals yet</h3>
            <p>Create a metric, add a target, then calculate the first scenario.</p>
          </div>
        )}
      </section>

      <div className="workspace-columns projection-setup-grid">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">1 · Define</span><h2>Create an operating metric</h2></div>
            <Plus />
          </div>
          <ActionForm action={createVentureMetricAction} submitLabel="Create metric">
            <input type="hidden" name="ventureId" value={venture.id} />
            <div className="form-grid">
              <label><span>Metric name</span><input name="name" placeholder="Monthly recurring revenue" required /></label>
              <label><span>Metric key</span><input name="key" pattern="[a-z0-9_]{2,60}" placeholder="monthly_revenue" required /></label>
              <label><span>Category</span><select name="category" defaultValue="revenue">{[
                ["revenue", "Revenue"], ["active_customers", "Active customers"], ["retention", "Retention"], ["gross_margin", "Gross margin"], ["cash_runway", "Cash runway"], ["product_milestone", "Product / operating milestone"], ["readiness", "Readiness completion"], ["evidence_coverage", "Evidence coverage"], ["custom", "Custom numeric goal"],
              ].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
              <label><span>Unit</span><select name="unit" defaultValue="php"><option value="php">Philippine peso</option><option value="count">Count</option><option value="percent">Percent</option><option value="months">Months</option><option value="score">0–100 score</option><option value="custom">Custom</option></select></label>
              <label><span>Target direction</span><select name="direction"><option value="increase">Increase</option><option value="decrease">Decrease</option></select></label>
              <label><span>Reporting cadence</span><select name="cadence" defaultValue="monthly"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></label>
              <label><span>Investor display</span><select name="privacyClassification" defaultValue="indexed"><option value="indexed">Indexed by default</option><option value="exact">Sensitive / exact grant only</option></select></label>
            </div>
          </ActionForm>
        </section>

        <section className="workspace-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">2 · Measure</span><h2>Record a dated actual</h2></div>
            <Database />
          </div>
          {(metrics ?? []).length ? (
            <ActionForm action={createMetricObservationAction} submitLabel="Record observation">
              <input type="hidden" name="ventureId" value={venture.id} />
              <label><span>Metric</span><select name="metricId" required><option value="">Choose a metric</option>{(metrics ?? []).map((metric) => <option value={metric.id} key={metric.id}>{metric.name}</option>)}</select></label>
              <div className="form-grid">
                <label><span>Actual value</span><input name="value" type="number" step="0.01" required /></label>
                <label><span>Observed on</span><input name="observedOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
              </div>
              <label><span>Verification state</span><select name="verificationState" defaultValue="self_reported"><option value="self_reported">Self-reported</option><option value="evidence_linked">Evidence linked</option><option value="reviewed">Reviewed</option></select></label>
              <label><span>Clean Evidence Vault item</span><select name="evidenceId" defaultValue=""><option value="">No evidence link</option>{(evidence ?? []).map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
            </ActionForm>
          ) : <p className="form-help">Create a metric before recording actuals.</p>}
        </section>

        <section className="workspace-panel projection-goal-form-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">3 · Target</span><h2>Set a measurable goal</h2></div>
            <Target />
          </div>
          {(metrics ?? []).length ? (
            <ProjectionGoalForm ventureId={venture.id} metrics={(metrics ?? []).map((metric) => ({ id: metric.id, name: metric.name, unit: metric.unit }))} />
          ) : <p className="form-help">Create a metric before setting a goal.</p>}
        </section>
      </div>

      <section className="workspace-panel projection-sharing-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">Permissioned sharing</span><h2>Share one immutable snapshot</h2></div>
          <Eye />
        </div>
        <p>
          Matched investors receive indexed analytics by default. Exact values
          require an accepted introduction and expire automatically.
        </p>
        {[...shareTargets.values()].length && latestRunByGoal.size ? (
          <div className="projection-share-targets">
            {[...shareTargets.values()].map((target) => (
              <ActionForm action={shareProjectionAction} submitLabel="Share snapshot" key={target.recipientId}>
                <input type="hidden" name="ventureId" value={venture.id} />
                <input type="hidden" name="recipientId" value={target.recipientId} />
                <input type="hidden" name="matchId" value={target.matchId} />
                <input type="hidden" name="introductionId" value={target.introductionId ?? ""} />
                <input type="hidden" name="expiresAt" value={dateTimeIn(30)} />
                <strong>Matched investor · {target.score}/100 compatibility</strong>
                <label><span>Saved projection</span><select name="runId">{activeGoals.flatMap((goal) => { const run = latestRunByGoal.get(goal.id); return run ? [<option value={run.id} key={run.id}>{goal.label} · {run.probability}%</option>] : []; })}</select></label>
                <label><span>Visibility for 30 days</span><select name="visibility" defaultValue="indexed"><option value="indexed">Indexed analytics</option>{target.exact && <option value="exact">Exact values · accepted introduction</option>}</select></label>
              </ActionForm>
            ))}
          </div>
        ) : (
          <div className="empty-state compact-empty-state">
            <ShieldCheck />
            <h3>No eligible sharing target</h3>
            <p>A saved projection and an eligible matched reviewer are required.</p>
          </div>
        )}
        {(shares ?? []).length > 0 && (
          <div className="record-list projection-share-list">
            {(shares ?? []).map((share) => (
              <article key={share.id}>
                <span>{share.visibility} access</span>
                <p>Expires {new Date(share.expires_at).toLocaleString("en-PH")}</p>
                <strong>{share.revoked_at ? "Revoked" : "Active"}</strong>
                {!share.revoked_at && (
                  <form action={revokeProjectionShareAction}>
                    <input type="hidden" name="shareId" value={share.id} />
                    <button className="text-button">Revoke now</button>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </WorkspaceFrame>
  );
}
