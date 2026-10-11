import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { ALLOWED_EVIDENCE_TYPES, isLikelyTextCsv } from "@/lib/evidence";
import { extractDocumentText } from "@/lib/document-text";
import { assertSameOrigin } from "@/lib/request-security";
import { scanAttachment } from "@/lib/scanner";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user)
      return NextResponse.json(
        { message: "Sign in is required." },
        { status: 401 },
      );
    const { data: evidence } = await supabase
      .from("evidence_items")
      .select("*")
      .eq("id", id)
      .single();
    if (
      !evidence ||
      evidence.owner_id !== auth.user.id ||
      evidence.status !== "quarantined"
    )
      return NextResponse.json(
        { message: "Evidence is unavailable." },
        { status: 404 },
      );
    const admin = createAdminClient();
    await admin
      .from("evidence_items")
      .update({ status: "scanning" })
      .eq("id", id);
    const { data: file, error } = await admin.storage
      .from("evidence")
      .download(evidence.storage_path);
    if (error || !file) throw error ?? new Error("File missing");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (
      bytes.byteLength !== evidence.size_bytes ||
      bytes.byteLength > 10 * 1024 * 1024
    ) {
      await admin
        .from("evidence_items")
        .update({
          status: "rejected",
          rejection_reason: "Uploaded size does not match the declared size.",
        })
        .eq("id", id);
      return NextResponse.json(
        { message: "The uploaded size could not be verified." },
        { status: 422 },
      );
    }
    const detected = await fileTypeFromBuffer(bytes);
    const mime =
      detected?.mime ??
      (evidence.mime_type === "text/csv" && isLikelyTextCsv(bytes)
        ? "text/csv"
        : "");
    if (
      !ALLOWED_EVIDENCE_TYPES.includes(
        mime as (typeof ALLOWED_EVIDENCE_TYPES)[number],
      ) ||
      mime !== evidence.mime_type
    ) {
      await admin
        .from("evidence_items")
        .update({
          status: "rejected",
          rejection_reason: "File content does not match the allowed type.",
          detected_mime_type: mime || null,
        })
        .eq("id", id);
      return NextResponse.json(
        { message: "The file type could not be verified." },
        { status: 422 },
      );
    }
    const scan = await scanAttachment(bytes, evidence.file_name);
    if (!scan.clean) {
      await admin
        .from("evidence_items")
        .update({
          status: "rejected",
          rejection_reason: scan.reason ?? "Malware scan failed.",
          detected_mime_type: mime,
          scan_provider: scan.provider,
          scanned_at: new Date().toISOString(),
        })
        .eq("id", id);
      return NextResponse.json(
        { message: "The file did not pass security scanning." },
        { status: 422 },
      );
    }
    const extractedText = await extractDocumentText(bytes, mime);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    await admin
      .from("evidence_items")
      .update({
        status: "ready",
        sha256,
        detected_mime_type: mime,
        scan_provider: scan.provider,
        scanned_at: new Date().toISOString(),
        extracted_text: extractedText || null,
        extraction_status: extractedText ? "complete" : "not_applicable",
      })
      .eq("id", id);
    return NextResponse.json({
      status: "ready",
      extracted: Boolean(extractedText),
    });
  } catch {
    return NextResponse.json(
      {
        message: "Evidence processing failed safely. The file remains private.",
      },
      { status: 500 },
    );
  }
}
