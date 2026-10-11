import { describe, expect, it } from "vitest";
import { invitationState } from "./invitations";

describe("invitationState", () => {
  const now = new Date("2026-10-11T00:00:00.000Z");
  it("accepts only an unused, unexpired invitation", () =>
    expect(
      invitationState(
        { accepted_at: null, expires_at: "2026-10-12T00:00:00.000Z" },
        now,
      ),
    ).toBe("available"));
  it("rejects an expired invitation", () =>
    expect(
      invitationState(
        { accepted_at: null, expires_at: "2026-10-10T00:00:00.000Z" },
        now,
      ),
    ).toBe("expired"));
  it("rejects a previously accepted invitation even before expiry", () =>
    expect(
      invitationState(
        {
          accepted_at: "2026-10-10T00:00:00.000Z",
          expires_at: "2026-10-12T00:00:00.000Z",
        },
        now,
      ),
    ).toBe("accepted"));
});
