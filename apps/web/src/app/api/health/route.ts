import { NextResponse } from "next/server";
import { hasSupabaseAdminConfig } from "@/lib/env";
import { scanningConfigured } from "@/lib/scanner";

export function GET() {
  const dependencies = {
    database: hasSupabaseAdminConfig() ? "configured" : "missing",
    ai: process.env.OPENAI_API_KEY ? "configured" : "missing",
    malwareScanning: scanningConfigured() ? "configured" : "missing",
    email:
      process.env.RESEND_API_KEY && process.env.EMAIL_FROM
        ? "configured"
        : "missing",
  };
  const ready = Object.values(dependencies).every(
    (value) => value === "configured",
  );
  return NextResponse.json(
    {
      service: "PitchPond",
      status: ready ? "ready" : "degraded",
      dependencies,
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
