import { ShieldCheck } from 'lucide-react';
import { infrastructureJobs } from '../../../data/sampleData.js';
import Badge from '../../../components/ui/Badge.jsx';
import DataTable from '../../../components/ui/DataTable.jsx';
import PageTitle from '../../../components/ui/PageTitle.jsx';
import SampleHint from '../../../components/ui/SampleHint.jsx';

export default function InfrastructurePage({ title = 'Infrastructure' }) {
  return (
    <>
      <PageTitle eyebrow="PLATFORM / CLOUD" title={title} description="Request and review controlled infrastructure lifecycle operations." action={<button className="button primary" disabled>＋ Request plan</button>} />
      <SampleHint />
      <div className="notice caution"><span className="notice-icon"><ShieldCheck size={17} /></span><div><strong>Operations are not connected</strong><p>Plan, apply and destroy actions are disabled in this preview. Future operations will require authorization, review and an auditable approval.</p></div></div>
      <section className="panel"><div className="panel-heading"><div><h2>Infrastructure operations</h2><p>Illustrative operation history</p></div></div>
        <DataTable headers={['Environment', 'Operation', 'Status', 'Requested by', 'Updated']} rows={infrastructureJobs.map((job) => (
          <tr key={`${job.environment}-${job.operation}`}><td><strong>{job.environment}</strong></td><td>{job.operation}</td><td><Badge>{job.status}</Badge></td><td>{job.requestedBy}</td><td className="muted">{job.updated}</td></tr>
        ))} />
      </section>
      <div className="workflow-strip"><h3>Controlled lifecycle</h3><div className="workflow-steps">{['Select environment', 'Plan', 'Review', 'Approve', 'Apply', 'Verify'].map((step, index) => <div key={step}><b>{String(index + 1).padStart(2, '0')}</b><span>{step}</span></div>)}</div><p>Destroy uses a separate guarded workflow with explicit environment selection and confirmation.</p></div>
    </>
  );
}
