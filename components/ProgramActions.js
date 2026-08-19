import { hasOpenUrl } from "@/lib/format";
import LikeButton from "./LikeButton";
import ToastButton from "./ToastButton";

export default function ProgramActions({ program, likeAccess = "guest", liked = false }) {
  return (
    <div className="detail-actions">
      {hasOpenUrl(program.url) ? (
        <a className="btn btn--primary" href={program.url} target="_blank" rel="noopener noreferrer">
          프로그램 실행하기
        </a>
      ) : (
        <ToastButton className="btn btn--muted" message="아직 공개 링크가 준비되지 않았습니다.">
          프로그램 실행하기
        </ToastButton>
      )}
      {hasOpenUrl(program.github) ? (
        <a className="btn btn--secondary" href={program.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      ) : null}
      <LikeButton
        programId={program.id}
        likes={program.likes}
        liked={liked}
        likeAccess={likeAccess}
        variant="button"
      />
    </div>
  );
}
