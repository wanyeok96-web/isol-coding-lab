export default function ErrorState({ title, description, children }) {
  return (
    <div className="error-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
