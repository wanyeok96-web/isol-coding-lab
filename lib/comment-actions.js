"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "./supabase-server";

export async function addProgramComment(programId, formData) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const body = String(formData.get("body") || "");
  const { data, error } = await supabase.rpc("add_program_comment", {
    target_program_id: programId,
    comment_body: body,
  });

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidatePath(`/programs/${programId}`);
  }

  return data;
}

export async function deleteProgramComment(programId, commentId) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const { data, error } = await supabase.rpc("delete_program_comment", {
    target_comment_id: commentId,
  });

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidatePath(`/programs/${programId}`);
  }

  return data;
}
