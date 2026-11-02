"use client";

import { useState } from "react";
import { ActionForm } from "@/components/action-form";
import { createProjectionGoalAction } from "@/app/workspace/actions";

function futureDate(months: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

export function ProjectionGoalForm({
  ventureId,
  metrics,
}: {
  ventureId: string;
  metrics: Array<{ id: string; name: string; unit: string }>;
}) {
  const [targetDate, setTargetDate] = useState(futureDate(12));
  return (
    <ActionForm action={createProjectionGoalAction} submitLabel="Create projection goal">
      <input type="hidden" name="ventureId" value={ventureId} />
      <label>
        <span>Operating metric</span>
        <select name="metricId" required>
          <option value="">Choose a metric</option>
          {metrics.map((metric) => (
            <option value={metric.id} key={metric.id}>
              {metric.name} · {metric.unit}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Goal label</span>
        <input
          name="label"
          minLength={3}
          maxLength={140}
          placeholder="Reach 500 active customers"
          required
        />
      </label>
      <div className="form-grid">
        <label>
          <span>Baseline</span>
          <input name="baselineValue" type="number" step="0.01" required />
        </label>
        <label>
          <span>Target</span>
          <input name="targetValue" type="number" step="0.01" required />
        </label>
        <label>
          <span>Portfolio weight</span>
          <input name="weight" type="number" min="1" max="100" defaultValue="25" required />
        </label>
        <label>
          <span>Target date</span>
          <input
            name="targetDate"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            required
          />
        </label>
      </div>
      <fieldset className="projection-horizon-presets">
        <legend>Quick horizon</legend>
        <div className="segmented-control">
          {[6, 12, 24, 36].map((months) => (
            <button
              type="button"
              onClick={() => setTargetDate(futureDate(months))}
              aria-pressed={targetDate === futureDate(months)}
              key={months}
            >
              {months} months
            </button>
          ))}
        </div>
      </fieldset>
      <div className="form-grid">
        <label>
          <span>Expected monthly change</span>
          <input
            name="expectedMonthlyChange"
            type="number"
            step="0.01"
            defaultValue="5"
            required
          />
        </label>
        <label>
          <span>Expected monthly variability</span>
          <input
            name="monthlyVolatility"
            type="number"
            min="0"
            step="0.01"
            defaultValue="2"
            required
          />
        </label>
      </div>
      <details className="projection-context-assumptions">
        <summary>Category-specific operating context</summary>
        <p className="form-help">
          Add only the fields relevant to this metric. Model 2026.2 records
          these for review and AI explanation; only expected monthly change
          and variability drive the deterministic percentage.
        </p>
        <div className="form-grid">
          <label>
            <span>Customer acquisition / month</span>
            <input name="customerAcquisitionPerMonth" type="number" min="0" step="0.01" placeholder="Optional" />
          </label>
          <label>
            <span>Retention rate</span>
            <input name="retentionPercent" type="number" min="0" max="100" step="0.01" placeholder="Optional %" />
          </label>
          <label>
            <span>Monthly burn amount</span>
            <input name="monthlyBurnAmount" type="number" min="0" step="0.01" placeholder="Optional PHP" />
          </label>
          <label>
            <span>Milestone reliability</span>
            <input name="milestoneReliability" type="number" min="0" max="100" step="0.01" placeholder="Optional %" />
          </label>
          <label>
            <span>Evidence cadence / month</span>
            <input name="evidenceCadencePerMonth" type="number" min="0" step="0.01" placeholder="Optional" />
          </label>
        </div>
      </details>
      <p className="form-help">
        Assumptions produce an early scenario. The result becomes data-backed
        only after three verified observations span at least 60 days.
      </p>
    </ActionForm>
  );
}
