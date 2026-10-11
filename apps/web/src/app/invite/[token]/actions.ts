"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function acceptInvitationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (token.length < 32 || token.length > 256) {
    throw new Error("This invitation token is invalid.");
  }

  const { supabase } = await requireUser();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.rpc("accept_invitation", {
    p_token_hash: tokenHash,
  });

  if (error) {
    redirect(`/invite/${encodeURIComponent(token)}?error=acceptance`);
  }

  redirect("/workspace");
}
