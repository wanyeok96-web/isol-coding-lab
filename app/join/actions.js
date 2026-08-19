"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase-server";

export async function redeemInviteCode(formData) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    redirect("/join?result=error");
  }

  const code = String(formData.get("code") || "");
  const { data, error } = await supabase.rpc("redeem_invite_code", { code });

  if (error || !data) {
    redirect("/join?result=bad-code");
  }

  redirect("/?auth=joined");
}

export async function requestStaffAccess() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    redirect("/join?result=error");
  }

  const { data, error } = await supabase.rpc("request_staff_access");

  if (error || data === "error") {
    redirect("/join?result=error");
  }

  if (data === "approved") {
    redirect("/?auth=joined");
  }

  redirect("/join?result=requested");
}
