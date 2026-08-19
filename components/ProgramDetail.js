import Link from "next/link";
import { CATEGORY_THEME } from "@/lib/constants";
import { getVisibilityLabel } from "@/lib/format";
import CommentSection from "./CommentSection";
import EmptyState from "./EmptyState";
import MakerAvatar from "./MakerAvatar";
import ProgramActions from "./ProgramActions";
import ProgramCard from "./ProgramCard";
import ProgramManageButtons from "./ProgramManageButtons";
import ProgramThumbnail from "./ProgramThumbnail";

export default function ProgramDetail({
  program,
  makers,
  relatedPrograms,
  makersById,
  likeAccess = "guest",
  likedIds = [],
  comments = [],
  userEmail = null,
  isAdmin = false,
}) {
  const theme = CATEGORY_THEME[program.category] || CATEGORY_THEME["학교업무"];

  return (
    <div className="detail-root">
      <nav className="breadcrumb" aria-label="경로">
        <Link href="/#programs">프로그램</Link>
        <span>/</span>
        <span>{program.category}</span>
        <span>/</span>
        <span>{program.title}</span>
      </nav>

      <section className="detail-hero">
        <div className="detail-hero__copy">
          <span className="category-chip" data-category={program.category}>
            {program.category}
          </span>
          <h1>{program.title}</h1>
          <p className="detail-subtitle">{program.subtitle || ""}</p>
          <ul className="tag-list tag-list--detail">
            {(program.tags || []).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <p className="detail-visibility">{getVisibilityLabel(program.visibility)}</p>
          <div className="detail-makers">
            <span className="detail-label">제작자</span>
            <div className="detail-makers__links">
              {makers.map((maker) => (
                <Link key={maker.id} href={`/makers/${maker.id}`}>
                  {maker.name}
                </Link>
              ))}
            </div>
          </div>
          <ProgramActions program={program} likeAccess={likeAccess} liked={likedIds.includes(program.id)} />
          <ProgramManageButtons
            programId={program.id}
            canEdit={Boolean(program.ownerEmail) && program.ownerEmail.toLowerCase() === String(userEmail || "").toLowerCase()}
            canDelete={
              (Boolean(program.ownerEmail) &&
                program.ownerEmail.toLowerCase() === String(userEmail || "").toLowerCase()) ||
              isAdmin
            }
          />
        </div>
        <div className="detail-hero__visual">
          <div className="detail-thumb" style={{ "--thumb-from": theme.from, "--thumb-to": theme.to }}>
            <ProgramThumbnail program={program} large />
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <article className="surface-card">
          <h2>프로그램 소개</h2>
          <p>{program.description || ""}</p>
        </article>
        <article className="surface-card">
          <h2>왜 만들었나요?</h2>
          <p>{program.background || program.description || ""}</p>
        </article>
      </section>

      <section className="detail-grid detail-grid--meta">
        <article className="surface-card">
          <h2>제작 도구</h2>
          <ul className="tool-list">
            {(program.tools || []).length ? (
              program.tools.map((tool) => (
                <li key={tool} className="tool-chip">
                  {tool}
                </li>
              ))
            ) : (
              <li className="tool-chip">기록 준비 중</li>
            )}
          </ul>
        </article>
        <article className="surface-card">
          <h2>제작자</h2>
          <div className="maker-inline-list">
            {makers.map((maker) => (
              <Link
                key={maker.id}
                className="maker-inline-card"
                href={`/makers/${maker.id}`}
                aria-label={`${maker.name} 제작자 프로필`}
              >
                <div className="maker-inline-card__avatar" aria-hidden="true">
                  <MakerAvatar maker={maker} />
                </div>
                <div className="maker-inline-card__body">
                  <strong>{maker.name}</strong>
                  <small>{maker.subject}</small>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <CommentSection
        programId={program.id}
        comments={comments}
        likeAccess={likeAccess}
        userEmail={userEmail}
        isAdmin={isAdmin}
      />

      <section className="page-section page-section--detail">
        <div className="section-heading">
          <h2>관련 프로그램</h2>
          <p>비슷한 맥락에서 만들어진 다른 도구도 함께 살펴보세요.</p>
        </div>
        <div className="program-grid program-grid--detail">
          {relatedPrograms.length ? (
            relatedPrograms.map((item) => (
              <ProgramCard
                key={item.id}
                program={item}
                makersById={makersById}
                compact
                likeAccess={likeAccess}
                liked={likedIds.includes(item.id)}
              />
            ))
          ) : (
            <EmptyState title="아직 관련 프로그램이 없어요." description="다른 카테고리의 프로그램도 둘러보세요." />
          )}
        </div>
      </section>
    </div>
  );
}
