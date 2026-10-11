import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "./env";
import { createClient } from "./supabase/server";

export async function requireUser() {
  if (!hasSupabaseConfig()) redirect("/sign-in?configuration=missing");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/sign-in?next=/workspace");
  return { supabase, user: data.user };
}

export async function getOptionalUser() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
