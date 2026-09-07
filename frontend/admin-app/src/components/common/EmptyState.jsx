function EmptyState({ icon = "🧺", title, body, action }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  );
}
export default EmptyState;
