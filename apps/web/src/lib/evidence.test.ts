import { describe, expect, it } from "vitest";
import {
  evidenceUploadSchema,
  isLikelyTextCsv,
  MAX_EVIDENCE_BYTES,
  safeEvidencePath,
} from "./evidence";

const valid = {
  ventureId: "00000000-0000-4000-8000-000000000001",
  title: "Customer interviews",
  fileName: "interviews.pdf",
  mimeType: "application/pdf",
  size: 1024,
  evidenceDate: "2026-10-11",
};

describe("evidence validation", () => {
  it("accepts only the supported private evidence contract", () =>
    expect(evidenceUploadSchema.safeParse(valid).success).toBe(true));
  it("rejects oversized and path-shaped names", () => {
    expect(
      evidenceUploadSchema.safeParse({ ...valid, size: MAX_EVIDENCE_BYTES + 1 })
        .success,
    ).toBe(false);
    expect(
      evidenceUploadSchema.safeParse({ ...valid, fileName: "../secret.pdf" })
        .success,
    ).toBe(false);
  });
  it("builds venture-scoped storage paths without preserving the source name", () => {
    expect(
      safeEvidencePath("user", "venture", "evidence", "Sensitive Plan.PDF"),
    ).toBe("user/venture/evidence.pdf");
  });
  it("rejects binary content disguised as CSV", () => {
    expect(
      isLikelyTextCsv(new TextEncoder().encode("name,value\nalpha,1")),
    ).toBe(true);
    expect(isLikelyTextCsv(new Uint8Array([0x50, 0x4b, 0x00, 0x01]))).toBe(
      false,
    );
  });
});
