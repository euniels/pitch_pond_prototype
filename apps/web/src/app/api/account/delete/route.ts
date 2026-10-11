import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { user } = await requireUser();
    const admin = createAdminClient();
    await admin.from("audit_events").insert({
      actor_id: user.id,
      action: "account_deletion_requested",
      entity_type: "profile",
      entity_id: user.id,
      metadata: {},
    });
    await admin
      .from("profiles")
      .update({ deletion_requested_at: new Date().toISOString() })
      .eq("id", user.id);
    return NextResponse.json(
      {
        ok: true,
        message:
          "Deletion request recorded. Access is suspended after an operator verifies retention obligations.",
      },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to request deletion.",
      },
      { status: 400 },
    );
  }
}
