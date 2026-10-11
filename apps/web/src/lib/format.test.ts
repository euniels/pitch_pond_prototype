import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("treats API amounts as centavos", () => {
    expect(formatMoney(149900)).toContain("1,499");
    expect(formatMoney(50000)).toContain("500");
  });
});
