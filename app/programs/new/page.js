import ProgramForm from "../../../components/ProgramForm";
import { getLikeContext } from "../../../lib/likes";

export const metadata = {
  title: "프로그램 등록 | ISOL CODING LAB",
  description: "이솔고에서 만든 디지털 도구를 이코랩에 등록합니다.",
};

export default async function NewProgramPage() {
  const { likeAccess, userEmail } = await getLikeContext();
  const canWrite = likeAccess === "staff";
  const defaultMakerName = String(userEmail || "").split("@")[0];

  return (
    <main id="main" className="page-shell">
      <section className="page-hero page-hero--simple">
        <div className="container page-hero__stack">
          <div>
            <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
            <h1>프로그램 등록하기</h1>
            <p className="page-lead">
              {canWrite
                ? "선생님들이 바로 찾아 쓸 수 있도록, 만든 도구의 이름과 설명을 남겨 주세요."
                : "교직원으로 인증한 뒤에 프로그램을 등록할 수 있습니다."}
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container idea-form-wrap">
          <article className="surface-card">
            {canWrite ? (
              <ProgramForm defaultMakerName={defaultMakerName} />
            ) : (
              <>
                <h2>로그인이 필요합니다</h2>
                <p>
                  {likeAccess === "pending"
                    ? "교직원 인증을 마친 뒤에 프로그램을 등록할 수 있습니다."
                    : "먼저 오른쪽 위 Google로 로그인해 주세요."}
                </p>
                <div className="form-actions">
                  <a className="btn btn--primary" href={likeAccess === "pending" ? "/join" : "/"}>
                    {likeAccess === "pending" ? "교직원 인증하기" : "프로그램 목록으로"}
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
