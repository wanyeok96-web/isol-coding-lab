"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "../../lib/supabase-server";

export async function approveStaff(formData) {
  const supabase = await createServerSupabase();
  if (!supabase) return;

  const email = String(formData.get("email") || "");
  await supabase.rpc("approve_staff", { target_email: email });
  revalidatePath("/admin");
}
