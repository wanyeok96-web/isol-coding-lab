import { createServerSupabase } from "./supabase-server";

export function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function getDisplayName(user) {
  const meta = user?.user_metadata || {};
  const name = [meta.full_name, meta.name, meta.given_name].find((value) => String(value || "").trim());
  if (name) return String(name).trim();
  const email = user?.email || "";
  return email ? email.split("@")[0] : "";
}

export function getAvatarUrl(user) {
  const meta = user?.user_metadata || {};
  return String(meta.avatar_url || meta.picture || "").trim();
}

export async function ensureStaffMaker(supabase, user) {
  if (!supabase || !user) return;
  try {
    await supabase.rpc("ensure_staff_maker", {
      display_name: getDisplayName(user),
      avatar_url: getAvatarUrl(user),
    });
  } catch {
    // SQL을 아직 실행하지 않은 경우에도 로그인은 그대로 동작합니다.
  }
}

export async function getAuthState() {
  try {
    const supabase = await createServerSupabase();
    if (!supabase) {
      return { supabase: null, userEmail: null, userName: null, staffStatus: null, isAdmin: false, member: null };
    }

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    const email = user?.email || null;
    if (!email) {
      return { supabase, userEmail: null, userName: null, staffStatus: null, isAdmin: false, member: null };
    }

    const member = await getCurrentMember(supabase, email);
    if (isApprovedStaff(member)) {
      await ensureStaffMaker(supabase, user);
    }

    return {
      supabase,
      userEmail: email,
      userName: getDisplayName(user),
      staffStatus: member?.status || null,
      isAdmin: isAdminMember(member),
      member,
    };
  } catch {
    return { supabase: null, userEmail: null, userName: null, staffStatus: null, isAdmin: false, member: null };
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
