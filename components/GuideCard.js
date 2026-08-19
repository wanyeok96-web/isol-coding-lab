import CopyPromptButton from "./CopyPromptButton";
import GithubGuidePanel from "./GithubGuidePanel";

export default function GuideCard({ guide }) {
  const icon = String(guide.order).padStart(2, "0");
  const paragraphs = guide.paragraphs || (guide.description ? [guide.description] : []);

  return (
    <article className="guide-chapter guide-chapter--basic" id={guide.id}>
      <div className="guide-chapter__index">{icon}</div>
      <div className="guide-chapter__body">
        <p className="guide-level-tag">기초</p>
        <h2>{guide.title}</h2>
        {guide.subtitle ? <p className="guide-card__subtitle">{guide.subtitle}</p> : null}
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="guide-card__description">
            {paragraph}
          </p>
        ))}

        {guide.copyPrompt ? <CopyPromptButton text={guide.copyPrompt} /> : null}

        {guide.points?.length ? (
          <ol className="guide-points">
            {guide.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        ) : null}

        {guide.githubSteps?.length ? <GithubGuidePanel steps={guide.githubSteps} /> : null}
      </div>
    </article>
  );
}
