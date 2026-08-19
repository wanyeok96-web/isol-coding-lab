"use client";

import { useState } from "react";
import { approveStaff, removeStaff } from "../app/admin/actions";

const DELETE_MESSAGES = {
  self: "본인 계정은 삭제할 수 없습니다.",
  "last-admin": "마지막 관리자는 삭제할 수 없습니다.",
  missing: "이미 없는 가입자입니다.",
  forbidden: "관리자만 삭제할 수 있습니다.",
  error: "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export default function StaffMemberRow({ email, name, role, canDelete, canApprove }) {
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2400);
  }

  async function handleDelete(event) {
    event.preventDefault();
    if (busy) return;
    if (!window.confirm(`${name} 님을 가입자에서 삭제할까요?\n다시 인증해야 들어올 수 있습니다.`)) {
      return;
    }

    setBusy(true);
    const formData = new FormData(event.target);
    const result = await removeStaff(formData);
    setBusy(false);

    if (!result?.ok) {
      showToast(DELETE_MESSAGES[result?.reason] || DELETE_MESSAGES.error);
    }
  }

  return (
    <li className="staff-list__item">
      <div className="staff-list__identity">
        <strong>{name}</strong>
        <span>{email}</span>
      </div>
      <div className="staff-list__actions">
        {role ? <span className="staff-role">{role === "admin" ? "관리자" : "교직원"}</span> : null}
        {canApprove ? (
          <form action={approveStaff}>
            <input type="hidden" name="email" value={email} />
            <button className="btn btn--primary" type="submit">
              승인
            </button>
          </form>
        ) : null}
        {canDelete ? (
          <form onSubmit={handleDelete}>
            <input type="hidden" name="email" value={email} />
            <button className="btn btn--secondary" type="submit" disabled={busy}>
              삭제
            </button>
          </form>
        ) : null}
      </div>
      {toast ? (
        <div className="site-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </li>
  );
}
