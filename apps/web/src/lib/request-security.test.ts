import { describe, expect, it } from "vitest";
import { safeAuthenticatedPath } from "./request-security";

describe("safeAuthenticatedPath", () => {
  it("allows only private application destinations", () => {
    expect(safeAuthenticatedPath("/workspace/investor")).toBe(
      "/workspace/investor",
    );
    expect(
      safeAuthenticatedPath("/invite/abcdefghijklmnopqrstuvwxyz123456"),
    ).toBe("/invite/abcdefghijklmnopqrstuvwxyz123456");
  });
  it.each([
    "//evil.example",
    "/\\evil.example",
    "https://evil.example",
    "/pricing",
    "javascript:alert(1)",
  ])("rejects unsafe redirect %s", (value) => {
    expect(safeAuthenticatedPath(value)).toBe("/workspace");
  });
});
