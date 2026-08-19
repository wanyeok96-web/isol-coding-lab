"use client";

import { useState } from "react";
import Link from "next/link";

const MESSAGES = {
  guest: "Google로 로그인한 뒤 프로그램을 등록할 수 있습니다.",
  pending: "교직원 인증 후 프로그램을 등록할 수 있습니다.",
};

export default function ProgramSubmitButton({ likeAccess = "guest" }) {
  const [toast, setToast] = useState("");

  if (likeAccess === "staff") {
    return (
      <Link className="btn btn--secondary" href="/programs/new">
        프로그램 등록하기
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
      <button className="btn btn--secondary" type="button" onClick={handleClick}>
        프로그램 등록하기
      </button>
      {toast ? (
        <div className="site-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </>
  );
}
