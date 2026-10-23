export default function PanelHeading({ title, action, onClick, live = false }) {
  return (
    <div className="panel-heading">
      <h2>{title}</h2>
      {live ? (
        <span className="live-label"><i />Live</span>
      ) : (
        <button className="text-button" onClick={onClick}>
          {action} <span>→</span>
        </button>
      )}
    </div>
  );
}
