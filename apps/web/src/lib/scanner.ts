export type ScanResult = { clean: boolean; provider: string; reason?: string };

export function scanningConfigured() {
  return Boolean(
    process.env.ATTACHMENT_SCANNER_ENDPOINT &&
      process.env.ATTACHMENT_SCANNER_TOKEN,
  );
}

export function containsEicarSignature(bytes: Uint8Array) {
  const sample = new TextDecoder("ascii").decode(bytes.slice(0, 8_192));
  return sample.includes("EICAR-STANDARD-ANTIVIRUS-TEST-FILE");
}

export async function scanAttachment(
  bytes: Uint8Array,
  fileName: string,
): Promise<ScanResult> {
  if (containsEicarSignature(bytes)) {
    return {
      clean: false,
      provider: "local-signature-check",
      reason: "The standard antivirus test signature was detected.",
    };
  }
  const endpoint = process.env.ATTACHMENT_SCANNER_ENDPOINT;
  const token = process.env.ATTACHMENT_SCANNER_TOKEN;
  if (!endpoint || !token) {
    if (process.env.NODE_ENV === "production")
      return {
        clean: false,
        provider: "unconfigured",
        reason: "Malware scanning is unavailable.",
      };
    return {
      clean: true,
      provider: "development-bypass",
      reason: "Local development only.",
    };
  }

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)]), fileName);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    return {
      clean: false,
      provider: "attachment-scanner",
      reason: "The scanner could not verify this file.",
    };
  const result = (await response.json()) as {
    status?: string;
    clean?: boolean;
    malware?: boolean;
    message?: string;
  };
  return {
    clean:
      result.clean === true ||
      result.status === "clean" ||
      result.malware === false,
    provider: "attachment-scanner",
    reason: result.message,
  };
}
