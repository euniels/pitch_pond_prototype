import { NextResponse } from "next/server";
import { hasSupabaseAdminConfig } from "@/lib/env";
import { scannerHealth, scanningConfigured } from "@/lib/scanner";

export async function GET() {
  const scannerReady = scanningConfigured() ? await scannerHealth() : false;
  const dependencies = {
    database: hasSupabaseAdminConfig() ? "configured" : "missing",
    ai: process.env.OPENAI_API_KEY ? "configured" : "missing",
    malwareScanning: scannerReady
      ? "ready"
      : scanningConfigured()
        ? "unavailable"
        : "missing",
    email:
      process.env.RESEND_API_KEY && process.env.EMAIL_FROM
        ? "configured"
        : "missing",
  };
  const ready =
    dependencies.database === "configured" &&
    dependencies.ai === "configured" &&
    dependencies.malwareScanning === "ready" &&
    dependencies.email === "configured";
  return NextResponse.json(
    {
      service: "PitchPond",
      status: ready ? "ready" : "degraded",
      dependencies,
    },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
