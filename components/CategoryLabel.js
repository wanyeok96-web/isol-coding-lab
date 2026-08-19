export default function CategoryLabel({ category, unit }) {
  if (!category) return null;

  return (
    <span className="category-meta">
      <span className="category-chip" data-category={category}>
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
