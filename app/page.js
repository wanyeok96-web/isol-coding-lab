import AuthBanner from "../components/AuthBanner";
import HomeHero from "../components/HomeHero";
import FeaturedPrograms from "../components/FeaturedPrograms";
import ProgramExplorer from "../components/ProgramExplorer";
import { getMakersById, getPublicPrograms } from "../lib/data";
import { getLikeContext } from "../lib/likes";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const programs = await getPublicPrograms();
  const featured = programs.filter((program) => program.featured).slice(0, 3);
  const makersById = await getMakersById();
  const { likeAccess, likedIds, userEmail, isAdmin } = await getLikeContext();

  return (
    <main id="main">
      <AuthBanner reason={params.auth} />
      {params.notice === "submitted" ? (
        <p className="auth-banner" role="status">
          프로그램이 등록되었습니다. 목록에서 확인해 주세요.
        </p>
      ) : null}
      {params.notice === "updated" ? (
        <p className="auth-banner" role="status">
          프로그램이 수정되었습니다.
        </p>
      ) : null}
      {params.notice === "deleted" ? (
        <p className="auth-banner" role="status">
          프로그램이 삭제되었습니다.
        </p>
      ) : null}
      <HomeHero likeAccess={likeAccess} />

      <section className="intro" aria-labelledby="intro-title">
        <div className="container">
          <h2 id="intro-title" className="sr-only">
            이코랩이 하는 일
          </h2>
          <div className="intro-grid">
            <article className="intro-card">
              <span className="intro-index">01</span>
              <h3>발견하고</h3>
              <p>학교 안에서 만들어진 유용한 도구를 찾아보세요.</p>
            </article>
            <article className="intro-card">
              <span className="intro-index">02</span>
              <h3>활용하고</h3>
              <p>필요한 프로그램을 자신의 수업과 업무에 활용하세요.</p>
            </article>
            <article className="intro-card">
              <span className="intro-index">03</span>
              <h3>함께 발전시키고</h3>
              <p>사용 후기와 아이디어를 나누며 더 좋은 도구로 발전시켜보세요.</p>
            </article>
          </div>
        </div>
      </section>

      <FeaturedPrograms programs={featured} makersById={makersById} likeAccess={likeAccess} likedIds={likedIds} />
      <ProgramExplorer programs={programs} makersById={makersById} likeAccess={likeAccess} likedIds={likedIds} />
    </main>
  );
}
