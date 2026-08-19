import ProgramCard from "./ProgramCard";

export default function FeaturedPrograms({ programs, makersById, likeAccess = "guest", likedIds = [] }) {
  if (!programs.length) return null;

  return (
    <section className="featured" id="featured" aria-labelledby="featured-title">
      <div className="container">
        <div className="section-heading">
          <h2 id="featured-title">이코랩에서 먼저 만나볼 도구</h2>
        </div>
        <div className="featured-grid">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              makersById={makersById}
              compact
              likeAccess={likeAccess}
              liked={likedIds.includes(program.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
