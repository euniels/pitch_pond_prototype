import { describe, expect, it } from "vitest";
import { matchNarrativeSchema, readinessAdviceSchema } from "./schemas";

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
});
