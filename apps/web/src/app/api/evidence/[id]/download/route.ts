import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
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
    .select("storage_path,status")
    .eq("id", id)
    .eq("status", "ready")
    .single();
  if (!evidence)
    return NextResponse.json(
      { message: "Evidence is unavailable." },
      { status: 404 },
    );
  const { data, error } = await supabase.storage
    .from("evidence")
    .createSignedUrl(evidence.storage_path, 60, { download: true });
  if (error || !data)
    return NextResponse.json(
      { message: "A private download could not be created." },
      { status: 500 },
    );
  return NextResponse.redirect(data.signedUrl, {
    headers: { "Cache-Control": "no-store" },
  });
}
