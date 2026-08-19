import IdeaForm from "../../../../components/IdeaForm";
import { getIdeaById } from "../../../../lib/data";
import { getLikeContext } from "../../../../lib/likes";
import { normalizeEmail } from "../../../../lib/staff";

export const metadata = {
  title: "아이디어 수정 | ISOL CODING LAB",
  description: "제안한 아이디어를 수정합니다.",
};

export default async function EditIdeaPage({ params }) {
  const { id } = await params;
  const idea = await getIdeaById(id);
  const { userEmail, likeAccess } = await getLikeContext();
  const isOwner =
    idea &&
    idea.authorEmail &&
    normalizeEmail(idea.authorEmail) === normalizeEmail(userEmail) &&
    likeAccess === "staff";

  return (
    <main id="main" className="page-shell">
      <section className="page-hero page-hero--simple">
        <div className="container page-hero__stack">
          <div>
            <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
            <h1>아이디어 수정</h1>
            <p className="page-lead">
              {isOwner ? "제목, 카테고리, 설명을 고친 뒤 저장하세요." : "작성자만 이 아이디어를 수정할 수 있습니다."}
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container idea-form-wrap">
          <article className="surface-card">
            {!idea ? (
              <>
                <h2>아이디어를 찾을 수 없습니다</h2>
                <div className="form-actions">
                  <a className="btn btn--primary" href="/ideas">
                    아이디어 목록으로
                  </a>
                </div>
              </>
            ) : isOwner ? (
              <IdeaForm idea={idea} />
            ) : (
              <>
                <h2>수정 권한이 없습니다</h2>
                <p>본인이 올린 아이디어만 고칠 수 있습니다.</p>
                <div className="form-actions">
                  <a className="btn btn--primary" href="/ideas">
                    아이디어 목록으로
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
