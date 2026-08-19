"use server";

import { createServerSupabase } from "./supabase-server";

export async function toggleProgramLike(programId) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const { data, error } = await supabase.rpc("toggle_program_like", {
    target_program_id: programId,
  });

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  return data;
}
