import { createHash } from "node:crypto";
import { publicEnv } from "./env";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const allowed = new URL(publicEnv.siteUrl).origin;
  if (origin !== allowed && process.env.NODE_ENV === "production")
    throw new Error("Origin is not allowed.");
}

export function requestKey(request: Request, scope: string) {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256")
    .update(
      `${scope}:${address}:${process.env.RATE_LIMIT_SALT ?? "development"}`,
    )
    .digest("hex");
}

export function safeAuthenticatedPath(value: string | null | undefined) {
  if (!value) return "/workspace";
  if (
    value === "/workspace" ||
    value.startsWith("/workspace/") ||
    /^\/invite\/[A-Za-z0-9_-]{20,}$/.test(value)
  )
    return value;
  return "/workspace";
}
