import Link from "next/link";
import MakerAvatar from "./MakerAvatar";

export default function MakerCard({ maker, programCount }) {
  return (
    <article className="maker-card">
      <Link className="maker-card__link" href={`/makers/${maker.id}`} aria-label={`${maker.name} 상세 보기`}>
        <div className="maker-card__avatar">
          <MakerAvatar maker={maker} />
        </div>
        <div className="maker-card__body">
          <h3>{maker.name}</h3>
          <p className="maker-card__subject">{maker.subject}</p>
          <p className="maker-card__bio line-clamp-3">{maker.bio}</p>
          <p className="maker-card__count">{programCount}개의 프로그램</p>
        </div>
      </Link>
    </article>
  );
}
