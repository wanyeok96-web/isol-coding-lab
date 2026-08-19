import EmptyState from "../../components/EmptyState";
import GuideCard from "../../components/GuideCard";
import { getGuides } from "../../lib/data";

export const metadata = {
  title: "바이브 가이드 | ISOL CODING LAB",
  description: "바이브코딩이 무엇인지부터, 도구로 만들고 GitHub에 올리기까지 순서대로 안내합니다.",
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
              바이브코딩,
              <br />
              이 순서면 시작할 수 있습니다.
            </h1>
            <p className="page-lead">
              코드를 몰라도 됩니다. 불편함을 말로 설명하고, 도구로 만들고, GitHub에 올리면 학교 도구가 됩니다.
            </p>
            <ol className="guide-path" aria-label="바이브코딩 순서">
              <li>
                <span>01</span>
                이해하기
              </li>
              <li>
                <span>02</span>
                도구로 만들기
              </li>
              <li>
                <span>03</span>
                GitHub에 올리기
              </li>
            </ol>
          </div>
          <div className="guide-hero__panel">
            <p className="guide-hero__label">이 페이지의 순서</p>
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
