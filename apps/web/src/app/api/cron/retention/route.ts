import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function runRetention(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const retentionDays = Math.max(
    1,
    Number(process.env.EVIDENCE_RETENTION_DAYS ?? 30),
  );
  const before = new Date(
    Date.now() - retentionDays * 86_400_000,
  ).toISOString();
  const admin = createAdminClient();
  const { data: items, error } = await admin
    .from("evidence_items")
    .select("id,storage_path")
    .not("deleted_at", "is", null)
    .lt("deleted_at", before)
    .neq("status", "deleted")
    .limit(100);
  if (error)
    return NextResponse.json(
      { message: "Retention query failed." },
      { status: 500 },
    );
  const paths = (items ?? []).map((item) => item.storage_path);
  if (paths.length) {
    const removed = await admin.storage.from("evidence").remove(paths);
    if (removed.error)
      return NextResponse.json(
        { message: "Storage deletion failed." },
        { status: 500 },
      );
    await admin
      .from("evidence_items")
      .update({
        status: "deleted",
        extracted_text: null,
        source_pages: [],
        sha256: null,
      })
      .in(
        "id",
        (items ?? []).map((item) => item.id),
      );
  }
  return NextResponse.json({ ok: true, removed: paths.length });
}

export const GET = runRetention;
export const POST = runRetention;

export const maxDuration = 60;
