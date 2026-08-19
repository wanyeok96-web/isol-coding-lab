import ProgramForm from "../../../../components/ProgramForm";
import { getMakersById, getProgramById } from "../../../../lib/data";
import { getLikeContext } from "../../../../lib/likes";
import { normalizeEmail } from "../../../../lib/staff";

export const metadata = {
  title: "프로그램 수정 | ISOL CODING LAB",
  description: "등록한 프로그램 정보를 수정합니다.",
};

export default async function EditProgramPage({ params }) {
  const { id } = await params;
  const program = await getProgramById(id);
  const makersById = await getMakersById();
  const { userEmail, likeAccess } = await getLikeContext();
  const isOwner =
    program &&
    program.ownerEmail &&
    normalizeEmail(program.ownerEmail) === normalizeEmail(userEmail) &&
    likeAccess === "staff";
  const maker = program ? (program.makerIds || []).map((makerId) => makersById[makerId]).find(Boolean) : null;

  return (
    <main id="main" className="page-shell">
      <section className="page-hero page-hero--simple">
        <div className="container page-hero__stack">
          <div>
            <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
            <h1>프로그램 수정</h1>
            <p className="page-lead">
              {isOwner ? "설명, 링크, 공개 범위를 고친 뒤 저장하세요." : "작성자만 이 프로그램을 수정할 수 있습니다."}
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container idea-form-wrap">
          <article className="surface-card">
            {!program ? (
              <>
                <h2>프로그램을 찾을 수 없습니다</h2>
                <div className="form-actions">
                  <a className="btn btn--primary" href="/">
                    프로그램 목록으로
                  </a>
                </div>
              </>
            ) : isOwner ? (
              <ProgramForm program={program} maker={maker} />
            ) : (
              <>
                <h2>수정 권한이 없습니다</h2>
                <p>본인이 등록한 프로그램만 고칠 수 있습니다.</p>
                <div className="form-actions">
                  <a className="btn btn--primary" href="/">
                    프로그램 목록으로
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
