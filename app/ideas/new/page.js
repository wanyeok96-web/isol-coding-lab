import IdeaForm from "../../../components/IdeaForm";
import { getLikeContext } from "../../../lib/likes";

export const metadata = {
  title: "아이디어 제안 | ISOL CODING LAB",
  description: "학교에서 필요한 프로그램 아이디어를 제안합니다.",
};

export default async function NewIdeaPage() {
  const { likeAccess } = await getLikeContext();
  const canWrite = likeAccess === "staff";

  return (
    <main id="main" className="page-shell">
      <section className="page-hero page-hero--simple">
        <div className="container page-hero__stack">
          <div>
            <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
            <h1>아이디어 제안하기</h1>
            <p className="page-lead">
              {canWrite
                ? "학교에서 반복되는 불편함을 알려 주세요. 다른 선생님이 프로그램으로 만들 수 있습니다."
                : "교직원으로 인증한 뒤에 아이디어를 제안할 수 있습니다."}
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container idea-form-wrap">
          <article className="surface-card">
            {canWrite ? (
              <IdeaForm />
            ) : (
              <>
                <h2>로그인이 필요합니다</h2>
                <p>
                  {likeAccess === "pending"
                    ? "교직원 인증을 마친 뒤에 아이디어를 남길 수 있습니다."
                    : "먼저 오른쪽 위 Google로 로그인해 주세요."}
                </p>
                <div className="form-actions">
                  <a className="btn btn--primary" href={likeAccess === "pending" ? "/join" : "/ideas"}>
                    {likeAccess === "pending" ? "교직원 인증하기" : "아이디어 목록으로"}
                  </a>
                </div>
              </>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
