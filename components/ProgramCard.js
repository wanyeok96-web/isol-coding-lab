import Link from "next/link";
import { getMakerNames, hasOpenUrl } from "@/lib/format";
import CategoryLabel from "./CategoryLabel";
import LikeButton from "./LikeButton";

export default function ProgramCard({ program, makersById, compact = false, likeAccess = "guest", liked = false }) {
  const makerNames = getMakerNames(program.makerIds, makersById) || "제작자 미정";
  const likes = Number.isFinite(program.likes) ? program.likes : 0;
  const tags = (program.tags || []).slice(0, compact ? 2 : 3);

  return (
    <article className={`program-card${compact ? " program-card--compact" : ""}`}>
      <Link className="card-link" href={`/programs/${program.id}`} aria-label={`${program.title} 상세 보기`}>
        <div className="program-card__body">
          <CategoryLabel category={program.category} unit={program.unit} />
          <h3>{program.title}</h3>
          {program.subtitle ? <p className="program-card__subtitle">{program.subtitle}</p> : null}
          {tags.length ? (
            <ul className="tag-list">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </Link>
      <div className="program-card__footer">
        <p className="maker-names">{makerNames}</p>
        <div className="card-actions">
          <LikeButton programId={program.id} likes={likes} liked={liked} likeAccess={likeAccess} />
          {hasOpenUrl(program.url) ? (
            <a className="open-link" href={program.url} target="_blank" rel="noopener noreferrer">
              실행
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
