export default function DataTable({ headers, rows, className = '' }) {
  return (
    <div className={`table-wrap ${className}`.trim()}>
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
