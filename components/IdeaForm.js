"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "../lib/constants";
import { addIdea, updateIdea } from "../lib/idea-actions";

const MESSAGES = {
  login: "Google로 로그인한 뒤 아이디어를 제안할 수 있습니다.",
  staff: "교직원 인증 후 아이디어를 제안할 수 있습니다.",
  invalid: "제목은 2~80자, 설명은 10~1000자로 적어 주세요. 카테고리도 선택해 주세요.",
  forbidden: "이 아이디어를 수정할 수 없습니다.",
  error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

const IDEA_CATEGORIES = CATEGORIES.filter((item) => item !== "전체");

export default function IdeaForm({ idea = null }) {
  const router = useRouter();
  const [description, setDescription] = useState(idea?.description || "");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(idea);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2400);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;

    const formData = new FormData(event.target);
    setBusy(true);
    const result = isEdit ? await updateIdea(idea.id, formData) : await addIdea(formData);
    setBusy(false);

    if (!result?.ok) {
      showToast(MESSAGES[result?.reason] || MESSAGES.error);
      return;
    }

    router.push(isEdit ? "/ideas?updated=1" : "/ideas?submitted=1");
    router.refresh();
  }

  return (
    <form className="join-form idea-form" onSubmit={handleSubmit}>
      <label className="join-form__label" htmlFor="idea-title">
        제목
      </label>
      <input
        id="idea-title"
        className="join-form__input"
        name="title"
        type="text"
        minLength={2}
        maxLength={80}
        required
        defaultValue={idea?.title || ""}
        placeholder="어떤 프로그램이 있으면 좋을까요?"
      />

      <label className="join-form__label" htmlFor="idea-category">
        카테고리
      </label>
      <select
        id="idea-category"
        className="join-form__input"
        name="category"
        required
        defaultValue={idea?.category || ""}
      >
        <option value="" disabled>
          카테고리를 선택하세요
        </option>
        {IDEA_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <label className="join-form__label" htmlFor="idea-description">
        설명
      </label>
      <textarea
        id="idea-description"
        className="comment-form__input"
        name="description"
        rows={6}
        minLength={10}
        maxLength={1000}
        required
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="학교에서 반복되는 불편함, 있으면 좋을 기능을 구체적으로 적어 주세요."
      />

      <div className="comment-form__footer">
        <span>{description.length} / 1000</span>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {isEdit ? "저장하기" : "제안하기"}
        </button>
      </div>

      {toast ? (
        <div className="site-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </form>
  );
}
