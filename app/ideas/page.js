import EmptyState from "../../components/EmptyState";
import IdeaCard from "../../components/IdeaCard";
import IdeaSubmitButton from "../../components/IdeaSubmitButton";
import { getIdeas, getMakersById } from "../../lib/data";
import { getLikeContext } from "../../lib/likes";

export const metadata = {
  title: "아이디어 | ISOL CODING LAB",
  description: "학교에서 반복되는 불편함이나 디지털 도구로 해결해보고 싶은 아이디어를 발견해보세요.",
};

export default async function IdeasPage({ searchParams }) {
  const params = await searchParams;
  const ideas = await getIdeas();
  const makersById = await getMakersById();
  const { likeAccess, userEmail, isAdmin } = await getLikeContext();
  const normalizedEmail = String(userEmail || "").trim().toLowerCase();

  return (
    <main id="main" className="page-shell">
      <section className="page-hero page-hero--simple">
        <div className="container page-hero__stack">
          <div>
            <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
            <h1>이런 프로그램 만들어주세요</h1>
            <p className="page-lead">
              학교에서 반복되는 불편함이나 디지털 도구로 해결해보고 싶은 아이디어를 발견해보세요.
            </p>
          </div>
          <IdeaSubmitButton likeAccess={likeAccess} />
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          {params.submitted === "1" ? (
            <p className="join-notice" role="status">
              아이디어가 등록되었습니다. 목록에서 확인해 주세요.
            </p>
          ) : null}
          {params.updated === "1" ? (
            <p className="join-notice" role="status">
              아이디어가 수정되었습니다.
            </p>
          ) : null}
          {params.deleted === "1" ? (
            <p className="join-notice" role="status">
              아이디어가 삭제되었습니다.
            </p>
          ) : null}
          <div className="ideas-grid">
            {ideas.length ? (
              ideas.map((idea) => {
                const isOwner = Boolean(idea.authorEmail) && idea.authorEmail.toLowerCase() === normalizedEmail;
                return (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    makersById={makersById}
                    canEdit={isOwner}
                    canDelete={isOwner || isAdmin}
                  />
                );
              })
            ) : (
              <EmptyState
                title="아직 등록된 아이디어가 없어요."
                description="첫 아이디어를 제안해 보세요."
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
