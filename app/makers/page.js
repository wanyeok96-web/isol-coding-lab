import EmptyState from "../../components/EmptyState";
import MakerCard from "../../components/MakerCard";
import { getMakersForList } from "../../lib/data";

export const metadata = {
  title: "제작자 | ISOL CODING LAB",
  description: "학교의 작은 불편함을 새로운 도구로 바꾸고 있는 이솔고 선생님들을 만나보세요.",
};

export default async function MakersPage() {
  const makers = await getMakersForList();

  return (
    <main id="main" className="page-shell">
      <section className="page-hero page-hero--simple">
        <div className="container">
          <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
          <h1>이코랩을 만드는 사람들</h1>
          <p className="page-lead">학교의 작은 불편함을 새로운 도구로 바꾸고 있는 선생님들을 만나보세요.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="makers-grid">
            {makers.length ? (
              makers.map((maker) => (
                <MakerCard key={maker.id} maker={maker} programCount={maker.programCount} />
              ))
            ) : (
              <EmptyState
                title="아직 등록된 제작자가 없어요."
                description="교직원으로 인증하면 이름이 여기에 나타납니다."
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
