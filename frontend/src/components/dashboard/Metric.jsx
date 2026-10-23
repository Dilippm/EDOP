export default function Metric({ icon: Icon, label, value, detail, trend, healthy }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className="metric-icon"><Icon size={17} /></span>
        <span>{label}</span>
      </div>
      <div className={`metric-value ${healthy ? 'healthy-text' : ''}`}>
        {value}{trend && <em>{trend}</em>}
      </div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}
