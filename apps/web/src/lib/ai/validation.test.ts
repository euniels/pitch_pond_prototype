import { describe, expect, it } from "vitest";
import { collectEvidenceIds, unexpectedEvidenceIds } from "./validation";

const allowed = "11111111-1111-4111-8111-111111111111";
const fabricated = "22222222-2222-4222-8222-222222222222";

describe("AI evidence-reference validation", () => {
  it("collects nested evidence references without interpreting ordinary text", () => {
    const result = collectEvidenceIds({
      gaps: [{ evidenceIds: [allowed] }],
      summary: "The document is dated 2026-10-11.",
    });
    expect([...result]).toEqual([allowed]);
  });

  it("rejects fabricated references", () => {
    expect(
      unexpectedEvidenceIds(
        { supportedClaims: [{ evidenceIds: [allowed, fabricated] }] },
        [allowed],
      ),
    ).toEqual([fabricated]);
  });
});
