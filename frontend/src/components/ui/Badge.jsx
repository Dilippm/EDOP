export default function Badge({ children }) {
  const tone = String(children).toLowerCase().replaceAll(' ', '-');

  return (
    <span className={`badge ${tone}`}>
      <i />
      {children}
    </span>
  );
}
