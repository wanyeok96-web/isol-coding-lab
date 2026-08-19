import Link from "next/link";
import EmptyState from "../../../components/EmptyState";
import ErrorState from "../../../components/ErrorState";
import MakerAvatar from "../../../components/MakerAvatar";
import ProgramCard from "../../../components/ProgramCard";
import { getMakerById, getMakersById, getProgramsByMaker } from "../../../lib/data";
import { getLikeContext } from "../../../lib/likes";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const maker = await getMakerById(id);

  if (!maker) {
    return { title: "제작자 | ISOL CODING LAB" };
  }

  return {
    title: `${maker.name} | ISOL CODING LAB`,
    description: `${maker.subject} · ${maker.bio}`,
  };
}

export default async function MakerPage({ params }) {
  const { id } = await params;
  const maker = await getMakerById(id);
  const makersById = await getMakersById();
  const makerPrograms = maker ? await getProgramsByMaker(maker.id) : [];
  const { likeAccess, likedIds } = await getLikeContext();

  return (
    <main id="main" className="page-shell">
      <div className="container">
        <div className="detail-root">
          {maker ? (
            <>
              <nav className="breadcrumb" aria-label="경로">
                <Link href="/makers">제작자</Link>
                <span>/</span>
                <span>{maker.name}</span>
              </nav>

              <section className="maker-hero">
                <div className="maker-hero__avatar">
                  <MakerAvatar maker={maker} large />
                </div>
                <div className="maker-hero__copy">
                  <p className="hero-eyebrow">ISOL CODING LAB · 제작자</p>
                  <h1>{maker.name}</h1>
                  <p className="maker-hero__subject">{maker.subject}</p>
                  <p className="maker-hero__count">{makerPrograms.length}개의 프로그램</p>
                  <p className="page-lead">{maker.bio}</p>
                </div>
              </section>

              <section className="page-section page-section--detail">
                <div className="section-heading">
                  <h2>{makerPrograms.length}개의 프로그램을 만들었습니다.</h2>
                  <p>개인 제작과 공동 제작 프로그램을 모두 포함해 보여줍니다.</p>
                </div>
                <div className="program-grid program-grid--detail">
                  {makerPrograms.length ? (
                    makerPrograms.map((program) => (
                      <ProgramCard
                        key={program.id}
                        program={program}
                        makersById={makersById}
                        likeAccess={likeAccess}
                        liked={likedIds.includes(program.id)}
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="아직 공개된 프로그램이 없어요."
                      description="다음 업데이트에서 더 많은 작업을 소개할 예정입니다."
                    />
                  )}
                </div>
              </section>
            </>
          ) : (
            <ErrorState title="제작자를 찾을 수 없어요." description="삭제되었거나 잘못된 주소일 수 있습니다.">
              <div className="form-actions">
                <Link className="btn btn--primary" href="/makers">
                  제작자 목록으로
                </Link>
              </div>
            </ErrorState>
          )}
        </div>
      </div>
    </main>
  );
}
