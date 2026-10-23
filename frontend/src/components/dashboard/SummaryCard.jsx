import { ChevronDown } from 'lucide-react';

export default function SummaryCard({ icon: Icon, label, value, delta, detail, tone, onClick }) {
  return (
    <button className="summary-card" onClick={onClick}>
      <span className={`summary-icon ${tone}`}><Icon size={24} /></span>
      <span className="summary-copy">
        <span>{label}</span>
        <strong>{value} {delta && <em>{delta}</em>}</strong>
        <small>{detail}</small>
      </span>
      <ChevronDown className="summary-arrow" size={17} />
    </button>
  );
}
