"use client";

import { useState } from "react";
import { toggleProgramLike } from "../lib/like-actions";

const MESSAGES = {
  guest: "Google로 로그인한 뒤 좋아요를 누를 수 있습니다.",
  pending: "교직원 인증 후 좋아요를 누를 수 있습니다.",
  login: "Google로 로그인한 뒤 좋아요를 누를 수 있습니다.",
  staff: "교직원 인증 후 좋아요를 누를 수 있습니다.",
  error: "좋아요를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

function HeartIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} aria-hidden="true">
      <path
        d="M10 17s-6.2-3.7-8.1-7.3C.6 7.5 1.7 4.8 4.3 4.2c1.5-.4 3 .2 3.9 1.5C9.1 4.4 10.6 3.8 12.1 4.2c2.6.6 3.7 3.3 2.4 5.5C16.2 13.3 10 17 10 17Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LikeButton({ programId, likes = 0, liked = false, likeAccess = "guest", variant = "meta" }) {
  const [count, setCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(liked);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2400);
  }

  async function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (likeAccess !== "staff") {
      showToast(MESSAGES[likeAccess] || MESSAGES.guest);
      return;
    }

    if (busy) return;

    const nextLiked = !isLiked;
    setBusy(true);
    setIsLiked(nextLiked);
    setCount((value) => value + (nextLiked ? 1 : -1));

    const result = await toggleProgramLike(programId);
    setBusy(false);

    if (!result?.ok) {
      setIsLiked(!nextLiked);
      setCount((value) => value + (nextLiked ? -1 : 1));
      showToast(MESSAGES[result?.reason] || MESSAGES.error);
      return;
    }

    setIsLiked(Boolean(result.liked));
    setCount(Number(result.likes || 0));
  }

  const className =
    variant === "button"
      ? `btn btn--secondary like-btn${isLiked ? " is-liked" : ""}`
      : `like-meta like-meta--button${isLiked ? " is-liked" : ""}`;

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={handleClick}
        aria-pressed={isLiked}
        aria-label={isLiked ? `좋아요 취소, 현재 ${count}개` : `좋아요, 현재 ${count}개`}
      >
        <HeartIcon filled={isLiked} />
        {variant === "button" ? `좋아요 ${count}` : count}
      </button>
      {toast ? (
        <div className="site-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </>
  );
}
