import { getThumbnailLabel } from "@/lib/format";

export default function ProgramThumbnail({ program, large = false }) {
  const label = getThumbnailLabel(program.title || "");

  return (
    <>
      {program.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={program.thumbnail} alt={`${program.title} 썸네일`} />
      ) : null}
      <div className={`thumb-fallback${large ? " thumb-fallback--large" : ""}`}>
        <div className="thumb-fallback__mark">
          <span className="thumb-fallback__initials">{label}</span>
          <span className="thumb-fallback__category">{program.unit || program.category}</span>
        </div>
      </div>
    </>
  );
}
