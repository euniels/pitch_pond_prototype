import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  evidenceExtension,
  evidenceUploadSchema,
  safeEvidencePath,
} from "@/lib/evidence";
import { scanningConfigured } from "@/lib/scanner";
import { assertSameOrigin } from "@/lib/request-security";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (process.env.NODE_ENV === "production" && !scanningConfigured())
      return NextResponse.json(
        {
          message:
            "Evidence uploads are disabled until malware scanning is configured.",
        },
        { status: 503 },
      );
    const parsed = evidenceUploadSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          message: "Invalid evidence metadata.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user)
      return NextResponse.json(
        { message: "Sign in is required." },
        { status: 401 },
      );
    const [{ data: flag }, { data: allowed }] = await Promise.all([
      supabase
        .from("feature_flags")
        .select("enabled")
        .eq("key", "file_uploads")
        .maybeSingle(),
      supabase.rpc("check_rate_limit", {
        p_key: `evidence-upload:${auth.user.id}`,
        p_limit: 20,
        p_window_seconds: 3600,
      }),
    ]);
    if (process.env.NODE_ENV === "production" && !flag?.enabled)
      return NextResponse.json(
        { message: "Evidence uploads are not enabled for this workspace." },
        { status: 503 },
      );
    if (!allowed)
      return NextResponse.json(
        { message: "Upload limit reached. Try again later." },
        { status: 429 },
      );
    const evidenceId = randomUUID();
    const storagePath = safeEvidencePath(
      auth.user.id,
      parsed.data.ventureId,
      evidenceId,
      parsed.data.fileName,
    );
    const { data: upload, error: uploadError } = await supabase.storage
      .from("evidence")
      .createSignedUploadUrl(storagePath);
    if (uploadError) throw uploadError;
    const { error } = await supabase.from("evidence_items").insert({
      id: evidenceId,
      venture_id: parsed.data.ventureId,
      owner_id: auth.user.id,
      title: parsed.data.title,
      file_name: parsed.data.fileName,
      storage_path: storagePath,
      mime_type: parsed.data.mimeType,
      extension: evidenceExtension(parsed.data.fileName),
      size_bytes: parsed.data.size,
      evidence_date: parsed.data.evidenceDate,
      status: "quarantined",
    } as never);
    if (error) throw error;
    return NextResponse.json(
      { evidenceId, path: storagePath, token: upload.token },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "A secure upload could not be prepared." },
      { status: 500 },
    );
  }
}
