import EmptyState from "../../components/EmptyState";
import GuideCard from "../../components/GuideCard";
import { getGuides } from "../../lib/data";

export const metadata = {
  title: "Vibe Guide | ISOL CODING LAB",
  description: "코드를 몰라도 AI와 함께 학교에 필요한 도구를 만들어볼 수 있습니다.",
};

export default async function GuidePage() {
  const guides = await getGuides();

  return (
    <main id="main" className="page-shell">
      <section className="page-hero guide-hero">
        <div className="container guide-hero__inner">
          <div>
            <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
            <h1>
              처음이어도 괜찮아요.
              <br />
              아이디어부터 시작해보세요.
            </h1>
            <p className="page-lead">코드를 몰라도 AI와 함께 학교에 필요한 도구를 만들어볼 수 있습니다.</p>
          </div>
          <div className="guide-hero__panel">
            <p className="guide-hero__label">시작하기</p>
            <ul className="guide-nav">
              {guides.length ? (
                guides.map((guide) => (
                  <li key={guide.id}>
                    <a href={`#${guide.id}`}>
                      <strong>
                        {String(guide.order).padStart(2, "0")} {guide.title}
                      </strong>
                      <span>{guide.subtitle}</span>
                    </a>
                  </li>
                ))
              ) : (
                <li>가이드 준비 중</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="guide-grid">
            {guides.length ? (
              guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)
            ) : (
              <EmptyState title="아직 등록된 가이드가 없어요." description="다음 업데이트에서 가이드 콘텐츠를 추가할 예정입니다." />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
