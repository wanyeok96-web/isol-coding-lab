import Link from "next/link";
import ErrorState from "../../../components/ErrorState";
import ProgramDetail from "../../../components/ProgramDetail";
import { getMakersById, getProgramById, getRelatedPrograms } from "../../../lib/data";
import { getLikeContext } from "../../../lib/likes";
import { getProgramComments } from "../../../lib/comments";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const program = await getProgramById(id);

  if (!program) {
    return { title: "프로그램 | ISOL CODING LAB" };
  }

  return {
    title: `${program.title} | ISOL CODING LAB`,
    description: program.subtitle || program.description,
  };
}

export default async function ProgramPage({ params }) {
  const { id } = await params;
  const program = await getProgramById(id);
  const makersById = await getMakersById();
  const relatedPrograms = program ? await getRelatedPrograms(program) : [];
  const { likeAccess, likedIds, userEmail, isAdmin } = await getLikeContext();
  const comments = program ? await getProgramComments(program.id) : [];

  return (
    <main id="main" className="page-shell">
      <div className="container">
        {program ? (
          <ProgramDetail
            program={program}
            makers={(program.makerIds || []).map((makerId) => makersById[makerId]).filter(Boolean)}
            relatedPrograms={relatedPrograms}
            makersById={makersById}
            likeAccess={likeAccess}
            likedIds={likedIds}
            comments={comments}
            userEmail={userEmail}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="detail-root">
            <ErrorState title="프로그램을 찾을 수 없어요." description="삭제되었거나 잘못된 주소일 수 있습니다.">
              <div className="form-actions">
                <Link className="btn btn--primary" href="/#programs">
                  프로그램 목록으로
                </Link>
              </div>
            </ErrorState>
          </div>
        )}
      </div>
    </main>
  );
}
