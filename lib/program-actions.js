"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "./supabase-server";
import { parseCommaList } from "./format";

function revalidatePrograms(programId) {
  revalidatePath("/");
  revalidatePath("/makers");
  if (programId) {
    revalidatePath(`/programs/${programId}`);
    revalidatePath(`/programs/${programId}/edit`);
  }
}

function programPayload(formData) {
  return {
    program_title: String(formData.get("title") || ""),
    program_subtitle: String(formData.get("subtitle") || ""),
    program_description: String(formData.get("description") || ""),
    program_background: String(formData.get("background") || ""),
    program_category: String(formData.get("category") || ""),
    program_tags: parseCommaList(formData.get("tags")),
    program_tools: parseCommaList(formData.get("tools")),
    program_url: String(formData.get("url") || ""),
    program_github: String(formData.get("github") || ""),
    program_visibility: String(formData.get("visibility") || "public"),
    maker_name: String(formData.get("makerName") || ""),
    maker_subject: String(formData.get("makerSubject") || ""),
  };
}

export async function addProgram(formData) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const { data, error } = await supabase.rpc("add_program", programPayload(formData));
  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidatePrograms(data.id);
  }

  return data;
}

export async function updateProgram(programId, formData) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const { data, error } = await supabase.rpc("update_program", {
    target_program_id: programId,
    ...programPayload(formData),
  });

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidatePrograms(programId);
  }

  return data;
}

export async function deleteProgram(programId) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "error" };
  }

  const { data, error } = await supabase.rpc("delete_program", {
    target_program_id: programId,
  });

  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidatePrograms(programId);
  }

  return data;
}
