"use client";

import { useState } from "react";

export default function ToastButton({ className, message, children }) {
  const [visible, setVisible] = useState(false);

  function handleClick() {
    setVisible(true);
    window.clearTimeout(handleClick.timer);
    handleClick.timer = window.setTimeout(() => setVisible(false), 2400);
  }

  return (
    <>
      <button className={className} type="button" onClick={handleClick}>
        {children}
      </button>
      {visible ? (
        <div className="site-toast" role="status" aria-live="polite">
          {message}
        </div>
      ) : null}
    </>
  );
}
