"use client";

import { useState } from "react";
import { addProgramComment, deleteProgramComment } from "../lib/comment-actions";
import { formatDateTime } from "../lib/format";

const MESSAGES = {
  guest: "Google로 로그인한 뒤 후기를 남길 수 있습니다.",
  pending: "교직원 인증 후 후기를 남길 수 있습니다.",
  login: "Google로 로그인한 뒤 후기를 남길 수 있습니다.",
  staff: "교직원 인증 후 후기를 남길 수 있습니다.",
  invalid: "1자 이상, 1000자 이하로 작성해 주세요.",
  forbidden: "이 후기를 삭제할 수 없습니다.",
  error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

function authorLabel(comment) {
  const name = String(comment?.author_name || "").trim();
  const email = String(comment?.email || "");
  const loginId = email.split("@")[0];
  if (!name) return "교직원";
  if (name.toLowerCase() === loginId.toLowerCase() && !/[가-힣]/.test(name)) {
    return "교직원";
  }
  return name;
}

export default function CommentSection({
  programId,
  comments = [],
  likeAccess = "guest",
  userEmail = null,
  isAdmin = false,
}) {
  const [items, setItems] = useState(comments);
  const [body, setBody] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const normalizedEmail = String(userEmail || "").trim().toLowerCase();
  const canWrite = likeAccess === "staff";

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2400);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canWrite) {
      showToast(MESSAGES[likeAccess] || MESSAGES.guest);
      return;
    }
    if (busy) return;

    const formData = new FormData(event.target);
    setBusy(true);
    const result = await addProgramComment(programId, formData);
    setBusy(false);

    if (!result?.ok) {
      showToast(MESSAGES[result?.reason] || MESSAGES.error);
      return;
    }

    const added = result.comment;
    if (added) {
      setItems((current) => [
        ...current,
        {
          id: added.id,
          program_id: added.program_id,
          email: added.email,
          author_name: added.author_name || "",
          body: added.body,
          created_at: added.created_at,
        },
      ]);
    }
    setBody("");
    event.target.reset();
  }

  async function handleDelete(commentId) {
    if (busy) return;
    setBusy(true);
    const result = await deleteProgramComment(programId, commentId);
    setBusy(false);

    if (!result?.ok) {
      showToast(MESSAGES[result?.reason] || MESSAGES.error);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== commentId));
  }

  return (
    <section className="surface-card comment-block" aria-labelledby="comments-title">
      <h2 id="comments-title">활용 후기와 질문</h2>
      <p>프로그램을 사용해 본 후기, 개선 아이디어, 질문을 남겨 주세요.</p>

      {items.length ? (
        <ul className="comment-list">
          {items.map((comment) => {
            const canDelete =
              String(comment.email || "").toLowerCase() === normalizedEmail || isAdmin;
            return (
              <li className="comment-item" key={comment.id}>
                <div className="comment-item__meta">
                  <strong>{authorLabel(comment)}</strong>
                  <time dateTime={comment.created_at}>{formatDateTime(comment.created_at)}</time>
                  {canDelete ? (
                    <button
                      className="comment-delete"
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                    >
                      삭제
                    </button>
                  ) : null}
                </div>
                <p>{comment.body}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="comment-empty">아직 후기가 없습니다. 첫 후기를 남겨 보세요.</p>
      )}

      {canWrite ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <label className="join-form__label" htmlFor="comment-body">
            후기 작성
          </label>
          <textarea
            id="comment-body"
            className="comment-form__input"
            name="body"
            rows={4}
            maxLength={1000}
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="이 프로그램을 어떻게 활용했는지, 무엇이 더 필요할지 적어 주세요."
          />
          <div className="comment-form__footer">
            <span>{body.length} / 1000</span>
            <button className="btn btn--primary" type="submit" disabled={busy}>
              등록하기
            </button>
          </div>
        </form>
      ) : (
        <p className="comment-hint">{MESSAGES[likeAccess] || MESSAGES.guest}</p>
      )}

      {toast ? (
        <div className="site-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </section>
  );
}
