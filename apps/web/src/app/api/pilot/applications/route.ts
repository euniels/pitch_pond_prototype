import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/env";
import { pilotApplicationSchema } from "@/lib/schemas";
import { assertSameOrigin, requestKey } from "@/lib/request-security";
import { sendOperationalEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!hasSupabaseAdminConfig())
      return NextResponse.json(
        { message: "Pilot applications are not configured yet." },
        { status: 503 },
      );
    const parsed = pilotApplicationSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          message: "Review the application fields.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    const admin = createAdminClient();
    const { data: allowed } = await admin.rpc("check_rate_limit", {
      p_key: requestKey(request, "pilot-application"),
      p_limit: 4,
      p_window_seconds: 3600,
    });
    if (!allowed)
      return NextResponse.json(
        { message: "Too many submissions. Try again later." },
        { status: 429 },
      );
    const { website, ...application } = parsed.data;
    void website;
    const { error } = await admin
      .from("pilot_applications")
      .insert(application as never);
    if (error) throw error;
    await sendOperationalEmail(
      "New PitchPond pilot application",
      `${application.name} (${application.email}) applied as ${application.role} from ${application.organization}.`,
    );
    return NextResponse.json(
      { message: "Application received. The pilot team will review it." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "The application could not be submitted safely." },
      { status: 500 },
    );
  }
}
