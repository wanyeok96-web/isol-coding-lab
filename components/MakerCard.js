import Link from "next/link";
import MakerAvatar from "./MakerAvatar";

export default function MakerCard({ maker, programCount }) {
  const inner = (
    <>
      <div className="maker-card__avatar">
        <MakerAvatar maker={maker} />
      </div>
      <div className="maker-card__body">
        <h3>{maker.name}</h3>
        <p className="maker-card__subject">이솔고등학교 교직원</p>
        <p className="maker-card__count">{programCount}개의 프로그램</p>
      </div>
    </>
  );

  return (
    <article className="maker-card">
      {maker.id ? (
        <Link className="maker-card__link" href={`/makers/${maker.id}`} aria-label={`${maker.name} 상세 보기`}>
          {inner}
        </Link>
      ) : (
        <div className="maker-card__link">{inner}</div>
      )}
    </article>
  );
}
