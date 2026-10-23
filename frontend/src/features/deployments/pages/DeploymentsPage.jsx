import { ChevronDown, Package } from 'lucide-react';
import { deployments } from '../../../data/sampleData.js';
import Badge from '../../../components/ui/Badge.jsx';
import DataTable from '../../../components/ui/DataTable.jsx';
import PageTitle from '../../../components/ui/PageTitle.jsx';
import SampleHint from '../../../components/ui/SampleHint.jsx';

export default function DeploymentsPage() {
  return (
    <>
      <PageTitle eyebrow="DELIVERY / RUNTIME" title="Deployments" description="Review application versions and rollout health by environment." action={<button className="button primary" disabled>＋ New deployment</button>} />
      <SampleHint />
      <section className="panel"><div className="panel-heading"><div><h2>Application releases</h2><p>Versions currently represented in sample environments</p></div><button className="button secondary">All environments <ChevronDown size={15} /></button></div>
        <DataTable headers={['Service', 'Version', 'Environment', 'Status', 'Last updated']} rows={deployments.map((deployment) => (
          <tr key={deployment.service}><td><strong>{deployment.service}</strong></td><td><code>{deployment.version}</code></td><td>{deployment.environment}</td><td><Badge>{deployment.status}</Badge></td><td className="muted">{deployment.updated}</td></tr>
        ))} />
      </section>
      <div className="callout"><Package size={18} /><div><strong>Application release workflow</strong><p>Code push → CI → image build → GitOps update → rollout health check. Infrastructure remains managed by its separate lifecycle workflow.</p></div></div>
    </>
  );
}
