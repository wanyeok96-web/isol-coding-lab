import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicKey, isSupabaseConfigured } from "./supabase";

export function createBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, getSupabasePublicKey());
}
