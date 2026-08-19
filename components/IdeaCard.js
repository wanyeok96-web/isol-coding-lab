import Link from "next/link";
import { IDEA_STATUS_META } from "@/lib/constants";
import IdeaManageButtons from "./IdeaManageButtons";

export default function IdeaCard({ idea, makersById, canEdit = false, canDelete = false }) {
  const developers = (idea.developerIds || []).map((id) => makersById[id]?.name).filter(Boolean);
  const statusLabel = IDEA_STATUS_META[idea.status] || "아이디어";

  return (
    <article className="idea-card">
      <div className="idea-card__top">
        <span className={`status-badge status-badge--${idea.status}`}>{statusLabel}</span>
        <span className="category-chip" data-category={idea.category}>
          {idea.category}
        </span>
      </div>
      <h3 className="line-clamp-2">{idea.title}</h3>
      <p className="idea-card__description line-clamp-3">{idea.description}</p>
      {idea.status === "completed" && idea.programId ? (
        <p className="idea-card__link">
          <Link href={`/programs/${idea.programId}`}>완성된 프로그램 보기</Link>
        </p>
      ) : null}
      <div className="idea-card__meta">
        <span>제안자 {idea.author}</span>
        <span>공감 {idea.likes}</span>
      </div>
      <IdeaManageButtons ideaId={idea.id} canEdit={canEdit} canDelete={canDelete} />
      <div className="idea-card__developers">
        <span className="idea-card__developers-label">참여 개발자</span>
        <p>{developers.length ? developers.join(" · ") : "아직 참여한 제작자가 없어요."}</p>
      </div>
    </article>
  );
}
