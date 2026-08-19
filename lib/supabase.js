import { createClient } from "@supabase/supabase-js";

export function getSupabasePublicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublicKey());
}

export function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, getSupabasePublicKey());
}
