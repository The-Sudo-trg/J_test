function MetricCard({ label, value, change, tone = "green", detail }) {
  return (
    <div className="metric-card">
      <small>{label}</small>
      <b>{value}</b>
      {change && <span className={tone}>{change}</span>}
      {detail && <p>{detail}</p>}
    </div>
  );
}
export default MetricCard;
