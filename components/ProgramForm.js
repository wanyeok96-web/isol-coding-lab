"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, getUnitLabel, getUnitOptions } from "../lib/constants";
import { joinCommaList } from "../lib/format";
import { addProgram, updateProgram } from "../lib/program-actions";

const MESSAGES = {
  login: "Google로 로그인한 뒤 프로그램을 등록할 수 있습니다.",
  staff: "교직원 인증 후 프로그램을 등록할 수 있습니다.",
  invalid: "필수 항목을 확인해 주세요. 링크는 https:// 로 시작해야 합니다.",
  forbidden: "이 프로그램을 수정할 수 없습니다.",
  error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

const PROGRAM_CATEGORIES = CATEGORIES.filter((item) => item !== "전체");

export default function ProgramForm({ program = null, maker = null, defaultMakerName = "" }) {
  const router = useRouter();
  const [description, setDescription] = useState(program?.description || "");
  const [background, setBackground] = useState(program?.background || "");
  const [category, setCategory] = useState(program?.category || "");
  const [unit, setUnit] = useState(program?.unit || "");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(program);
  const unitOptions = getUnitOptions(category);
  const unitLabel = getUnitLabel(category);

  function handleCategoryChange(event) {
    const nextCategory = event.target.value;
    const nextOptions = getUnitOptions(nextCategory);
    setCategory(nextCategory);
    setUnit(nextOptions.includes(unit) ? unit : "");
  }

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
    const result = isEdit ? await updateProgram(program.id, formData) : await addProgram(formData);
    setBusy(false);

    if (!result?.ok) {
      showToast(MESSAGES[result?.reason] || MESSAGES.error);
      return;
    }

    router.push(isEdit ? `/?notice=updated` : `/?notice=submitted`);
    router.refresh();
  }

  return (
    <form className="join-form idea-form" onSubmit={handleSubmit}>
      <label className="join-form__label" htmlFor="program-title">
        프로그램 이름
      </label>
      <input
        id="program-title"
        className="join-form__input"
        name="title"
        type="text"
        minLength={2}
        maxLength={80}
        required
        defaultValue={program?.title || ""}
        placeholder="예: Exam Flow"
      />

      <label className="join-form__label" htmlFor="program-subtitle">
        한 줄 소개
      </label>
      <input
        id="program-subtitle"
        className="join-form__input"
        name="subtitle"
        type="text"
        maxLength={80}
        defaultValue={program?.subtitle || ""}
        placeholder="이 프로그램이 무엇을 돕는지 짧게 적어 주세요"
      />

      <label className="join-form__label" htmlFor="program-category">
        카테고리
      </label>
      <select
        id="program-category"
        className="join-form__input"
        name="category"
        required
        value={category}
        onChange={handleCategoryChange}
      >
        <option value="" disabled>
          카테고리를 선택하세요
        </option>
        {PROGRAM_CATEGORIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label className="join-form__label" htmlFor="program-unit">
        {unitLabel}
      </label>
      <select
        id="program-unit"
        className="join-form__input"
        name="unit"
        required
        disabled={!category}
        value={unit}
        onChange={(event) => setUnit(event.target.value)}
      >
        <option value="" disabled>
          {category ? `${unitLabel}를 선택하세요` : "카테고리를 먼저 선택하세요"}
        </option>
        {unitOptions.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label className="join-form__label" htmlFor="program-visibility">
        공개 범위
      </label>
      <select
        id="program-visibility"
        className="join-form__input"
        name="visibility"
        required
        defaultValue={program?.visibility || "public"}
      >
        <option value="public">전체 공개</option>
        <option value="school">이솔고 교직원만</option>
      </select>

      <label className="join-form__label" htmlFor="program-description">
        프로그램 소개
      </label>
      <textarea
        id="program-description"
        className="comment-form__input"
        name="description"
        rows={5}
        minLength={10}
        maxLength={2000}
        required
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="어떤 불편함을 어떻게 도와주는지 적어 주세요."
      />
      <p className="comment-form__footer">
        <span>{description.length} / 2000</span>
      </p>

      <label className="join-form__label" htmlFor="program-background">
        왜 만들었나요? (선택)
      </label>
      <textarea
        id="program-background"
        className="comment-form__input"
        name="background"
        rows={4}
        maxLength={2000}
        value={background}
        onChange={(event) => setBackground(event.target.value)}
        placeholder="비워 두면 소개 글과 같게 저장됩니다."
      />

      <label className="join-form__label" htmlFor="program-tags">
        태그 (쉼표로 구분)
      </label>
      <input
        id="program-tags"
        className="join-form__input"
        name="tags"
        type="text"
        defaultValue={joinCommaList(program?.tags)}
        placeholder="예: 평가, 지필평가, 자동화"
      />

      <label className="join-form__label" htmlFor="program-tools">
        제작 도구 (쉼표로 구분)
      </label>
      <input
        id="program-tools"
        className="join-form__input"
        name="tools"
        type="text"
        defaultValue={joinCommaList(program?.tools)}
        placeholder="예: Cursor, Claude"
      />

      <label className="join-form__label" htmlFor="program-url">
        프로그램 주소 (선택)
      </label>
      <input
        id="program-url"
        className="join-form__input"
        name="url"
        type="text"
        defaultValue={program?.url && program.url !== "#" ? program.url : ""}
        placeholder="https://"
      />

      <label className="join-form__label" htmlFor="program-github">
        GitHub 주소 (선택)
      </label>
      <input
        id="program-github"
        className="join-form__input"
        name="github"
        type="text"
        defaultValue={program?.github && program.github !== "#" ? program.github : ""}
        placeholder="https://github.com/..."
      />

      <label className="join-form__label" htmlFor="maker-name">
        제작자 이름
      </label>
      <input
        id="maker-name"
        className="join-form__input"
        name="makerName"
        type="text"
        minLength={2}
        maxLength={40}
        required
        defaultValue={maker?.name || defaultMakerName}
        placeholder="카드에 보여질 이름"
      />

      <label className="join-form__label" htmlFor="maker-subject">
        담당 교과 (선택)
      </label>
      <input
        id="maker-subject"
        className="join-form__input"
        name="makerSubject"
        type="text"
        maxLength={40}
        defaultValue={maker?.subject || ""}
        placeholder="예: 지리"
      />

      <div className="form-actions">
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {isEdit ? "저장하기" : "등록하기"}
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
