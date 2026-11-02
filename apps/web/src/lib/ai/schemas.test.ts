import { describe, expect, it } from "vitest";
import {
  matchNarrativeSchema,
  projectionExplanationSchema,
  readinessAdviceSchema,
} from "./schemas";

describe("AI structured-output boundaries", () => {
  it("accepts bounded advisory output", () =>
    expect(
      readinessAdviceSchema.safeParse({
        summary: "Review completed.",
        gaps: [],
        limitations: ["Advisory only."],
      }).success,
    ).toBe(true));
  it("rejects unbounded narrative arrays and missing fields", () =>
    expect(
      matchNarrativeSchema.safeParse({
        headline: "Fit",
        fitSummary: "Summary",
        strengths: Array(8).fill("x"),
        mismatches: [],
        questions: [],
      }).success,
    ).toBe(false));
  it("prevents projection AI from returning or changing a probability", () =>
    expect(
      projectionExplanationSchema.safeParse({
        summary: "The deterministic result is on track.",
        positiveDrivers: [],
        negativeDrivers: [],
        sensitivity: [],
        missingOrStaleData: [],
        evidenceBackedRisks: [],
        nextActions: [],
        investorQuestions: [],
        limitations: ["Advisory explanation only."],
        probability: 99,
      }).success,
    ).toBe(false));
});
