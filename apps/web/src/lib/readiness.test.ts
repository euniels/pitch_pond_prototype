import { describe, expect, it } from "vitest";
import {
  createEmptyReadiness,
  deriveReadinessState,
  evidenceCoverage,
  readinessCompletion,
} from "./readiness";

describe("readiness", () => {
  it("uses objective states", () => {
    expect(deriveReadinessState(0, 3, 0)).toBe("not_started");
    expect(deriveReadinessState(1, 3, 0)).toBe("in_progress");
    expect(deriveReadinessState(3, 3, 1)).toBe("evidence_linked");
    expect(deriveReadinessState(3, 3, 1, true)).toBe("reviewed");
  });

  it("calculates completion and coverage without predictive scoring", () => {
    const items = createEmptyReadiness();
    items[0] = { ...items[0], completedFields: 3, evidenceCount: 1 };
    expect(readinessCompletion(items)).toBe(11);
    expect(evidenceCoverage(items)).toBe(11);
  });
});
