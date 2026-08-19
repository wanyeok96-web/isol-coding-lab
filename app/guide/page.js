import EmptyState from "../../components/EmptyState";
import GuideCard from "../../components/GuideCard";
import { getGuides } from "../../lib/data";

export const metadata = {
  title: "가이드 | ISOL CODING LAB",
  description: "아이디어만 있으면 나만의 도구를 만들고, 깃허브 링크로 나눠 쓰는 기초 순서를 안내합니다.",
};

export default async function GuidePage() {
  const guides = (await getGuides()).filter((guide) => guide.level !== "advanced");

  return (
    <main id="main" className="page-shell">
      <section className="page-hero guide-hero">
        <div className="container">
          <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
          <p className="guide-level-tag">기초</p>
          <h1>아이디어만 있으면 나만의 도구를 만들 수 있습니다.</h1>
          <p className="page-lead">
            컴퓨터 언어를 몰라도 됩니다. 대화로 설계하고, 폴더에서 만들고, 깃허브 링크로 나눠 보세요.
          </p>
          <ol className="guide-path" aria-label="기초 순서">
            {guides.map((guide) => (
              <li key={guide.id}>
                <span>{String(guide.order).padStart(2, "0")}</span>
                {guide.title}
              </li>
            ))}
          </ol>
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
