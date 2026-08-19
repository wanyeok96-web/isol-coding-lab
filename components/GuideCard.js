import { GUIDE_ICON_META } from "@/lib/constants";

export default function GuideCard({ guide }) {
  const icon = GUIDE_ICON_META[guide.id] || String(guide.order).padStart(2, "0");

  return (
    <article className="guide-card" id={guide.id}>
      <div className="guide-card__index">{icon}</div>
      <div className="guide-card__body">
        <h3>{guide.title}</h3>
        <p className="guide-card__subtitle">{guide.subtitle}</p>
        <p className="guide-card__description">{guide.description}</p>
      </div>
    </article>
  );
}
