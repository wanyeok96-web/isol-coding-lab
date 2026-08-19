"use client";

import { useState } from "react";

export default function CopyPromptButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }

    setCopied(true);
    window.clearTimeout(handleCopy.timer);
    handleCopy.timer = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button className="btn btn--primary guide-copy-btn" type="button" onClick={handleCopy}>
      {copied ? "복사되었습니다" : "처음 넣을 글 복사하기"}
    </button>
  );
}
