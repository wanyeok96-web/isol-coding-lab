"use client";

import { useState } from "react";

export default function GithubGuidePanel({ steps = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="github-guide">
      <button
        className="btn btn--secondary"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "안내 닫기" : "깃허브에서 링크 만들기 안내"}
      </button>
      {open ? (
        <ol className="guide-points github-guide__steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
