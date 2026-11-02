import { describe, expect, it } from "vitest";
import {
  calculateGoalProjection,
  calculatePortfolioLikelihood,
  calculateProjection,
  projectionPresets,
} from "./projections";

const base = {
  currentReadiness: 62,
  currentEvidence: 10,
  horizonMonths: 12 as const,
};

describe("venture scenario projections", () => {
  it("is deterministic and includes quarterly checkpoints", () => {
    const input = { ...base, ...projectionPresets.baseline };
    expect(calculateProjection(input)).toEqual(calculateProjection(input));
    expect(calculateProjection(input).points.map((point) => point.month)).toEqual([
      0, 3, 6, 9, 12,
    ]);
  });

  it("keeps readiness inside the non-certainty display range", () => {
    const result = calculateProjection({
      ...base,
      horizonMonths: 24,
      monthlyReadinessGain: 9,
      evidencePerQuarter: 8,
      milestoneReliability: 95,
    });
    expect(result.final.readiness).toBeLessThanOrEqual(96);
    expect(result.points.every((point) => point.lowerReadiness <= point.readiness)).toBe(true);
    expect(result.points.every((point) => point.upperReadiness >= point.readiness)).toBe(true);
  });

  it("treats a faster scenario as an assumption rather than a success probability", () => {
    const cautious = calculateProjection({ ...base, ...projectionPresets.cautious });
    const accelerated = calculateProjection({
      ...base,
      ...projectionPresets.accelerated,
    });
    expect(accelerated.readinessGain).toBeGreaterThan(cautious.readinessGain);
    expect(accelerated.evidenceGain).toBeGreaterThan(cautious.evidenceGain);
    expect(accelerated).not.toHaveProperty("successProbability");
  });
});

const goalInput = {
  goalId: "goal-1",
  asOfDate: "2026-11-01",
  dueDate: "2027-11-01",
  baselineValue: 100,
  targetValue: 220,
  direction: "increase" as const,
  unit: "count" as const,
  scenario: "baseline" as const,
  expectedMonthlyChange: 10,
  monthlyVolatility: 3,
  cadence: "monthly" as const,
  simulationCount: 1_000,
  observations: [
    {
      value: 100,
      observedOn: "2026-08-01",
      verified: true,
      evidenceLinked: true,
    },
    {
      value: 119,
      observedOn: "2026-09-01",
      verified: true,
      evidenceLinked: true,
    },
    {
      value: 141,
      observedOn: "2026-10-15",
      verified: true,
      evidenceLinked: true,
    },
  ],
};

describe("goal attainment projections", () => {
  it("produces deterministic probability and ordered percentile paths", () => {
    const first = calculateGoalProjection(goalInput);
    const second = calculateGoalProjection(goalInput);
    expect(first).toEqual(second);
    expect(first.inputKind).toBe("data_backed");
    expect(first.probability).toBeGreaterThanOrEqual(0);
    expect(first.probability).toBeLessThanOrEqual(100);
    expect(
      first.forecast.every(
        (point) => point.p10 <= point.p50 && point.p50 <= point.p90,
      ),
    ).toBe(true);
  });

  it.each([
    ["2027-05-01", 6],
    ["2027-11-01", 12],
    ["2028-11-01", 24],
    ["2029-11-01", 36],
  ])("supports the standard due-date horizon %s", (dueDate, expectedMonths) => {
    const result = calculateGoalProjection({ ...goalInput, dueDate });
    expect(result.horizonMonths).toBe(expectedMonths);
    expect(result.forecast.at(-1)?.month).toBe(expectedMonths);
  });

  it("supports a custom date without rounding a calendar preset incorrectly", () => {
    const result = calculateGoalProjection({
      ...goalInput,
      dueDate: "2027-08-15",
    });
    expect(result.horizonMonths).toBe(10);
    expect(result.forecast.at(-1)?.date).toBeDefined();
  });

  it("keeps early ventures explicitly assumption-based", () => {
    const result = calculateGoalProjection({
      ...goalInput,
      observations: goalInput.observations.slice(0, 2),
    });
    expect(result.inputKind).toBe("assumption_based");
    expect(result.confidence).toBeLessThanOrEqual(39);
    expect(result.limitations.join(" ")).toMatch(/assumption-based/i);
  });

  it("requires both three verified observations and a sixty-day span", () => {
    const result = calculateGoalProjection({
      ...goalInput,
      observations: goalInput.observations.map((item, index) => ({
        ...item,
        observedOn: `2026-10-${String(10 + index * 5).padStart(2, "0")}`,
      })),
    });
    expect(result.inputKind).toBe("assumption_based");
  });

  it("supports decreasing goals and never produces negative constrained values", () => {
    const result = calculateGoalProjection({
      ...goalInput,
      baselineValue: 18,
      targetValue: 6,
      direction: "decrease",
      unit: "months",
      expectedMonthlyChange: -1,
      observations: [],
    });
    expect(result.forecast.every((point) => point.p10 >= 0)).toBe(true);
    expect(result.trendPerMonth).toBeLessThan(0);
  });

  it("uses a robust trend that resists a single extreme observation", () => {
    const result = calculateGoalProjection({
      ...goalInput,
      observations: [
        ...goalInput.observations,
        {
          value: 5_000,
          observedOn: "2026-10-25",
          verified: true,
          evidenceLinked: true,
        },
      ],
    });
    expect(result.trendPerMonth).toBeLessThan(1_000);
  });

  it("accepts sparse verified periods without inventing missing actuals", () => {
    const observations = [
      { value: 70, observedOn: "2026-01-01", verified: true, evidenceLinked: true },
      { value: 91, observedOn: "2026-05-01", verified: true, evidenceLinked: true },
      { value: 126, observedOn: "2026-10-01", verified: true, evidenceLinked: true },
    ];
    const result = calculateGoalProjection({ ...goalInput, observations });
    expect(result.inputKind).toBe("data_backed");
    expect(result.actuals).toHaveLength(3);
    expect(result.forecast.every((point) => Number.isFinite(point.p50))).toBe(true);
  });

  it("reduces confidence for stale history", () => {
    const recent = calculateGoalProjection(goalInput);
    const stale = calculateGoalProjection({
      ...goalInput,
      observations: goalInput.observations.map((item) => ({
        ...item,
        observedOn: item.observedOn.replace("2026", "2024"),
      })),
    });
    expect(stale.confidence).toBeLessThan(recent.confidence);
  });

  it("rejects duplicate verified dates and invalid negative constrained values", () => {
    expect(() =>
      calculateGoalProjection({
        ...goalInput,
        observations: [goalInput.observations[0], goalInput.observations[0]],
      }),
    ).toThrow(/duplicate dates/i);
    expect(() =>
      calculateGoalProjection({ ...goalInput, targetValue: -1 }),
    ).toThrow(/cannot contain negative/i);
  });

  it("rejects out-of-range percentages, future actuals, and contradictory direction", () => {
    expect(() =>
      calculateGoalProjection({
        ...goalInput,
        unit: "percent",
        baselineValue: 85,
        targetValue: 101,
        observations: [],
      }),
    ).toThrow(/within 0 to 100/i);
    expect(() =>
      calculateGoalProjection({
        ...goalInput,
        observations: [
          ...goalInput.observations,
          { value: 150, observedOn: "2026-11-02", verified: true, evidenceLinked: true },
        ],
      }),
    ).toThrow(/after the projection as-of date/i);
    expect(() =>
      calculateGoalProjection({
        ...goalInput,
        targetValue: 80,
        direction: "increase",
      }),
    ).toThrow(/follow the metric direction/i);
  });

  it("calculates only a weighted goal index and requires weights to total 100", () => {
    expect(
      calculatePortfolioLikelihood([
        { probability: 80, weight: 60 },
        { probability: 50, weight: 40 },
      ]),
    ).toBe(68);
    expect(() =>
      calculatePortfolioLikelihood([{ probability: 80, weight: 60 }]),
    ).toThrow(/total 100/i);
  });

  it("contains no plan, prestige, match, or AI input capable of changing odds", () => {
    const result = calculateGoalProjection(goalInput);
    expect(result).not.toHaveProperty("plan");
    expect(result).not.toHaveProperty("organizationPrestige");
    expect(result).not.toHaveProperty("matchScore");
    expect(result).not.toHaveProperty("aiScore");
  });
});
