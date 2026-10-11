"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicConfig } from "../env";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = requireSupabasePublicConfig();
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
