import { createServerSupabase } from "./supabase-server";

export function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export async function getAuthState() {
  try {
    const supabase = await createServerSupabase();
    if (!supabase) {
      return { supabase: null, userEmail: null, staffStatus: null, isAdmin: false, member: null };
    }

    const { data } = await supabase.auth.getUser();
    const email = data.user?.email || null;
    if (!email) {
      return { supabase, userEmail: null, staffStatus: null, isAdmin: false, member: null };
    }

    const member = await getCurrentMember(supabase, email);
    return {
      supabase,
      userEmail: email,
      staffStatus: member?.status || null,
      isAdmin: isAdminMember(member),
      member,
    };
  } catch {
    return { supabase: null, userEmail: null, staffStatus: null, isAdmin: false, member: null };
  }
}

export async function getCurrentMember(supabase, email) {
  const normalized = normalizeEmail(email);
  if (!supabase || !normalized) return null;

  const { data, error } = await supabase
    .from("staff_members")
    .select("email, role, status")
    .eq("email", normalized)
    .maybeSingle();

  if (error) return null;
  return data;
}

export function isApprovedStaff(member) {
  return member?.status === "approved";
}

export function isAdminMember(member) {
  return member?.role === "admin" && member?.status === "approved";
}
