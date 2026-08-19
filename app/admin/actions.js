"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "../../lib/supabase-server";

export async function approveStaff(formData) {
  const supabase = await createServerSupabase();
  if (!supabase) return;

  const email = String(formData.get("email") || "");
  await supabase.rpc("approve_staff", { target_email: email });
  revalidatePath("/admin");
  revalidatePath("/makers");
}

export async function removeStaff(formData) {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, reason: "error" };

  const email = String(formData.get("email") || "");
  const { data, error } = await supabase.rpc("remove_staff", { target_email: email });
  if (error || !data) {
    return { ok: false, reason: "error" };
  }

  if (data.ok) {
    revalidatePath("/admin");
    revalidatePath("/makers");
  }

  return data;
}
