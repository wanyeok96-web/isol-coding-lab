import { getCategoryEmoji } from "../lib/constants";

export default function CategoryLabel({ category, unit }) {
  if (!category) return null;

  const emoji = getCategoryEmoji(category);

  return (
    <span className="category-meta">
      <span className="category-chip" data-category={category}>
        {emoji ? (
          <span className="category-chip__emoji" aria-hidden="true">
            {emoji}
          </span>
        ) : null}
        {category}
      </span>
      {unit ? (
        <span className="unit-chip" data-category={category}>
          {unit}
        </span>
      ) : null}
    </span>
  );
}
