"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "./supabase-server";

function revalidateIdeas() {
  revalidatePath("/ideas");
}

export async function addIdea(formData) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const { data, error } = await supabase.rpc("add_idea", {
    idea_title: String(formData.get("title") || ""),
    idea_description: String(formData.get("description") || ""),
    idea_category: String(formData.get("category") || ""),
  });

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidateIdeas();
  }

  return data;
}

export async function updateIdea(ideaId, formData) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const { data, error } = await supabase.rpc("update_idea", {
    target_idea_id: ideaId,
    idea_title: String(formData.get("title") || ""),
    idea_description: String(formData.get("description") || ""),
    idea_category: String(formData.get("category") || ""),
  });

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidateIdeas();
    revalidatePath(`/ideas/${ideaId}/edit`);
  }

  return data;
}

export async function deleteIdea(ideaId) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const { data, error } = await supabase.rpc("delete_idea", {
    target_idea_id: ideaId,
  });

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidateIdeas();
  }

  return data;
}
