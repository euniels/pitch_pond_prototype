import { describe, expect, it } from "vitest";
import { demoThesis, demoVenture } from "./demo-data";
import type { InvestorThesis } from "./domain";
import { calculateMatch, matchRubricSchema } from "./matching";

describe("calculateMatch", () => {
  it("explains a fully compatible venture deterministically", () => {
    const result = calculateMatch(demoVenture, demoThesis);
    expect(result.eligible).toBe(true);
    expect(result.score).toBe(100);
    expect(result.factors).toHaveLength(7);
    expect(result.rubricVersion).toBe("2026.1");
  });

  it("hard-blocks absent consent", () => {
    const result = calculateMatch(
      { ...demoVenture, consentToMatch: false },
      demoThesis,
    );
    expect(result.eligible).toBe(false);
    expect(result.score).toBe(0);
    expect(result.blockedBy[0]).toContain("not consented");
  });

  it("does not accept plan or payment inputs", () => {
    const baseline = calculateMatch(demoVenture, demoThesis);
    const withCommercialMetadata = calculateMatch(
      {
        ...demoVenture,
        plan: "sponsored",
        paymentStatus: "paid",
      } as typeof demoVenture,
      demoThesis,
    );
    expect(withCommercialMetadata).toEqual(baseline);
  });

  it.each([
    ["sector", { ...demoThesis, sectors: ["Health"] }, 80],
    ["stage", { ...demoThesis, stages: ["Prototype"] }, 80],
    [
      "ticket",
      { ...demoThesis, ticketMin: 5_000_001, ticketMax: 8_000_000 },
      80,
    ],
    ["traction", { ...demoThesis, minimumTraction: 4 }, 85],
    ["geography", { ...demoThesis, regions: ["NCR"] }, 90],
    ["impact", { ...demoThesis, impactGoals: ["SDG 3"] }, 90],
    ["risk", { ...demoThesis, riskTolerance: 2 }, 95],
  ] as Array<[string, InvestorThesis, number]>)(
    "scores a %s mismatch at its published weight",
    (factor, thesis, expected) => {
      const result = calculateMatch(demoVenture, thesis);
      expect(result.score).toBe(expected);
      expect(result.factors.find((item) => item.key === factor)?.matched).toBe(
        false,
      );
      expect(result.mismatches).toHaveLength(1);
    },
  );

  it("hard-blocks an explicitly excluded sector", () => {
    const result = calculateMatch(demoVenture, {
      ...demoThesis,
      excludedSectors: [demoVenture.sector],
    });
    expect(result.eligible).toBe(false);
    expect(result.score).toBe(0);
    expect(result.blockedBy).toContain("The venture is in an excluded sector.");
  });

  it("stores and applies the selected versioned rubric", () => {
    const rubric = {
      version: "2026.2-test",
      weights: {
        sector: 25,
        stage: 15,
        ticket: 20,
        traction: 15,
        geography: 10,
        impact: 10,
        risk: 5,
      },
    };
    const result = calculateMatch(
      demoVenture,
      { ...demoThesis, sectors: ["Health"] },
      rubric,
    );
    expect(result.rubricVersion).toBe("2026.2-test");
    expect(result.score).toBe(75);
  });

  it("rejects rubric weights that do not total 100", () => {
    expect(
      matchRubricSchema.safeParse({
        version: "broken",
        weights: {
          sector: 20,
          stage: 20,
          ticket: 20,
          traction: 15,
          geography: 10,
          impact: 10,
          risk: 0,
        },
      }).success,
    ).toBe(false);
  });
});
