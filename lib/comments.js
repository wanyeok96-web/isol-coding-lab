import { createServerSupabase } from "./supabase-server";

export async function getProgramComments(programId) {
  const supabase = await createServerSupabase();
  if (!supabase || !programId) return [];

  const { data, error } = await supabase
    .from("program_comments")
    .select("id, program_id, email, body, created_at")
    .eq("program_id", programId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data || [];
}
