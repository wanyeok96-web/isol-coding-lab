"use server";

import { revalidatePath } from "next/cache";
import { getAuthorNamesByEmail } from "./comments";
import { getDisplayName, publicTeacherName } from "./staff";
import { createServerSupabase } from "./supabase-server";

export async function addProgramComment(programId, formData) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const body = String(formData.get("body") || "");
  const [{ data, error }, userResult] = await Promise.all([
    supabase.rpc("add_program_comment", {
      target_program_id: programId,
      comment_body: body,
    }),
    supabase.auth.getUser(),
  ]);

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    const comment = data.comment || {};
    const namesByEmail = await getAuthorNamesByEmail(supabase, [comment.email]);
    const email = String(comment.email || userResult?.data?.user?.email || "").trim().toLowerCase();
    const authorName = publicTeacherName({
      names: [
        comment.author_name,
        namesByEmail.get(email),
        getDisplayName(userResult?.data?.user),
      ],
      email,
    });

    data.comment = { ...comment, author_name: authorName };
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
