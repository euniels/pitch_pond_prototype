import { describe, expect, it } from "vitest";
import { translate } from "./i18n";

describe("translations", () => {
  it("provides the critical funding label in both languages", () => {
    expect(translate("en", "allOrNothing")).toBe("All-or-nothing funding");
    expect(translate("fil", "allOrNothing")).toContain("pondohan");
  });
});
