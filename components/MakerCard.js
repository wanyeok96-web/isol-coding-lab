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
          <p className="maker-card__subject">{maker.subject || "이솔고등학교 교직원"}</p>
          <p className="maker-card__bio line-clamp-3">
            {maker.bio || "이솔고등학교에서 수업과 업무 도구를 만들고 있습니다."}
          </p>
          <p className="maker-card__count">{programCount}개의 프로그램</p>
        </div>
      </Link>
    </article>
  );
}
