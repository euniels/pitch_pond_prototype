import { afterEach, describe, expect, it, vi } from "vitest";
import { containsEicarSignature, scanAttachment, scannerHealth } from "./scanner";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("attachment scanner adapter", () => {
  it("rejects EICAR locally without sending the file upstream", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const bytes = new TextEncoder().encode(
      "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
    );
    expect(containsEicarSignature(bytes)).toBe(true);
    await expect(scanAttachment(bytes, "eicar.txt")).resolves.toMatchObject({
      clean: false,
      provider: "local-signature-check",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a strict clean response from the configured provider", async () => {
    vi.stubEnv("ATTACHMENT_SCANNER_ENDPOINT", "https://scanner.example/scan");
    vi.stubEnv("ATTACHMENT_SCANNER_TOKEN", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ clean: true, provider: "clamav" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    await expect(
      scanAttachment(new Uint8Array([1, 2, 3]), "sample.pdf"),
    ).resolves.toEqual({ clean: true, provider: "clamav", reason: undefined });
  });

  it("fails closed on malformed provider output", async () => {
    vi.stubEnv("ATTACHMENT_SCANNER_ENDPOINT", "https://scanner.example/scan");
    vi.stubEnv("ATTACHMENT_SCANNER_TOKEN", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ clean: "maybe" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    await expect(
      scanAttachment(new Uint8Array([1, 2, 3]), "sample.pdf"),
    ).rejects.toBeDefined();
  });

  it("reports scanner readiness without exposing credentials", async () => {
    vi.stubEnv("ATTACHMENT_SCANNER_ENDPOINT", "https://scanner.example/scan");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "ready" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    await expect(scannerHealth()).resolves.toBe(true);
  });
});
