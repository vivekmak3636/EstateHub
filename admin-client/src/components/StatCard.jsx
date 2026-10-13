
function StatCard({ title, value, description, icon, color = "navy" }) {
  return (
    <article className="ad-stat-card">
      <div className="ad-stat-top">
        <span>{title}</span>
        <span className={`ad-stat-icon ${color}`}>{icon}</span>
      </div>

      <strong>
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value ?? "—"}
      </strong>

      <p>{description}</p>
    </article>
  );
}

export default StatCard;