import { describe, expect, it } from "vitest";
import { containsEicarSignature, scanAttachment } from "./scanner";

const eicar = new TextEncoder().encode(
  "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
);

describe("attachment scanning safeguards", () => {
  it("recognizes the standard EICAR test file", () => {
    expect(containsEicarSignature(eicar)).toBe(true);
  });

  it("rejects EICAR before any external scanner call", async () => {
    await expect(scanAttachment(eicar, "eicar.com.txt")).resolves.toMatchObject(
      {
        clean: false,
        provider: "local-signature-check",
      },
    );
  });
});
