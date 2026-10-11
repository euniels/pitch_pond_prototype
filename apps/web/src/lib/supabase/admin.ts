import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireServiceRoleKey, requireSupabasePublicConfig } from "../env";

export function createAdminClient() {
  const { supabaseUrl } = requireSupabasePublicConfig();
  return createSupabaseClient(supabaseUrl, requireServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
