export default function HealthRing({ value, label, detail, tone }) {
  return (
    <div className="health-ring-item">
      <div className={`health-ring ${tone}`}><span>{value}</span></div>
      <strong>{label}</strong>
      <small>{detail}</small>
    </div>
  );
}
