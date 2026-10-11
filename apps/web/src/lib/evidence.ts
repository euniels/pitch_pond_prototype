import { z } from "zod";

export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EVIDENCE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/jpeg",
  "image/png",
] as const;

const EXTENSIONS_BY_TYPE: Record<
  (typeof ALLOWED_EVIDENCE_TYPES)[number],
  string[]
> = {
  "application/pdf": ["pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "docx",
  ],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "text/csv": ["csv"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
};

export const evidenceUploadSchema = z
  .object({
    ventureId: z.string().uuid(),
    title: z.string().trim().min(3).max(120),
    fileName: z
      .string()
      .trim()
      .min(1)
      .max(180)
      .regex(/^[^\\/]+$/),
    mimeType: z.enum(ALLOWED_EVIDENCE_TYPES),
    size: z.number().int().positive().max(MAX_EVIDENCE_BYTES),
    evidenceDate: z.string().date(),
  })
  .superRefine((value, context) => {
    const extension = value.fileName.split(".").pop()?.toLowerCase() ?? "";
    if (!EXTENSIONS_BY_TYPE[value.mimeType].includes(extension))
      context.addIssue({
        code: "custom",
        path: ["fileName"],
        message: "The file extension does not match the declared type.",
      });
  });

export function safeEvidencePath(
  userId: string,
  ventureId: string,
  evidenceId: string,
  fileName: string,
) {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "bin";
  return `${userId}/${ventureId}/${evidenceId}.${extension}`;
}

export function evidenceExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isLikelyTextCsv(bytes: Uint8Array) {
  if (bytes.includes(0)) return false;
  try {
    const sample = new TextDecoder("utf-8", { fatal: true }).decode(
      bytes.slice(0, 64 * 1024),
    );
    return !/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/.test(sample);
  } catch {
    return false;
  }
}
