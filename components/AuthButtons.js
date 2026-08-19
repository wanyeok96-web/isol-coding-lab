"use client";

import Link from "next/link";
import { createBrowserSupabase } from "../lib/supabase-browser";

export default function AuthButtons({ email, name, staffStatus, isAdmin }) {
  async function signInWithGoogle() {
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signOut() {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  if (email) {
    const label = name || email.split("@")[0] || "교직원";
    return (
      <div className="auth-status">
        <span className="auth-status__name" title={email}>
          {label}
        </span>
        {isAdmin ? (
          <Link className="auth-button" href="/admin">
            가입 승인
          </Link>
        ) : null}
        {staffStatus !== "approved" ? (
          <Link className="auth-button auth-button--primary" href="/join">
            교직원 인증
          </Link>
        ) : null}
        <button className="auth-button" type="button" onClick={signOut}>
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button className="auth-button auth-button--primary" type="button" onClick={signInWithGoogle}>
      Google로 로그인
    </button>
  );
}
