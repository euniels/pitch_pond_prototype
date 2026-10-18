import { describe, expect, it } from "vitest";
import { calculateProjection, projectionPresets } from "./projections";

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
