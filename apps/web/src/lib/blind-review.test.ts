import { describe, expect, it } from "vitest";
import { redactForBlindReview } from "./blind-review";
import { demoVenture } from "./demo-data";

describe("redactForBlindReview", () => {
  it("removes identity and precise location cues", () => {
    const blind = redactForBlindReview(demoVenture);
    expect(blind.name).toBe("Identity hidden");
    expect("city" in blind).toBe(false);
    expect(JSON.stringify(blind)).not.toContain(demoVenture.name);
    expect(JSON.stringify(blind)).not.toContain(demoVenture.city);
  });
});
