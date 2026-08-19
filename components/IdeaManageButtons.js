"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteIdea } from "../lib/idea-actions";

export default function IdeaManageButtons({ ideaId, canEdit, canDelete }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  if (!canEdit && !canDelete) return null;

  async function handleDelete() {
    if (busy) return;
    const confirmed = window.confirm("이 아이디어를 삭제할까요? 삭제하면 되돌릴 수 없습니다.");
    if (!confirmed) return;

    setBusy(true);
    const result = await deleteIdea(ideaId);
    setBusy(false);

    if (!result?.ok) {
      setToast("삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      window.clearTimeout(handleDelete.timer);
      handleDelete.timer = window.setTimeout(() => setToast(""), 2400);
      return;
    }

    router.push("/ideas?deleted=1");
    router.refresh();
  }

  return (
    <div className="idea-card__actions">
      {canEdit ? (
        <Link className="idea-action" href={`/ideas/${ideaId}/edit`}>
          수정
        </Link>
      ) : null}
      {canDelete ? (
        <button className="idea-action idea-action--danger" type="button" onClick={handleDelete} disabled={busy}>
          삭제
        </button>
      ) : null}
      {toast ? (
        <div className="site-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
