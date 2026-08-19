"use client";

import { useState } from "react";
import GuideModal from "./GuideModal";

async function copyText(text) {
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
}

export default function CopyPromptButton({ text }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyText(text);
    setCopied(true);
    window.clearTimeout(handleCopy.timer);
    handleCopy.timer = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button className="btn btn--primary guide-copy-btn" type="button" onClick={() => setOpen(true)}>
        처음 넣을 프롬프트 복사하기
      </button>
      <GuideModal
        open={open}
        title="처음 넣을 프롬프트"
        onClose={() => setOpen(false)}
        footer={
          <button className="btn btn--primary" type="button" onClick={handleCopy}>
            {copied ? "복사되었습니다" : "이 프롬프트 복사하기"}
          </button>
        }
      >
        <pre className="guide-modal__prompt">{text}</pre>
      </GuideModal>
    </>
  );
}
