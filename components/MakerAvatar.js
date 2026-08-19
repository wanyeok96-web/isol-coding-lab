export default function MakerAvatar({ maker, large = false }) {
  const sizeClass = large ? " avatar-fallback--large" : "";
  const imageClass = large ? " avatar-image avatar-image--large" : "avatar-image";

  if (maker.profileImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={imageClass} src={maker.profileImage} alt={`${maker.name} 프로필 이미지`} />
    );
  }

  return (
    <div className={`avatar-fallback${sizeClass}`}>
      <span>{maker.name?.slice(0, 1) || "?"}</span>
    </div>
  );
}
