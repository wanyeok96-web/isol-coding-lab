"use client";

import { useState } from "react";
import Link from "next/link";

const MESSAGES = {
  guest: "Google로 로그인한 뒤 아이디어를 제안할 수 있습니다.",
  pending: "교직원 인증 후 아이디어를 제안할 수 있습니다.",
};

export default function IdeaSubmitButton({ likeAccess = "guest" }) {
  const [toast, setToast] = useState("");

  if (likeAccess === "staff") {
    return (
      <Link className="btn btn--primary" href="/ideas/new">
        아이디어 제안하기
      </Link>
    );
  }

  function handleClick() {
    setToast(MESSAGES[likeAccess] || MESSAGES.guest);
    window.clearTimeout(handleClick.timer);
    handleClick.timer = window.setTimeout(() => setToast(""), 2400);
  }

  return (
    <>
      <button className="btn btn--primary" type="button" onClick={handleClick}>
        아이디어 제안하기
      </button>
      {toast ? (
        <div className="site-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </>
  );
}
