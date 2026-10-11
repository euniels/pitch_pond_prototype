import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/request-security";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id))
      return NextResponse.json(
        { message: "Invalid venture." },
        { status: 422 },
      );
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user)
      return NextResponse.json(
        { message: "Sign in is required." },
        { status: 401 },
      );
    const requestedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("ventures")
      .update({ deletion_requested_at: requestedAt, consent_to_match: false })
      .eq("id", id)
      .select("id,organization_id")
      .maybeSingle();
    if (error || !data)
      return NextResponse.json(
        { message: "The venture is unavailable." },
        { status: 404 },
      );
    await createAdminClient().from("audit_events").insert({
      actor_id: auth.user.id,
      organization_id: data.organization_id,
      action: "venture_deletion_requested",
      entity_type: "venture",
      entity_id: data.id,
      metadata: {},
    });
    return NextResponse.json(
      {
        ok: true,
        message:
          "Deletion requested. Matching access was disabled immediately.",
      },
      { status: 202 },
    );
  } catch {
    return NextResponse.json(
      { message: "Venture deletion could not be requested." },
      { status: 400 },
    );
  }
}
