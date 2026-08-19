"use client";

import { useState } from "react";
import GuideModal from "./GuideModal";

export default function GithubGuidePanel({ steps = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn btn--primary guide-copy-btn" type="button" onClick={() => setOpen(true)}>
        깃허브에서 링크 만들기
      </button>
      <GuideModal open={open} title="깃허브에서 링크 만들기" onClose={() => setOpen(false)}>
        <ol className="guide-modal__steps">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>
      </GuideModal>
    </>
  );
}
