import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/request-security";
import { createClient } from "@/lib/supabase/server";

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
    const { data, error } = await supabase
      .from("evidence_items")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner_id", auth.user.id)
      .select("id")
      .maybeSingle();
    if (error || !data)
      return NextResponse.json(
        { message: "Evidence is unavailable." },
        { status: 404 },
      );
    return NextResponse.json({
      ok: true,
      message:
        "Evidence is hidden immediately and queued for permanent removal under the retention policy.",
    });
  } catch {
    return NextResponse.json(
      { message: "Evidence deletion could not be requested." },
      { status: 400 },
    );
  }
}
