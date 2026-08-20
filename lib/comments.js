import { publicTeacherName } from "./staff";
import { createServerSupabase } from "./supabase-server";

function authorNameFromMaker(maker) {
  return publicTeacherName({
    names: [maker?.name],
    email: maker?.email,
  });
}

export async function getAuthorNamesByEmail(supabase, emails) {
  const uniqueEmails = [...new Set(emails.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean))];
  if (!supabase || !uniqueEmails.length) return new Map();

  const { data, error } = await supabase.from("makers").select("email, name").in("email", uniqueEmails);
  if (error || !data) return new Map();

  return new Map(
    data
      .map((maker) => [String(maker.email || "").trim().toLowerCase(), authorNameFromMaker(maker)])
      .filter(([email, name]) => email && name)
  );
}

function mapComment(comment, namesByEmail = new Map()) {
  const email = String(comment?.email || "").trim().toLowerCase();
  return {
    ...comment,
    author_name: publicTeacherName({
      names: [comment?.author_name, namesByEmail.get(email)],
      email,
    }),
  };
}

export async function getProgramComments(programId) {
  const supabase = await createServerSupabase();
  if (!supabase || !programId) return [];

  const listed = await supabase.rpc("list_program_comments", {
    target_program_id: programId,
  });

  if (!listed.error && Array.isArray(listed.data)) {
    return listed.data.map((comment) => mapComment(comment));
  }

  const { data, error } = await supabase
    .from("program_comments")
    .select("id, program_id, email, body, created_at")
    .eq("program_id", programId)
    .order("created_at", { ascending: true });

  if (error) return [];

  const comments = data || [];
  const namesByEmail = await getAuthorNamesByEmail(
    supabase,
    comments.map((comment) => comment.email)
  );

  return comments.map((comment) => mapComment(comment, namesByEmail));
}
