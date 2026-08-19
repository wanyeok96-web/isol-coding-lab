"use client";

import { useState } from "react";
import { CATEGORIES, getUnitLabel, getUnitOptions } from "@/lib/constants";
import { getMakerNames } from "@/lib/format";
import EmptyState from "./EmptyState";
import ProgramCard from "./ProgramCard";

function matchesSearch(program, query, makersById) {
  if (!query) return true;

  const haystack = [
    program.title,
    program.subtitle,
    program.description,
    program.unit,
    ...(program.tags || []),
    getMakerNames(program.makerIds, makersById),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function ProgramExplorer({ programs, makersById, likeAccess = "guest", likedIds = [] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [unit, setUnit] = useState("전체");
  const unitOptions = getUnitOptions(category);
  const unitLabel = getUnitLabel(category);

  const filtered = programs.filter((program) => {
    const matchesCategory = category === "전체" || program.category === category;
    const matchesUnit = unit === "전체" || program.unit === unit;
    return matchesCategory && matchesUnit && matchesSearch(program, query.trim().toLowerCase(), makersById);
  });

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory);
    setUnit("전체");
  }

  return (
    <section className="explorer" id="programs" aria-labelledby="explorer-title">
      <div className="container">
        <div className="section-heading">
          <h2 id="explorer-title">필요한 도구를 찾아보세요.</h2>
          <p>학교업무부터 수업까지, 이솔고 선생님들이 직접 만든 프로그램을 만나보세요.</p>
        </div>

        <div className="explorer-controls">
          <div className="search-field">
            <label className="sr-only" htmlFor="program-search">
              프로그램 검색
            </label>
            <svg className="search-field__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              id="program-search"
              type="search"
              placeholder="어떤 도구가 필요하신가요?"
              autoComplete="off"
              spellCheck="false"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="filters" role="group" aria-label="카테고리 필터">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-chip${category === item ? " is-active" : ""}`}
                aria-pressed={category === item}
                onClick={() => handleCategoryChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {unitOptions.length ? (
            <div className="filters filters--units" role="group" aria-label={`${unitLabel} 필터`}>
              <button
                type="button"
                className={`filter-chip${unit === "전체" ? " is-active" : ""}`}
                aria-pressed={unit === "전체"}
                onClick={() => setUnit("전체")}
              >
                {unitLabel} 전체
              </button>
              {unitOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-chip${unit === item ? " is-active" : ""}`}
                  aria-pressed={unit === item}
                  onClick={() => setUnit(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <p className="result-count" aria-live="polite">
          {filtered.length ? `${filtered.length}개의 프로그램` : ""}
        </p>

        <div className="program-grid">
          {filtered.length === 0 ? (
            <EmptyState
              title={programs.length === 0 ? "아직 등록된 프로그램이 없어요." : "검색 결과가 없어요."}
              description={
                programs.length === 0
                  ? "선생님들이 만든 첫 도구가 여기에 모입니다."
                  : "다른 검색어나 카테고리를 선택해보세요."
              }
            />
          ) : (
            filtered.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                makersById={makersById}
                likeAccess={likeAccess}
                liked={likedIds.includes(program.id)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
