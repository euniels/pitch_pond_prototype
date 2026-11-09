import { createServer } from "node:http";
import { createConnection } from "node:net";
import { timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/jpeg",
  "image/png",
]);
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".xlsx",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
]);

function json(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

export function authorized(header, secret = process.env.SCANNER_TOKEN ?? "") {
  const prefix = "Bearer ";
  if (!secret || !header?.startsWith(prefix)) return false;
  const received = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function validateFile(file) {
  const lowerName = file.name.toLowerCase();
  const extension = lowerName.includes(".")
    ? lowerName.slice(lowerName.lastIndexOf("."))
    : "";
  if (!ALLOWED_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(extension)) {
    return { ok: false, reason: "Unsupported file type." };
  }
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return { ok: false, reason: "File size must be between 1 byte and 10 MB." };
  }
  return { ok: true };
}

export function parseClamdResponse(value) {
  const response = value.replaceAll("\0", "").trim();
  if (response.endsWith("OK")) return { clean: true, provider: "clamav" };
  if (response.includes("FOUND")) {
    const finding = response.match(/: (.+) FOUND$/)?.[1] ?? "Malware detected";
    return { clean: false, provider: "clamav", reason: finding };
  }
  throw new Error("ClamAV returned an indeterminate result.");
}

function clamdCommand(command, timeoutMs = 5_000) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({
      host: process.env.CLAMD_HOST ?? "127.0.0.1",
      port: Number(process.env.CLAMD_PORT ?? 3310),
    });
    const chunks = [];
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("ClamAV timed out."));
    }, timeoutMs);
    socket.on("connect", () => socket.end(`z${command}\0`));
    socket.on("data", (chunk) => chunks.push(chunk));
    socket.on("error", reject);
    socket.on("close", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
  });
}

async function scanBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({
      host: process.env.CLAMD_HOST ?? "127.0.0.1",
      port: Number(process.env.CLAMD_PORT ?? 3310),
    });
    const chunks = [];
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("ClamAV scan timed out."));
    }, 25_000);

    socket.on("connect", () => {
      socket.write("zINSTREAM\0");
      for (let offset = 0; offset < buffer.length; offset += 64 * 1024) {
        const chunk = buffer.subarray(offset, offset + 64 * 1024);
        const size = Buffer.allocUnsafe(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      }
      socket.end(Buffer.alloc(4));
    });
    socket.on("data", (chunk) => chunks.push(chunk));
    socket.on("error", reject);
    socket.on("close", () => {
      clearTimeout(timer);
      try {
        resolve(parseClamdResponse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function readRequest(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > MAX_REQUEST_BYTES) throw Object.assign(new Error("Request too large."), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function handleScan(request, response) {
  if (!authorized(request.headers.authorization)) {
    return json(response, 401, { clean: false, provider: "clamav", reason: "Unauthorized." });
  }
  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.startsWith("multipart/form-data;")) {
    return json(response, 415, { clean: false, provider: "clamav", reason: "Multipart form data is required." });
  }

  const startedAt = performance.now();
  try {
    const body = await readRequest(request);
    const webRequest = new Request("http://scanner.local/scan", {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });
    const form = await webRequest.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json(response, 422, { clean: false, provider: "clamav", reason: "One file is required." });
    }
    const validation = validateFile(file);
    if (!validation.ok) {
      return json(response, 422, { clean: false, provider: "clamav", reason: validation.reason });
    }
    const result = await scanBuffer(Buffer.from(await file.arrayBuffer()));
    console.info(JSON.stringify({ event: "scan_complete", clean: result.clean, durationMs: Math.round(performance.now() - startedAt) }));
    return json(response, 200, result);
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 503;
    console.error(JSON.stringify({ event: "scan_failed", durationMs: Math.round(performance.now() - startedAt) }));
    return json(response, status, { clean: false, provider: "clamav", reason: status === 413 ? "File is too large." : "The scanner could not verify this file." });
  }
}

export function createScannerServer() {
  return createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/health") {
      try {
        const result = await clamdCommand("PING");
        return json(response, result.includes("PONG") ? 200 : 503, {
          service: "pitchpond-attachment-scanner",
          status: result.includes("PONG") ? "ready" : "degraded",
        });
      } catch {
        return json(response, 503, { service: "pitchpond-attachment-scanner", status: "degraded" });
      }
    }
    if (request.method === "POST" && request.url === "/scan") return handleScan(request, response);
    return json(response, 404, { message: "Not found." });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 8080);
  const server = createScannerServer();
  server.listen(port, "0.0.0.0", () => console.info(JSON.stringify({ event: "scanner_started", port })));
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
