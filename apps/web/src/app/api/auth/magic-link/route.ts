import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig, publicEnv } from "@/lib/env";
import {
  assertSameOrigin,
  requestKey,
  safeAuthenticatedPath,
} from "@/lib/request-security";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email().max(180),
  next: z.string().max(500).optional(),
});

const genericMessage =
  "If this email is invited, a secure sign-in link is on its way.";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!hasSupabaseAdminConfig()) {
      return NextResponse.json(
        { message: "Authentication is not configured." },
        { status: 503 },
      );
    }
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { message: "Enter a valid invited email address." },
        { status: 422 },
      );
    const email = parsed.data.email.toLowerCase();
    const admin = createAdminClient();
    const { data: allowed } = await admin.rpc("check_rate_limit", {
      p_key: requestKey(request, "magic-link"),
      p_limit: 6,
      p_window_seconds: 3600,
    });
    if (!allowed)
      return NextResponse.json(
        { message: "Too many attempts. Try again later." },
        { status: 429 },
      );

    const { data: activeInvite } = await admin
      .from("invitations")
      .select("id")
      .eq("email", email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    const redirectTo = `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(safeAuthenticatedPath(parsed.data.next))}`;
    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let account = listed.data.users.find(
      (user) => user.email?.toLowerCase() === email,
    );
    if (!account && activeInvite) {
      const created = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      account = created.data.user ?? undefined;
    }
    const userId = account?.id;
    const { count: membershipCount } = userId
      ? await admin
          .from("organization_memberships")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      : { count: 0 };
    if (account && (activeInvite || (membershipCount ?? 0) > 0)) {
      const supabase = await createClient();
      await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
      });
    }
    return NextResponse.json({ message: genericMessage });
  } catch {
    return NextResponse.json({ message: genericMessage });
  }
}
