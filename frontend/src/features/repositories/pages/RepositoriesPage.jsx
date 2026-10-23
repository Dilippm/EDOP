import { ChevronDown, Search } from 'lucide-react';
import { repositories } from '../../../data/sampleData.js';
import Badge from '../../../components/ui/Badge.jsx';
import DataTable from '../../../components/ui/DataTable.jsx';
import PageTitle from '../../../components/ui/PageTitle.jsx';
import SampleHint from '../../../components/ui/SampleHint.jsx';

export default function RepositoriesPage() {
  return (
    <>
      <PageTitle eyebrow="CATALOG / SOURCE" title="Repositories" description="Browse the source repositories registered with your platform." action={<button className="button primary" disabled>＋ Add repository</button>} />
      <SampleHint />
      <section className="panel">
        <div className="toolbar"><div className="searchbox"><Search size={16} /><input aria-label="Search repositories" placeholder="Search repositories" /></div><button className="button secondary">All repositories <ChevronDown size={15} /></button></div>
        <DataTable headers={['Repository', 'Language', 'Default branch', 'Health', '']} rows={repositories.map((repository) => (
          <tr key={repository.name}><td><strong>{repository.name}</strong><small>{repository.description}</small></td><td>{repository.language}</td><td><code>{repository.branch}</code></td><td><Badge>{repository.status}</Badge></td><td className="row-arrow">↗</td></tr>
        ))} />
      </section>
    </>
  );
}
