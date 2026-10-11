import { afterEach, describe, expect, it, vi } from "vitest";
import { runStructuredAi } from "./openai";

const { parseMock } = vi.hoisted(() => ({ parseMock: vi.fn() }));
vi.mock("openai", () => ({
  default: class MockOpenAI {
    responses = { parse: parseMock };
  },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  parseMock.mockReset();
});

describe("AI deterministic fallback", () => {
  it("returns an unavailable result without contacting a provider when no key exists", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("OPENAI_MODEL", "test-model");
    const result = await runStructuredAi("readiness_review", {
      venture: { stage: "pilot" },
    });
    expect(result).toMatchObject({
      available: false,
      model: "test-model",
      output: null,
    });
    expect(result.inputHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("surfaces provider timeouts for the route-level deterministic fallback", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    parseMock.mockRejectedValueOnce(new Error("timeout"));
    await expect(
      runStructuredAi("readiness_review", { venture: {} }),
    ).rejects.toThrow("timeout");
  });

  it("rejects refusals or incomplete responses", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    parseMock.mockResolvedValueOnce({
      status: "incomplete",
      output_parsed: null,
    });
    await expect(
      runStructuredAi("readiness_review", { venture: {} }),
    ).rejects.toThrow("incomplete or refused");
  });

  it("validates parsed provider output again before returning it", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    parseMock.mockResolvedValueOnce({
      status: "completed",
      output_parsed: { summary: "Missing required arrays" },
    });
    await expect(
      runStructuredAi("readiness_review", { venture: {} }),
    ).rejects.toThrow("required schema");
  });
});
