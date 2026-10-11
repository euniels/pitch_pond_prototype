import { describe, expect, it } from "vitest";
import { sampleMatchFactors, sampleVentures } from "./sample-ventures";

describe("synthetic venture fixtures", () => {
  it("uses unique identities and remains clearly synthetic", () => {
    expect(new Set(sampleVentures.map((venture) => venture.id)).size).toBe(
      sampleVentures.length,
    );
    expect(new Set(sampleVentures.map((venture) => venture.name)).size).toBe(
      sampleVentures.length,
    );
    expect(sampleVentures.length).toBeGreaterThanOrEqual(8);
  });

  it("keeps every factor within its rubric maximum and reconciles the total", () => {
    for (const venture of sampleVentures) {
      expect(venture.matchPoints).toHaveLength(sampleMatchFactors.length);
      venture.matchPoints.forEach((points, index) => {
        expect(points).toBeGreaterThanOrEqual(0);
        expect(points).toBeLessThanOrEqual(sampleMatchFactors[index][1]);
      });
      expect(venture.matchPoints.reduce((sum, points) => sum + points, 0)).toBe(
        venture.matchScore,
      );
    }
  });

  it("provides complete readiness, evidence, and privacy-safe demo inputs", () => {
    for (const venture of sampleVentures) {
      expect(venture.readiness).toBeGreaterThanOrEqual(0);
      expect(venture.readiness).toBeLessThanOrEqual(100);
      expect(venture.evidenceHighlights).toHaveLength(3);
      expect(venture.evidenceCount).toBeGreaterThanOrEqual(
        venture.evidenceHighlights.length,
      );
      expect(venture.milestones).toHaveLength(3);
      expect(venture.matchReasons.length).toBeGreaterThanOrEqual(3);
    }
  });
});
