import { createServerSupabase } from "./supabase-server";
import { getAuthState, isApprovedStaff, normalizeEmail } from "./staff";

export async function getLikedProgramIds(supabase, email) {
  const normalized = normalizeEmail(email);
  if (!supabase || !normalized) return [];

  const { data, error } = await supabase.from("program_likes").select("program_id");
  if (error) return [];
  return (data || []).map((row) => row.program_id);
}

export async function getLikeContext() {
  const auth = await getAuthState();
  const likeAccess = isApprovedStaff(auth.member) ? "staff" : auth.userEmail ? "pending" : "guest";
  const likedIds =
    likeAccess === "staff" ? await getLikedProgramIds(auth.supabase, auth.userEmail) : [];

  return { likeAccess, likedIds, userEmail: auth.userEmail, isAdmin: auth.isAdmin };
}
