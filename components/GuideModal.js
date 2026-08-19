"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function GuideModal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;

    function onKey(event) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="guide-modal" role="presentation">
      <button className="guide-modal__backdrop" type="button" aria-label="닫기" onClick={onClose} />
      <div className="guide-modal__panel" role="dialog" aria-modal="true" aria-labelledby="guide-modal-title">
        <div className="guide-modal__header">
          <h3 id="guide-modal-title">{title}</h3>
          <button className="guide-modal__close" type="button" onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </div>
        <div className="guide-modal__body">{children}</div>
        {footer ? <div className="guide-modal__footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
