import { GUIDE_ICON_META } from "@/lib/constants";

export default function GuideCard({ guide }) {
  const icon = GUIDE_ICON_META[guide.id] || String(guide.order).padStart(2, "0");
  const paragraphs = String(guide.description || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <article className="guide-chapter" id={guide.id}>
      <div className="guide-chapter__index">{icon}</div>
      <div className="guide-chapter__body">
        <h2>{guide.title}</h2>
        <p className="guide-card__subtitle">{guide.subtitle}</p>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="guide-card__description">
            {paragraph}
          </p>
        ))}

        {guide.points?.length ? (
          <ol className="guide-points">
            {guide.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        ) : null}

        {guide.tools?.length ? (
          <div className="guide-tool-grid">
            {guide.tools.map((tool) => (
              <article className="guide-tool" key={tool.id}>
                <h3>{tool.name}</h3>
                <p className="guide-tool__subtitle">{tool.subtitle}</p>
                <p>{tool.description}</p>
                {tool.howto ? <p className="guide-tool__howto">{tool.howto}</p> : null}
              </article>
            ))}
          </div>
        ) : null}

        {guide.note ? <p className="guide-note">{guide.note}</p> : null}
      </div>
    </article>
  );
}
