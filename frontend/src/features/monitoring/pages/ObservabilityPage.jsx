import { Activity, Boxes, Gauge } from 'lucide-react';
import { deployments } from '../../../data/sampleData.js';
import Badge from '../../../components/ui/Badge.jsx';
import DataTable from '../../../components/ui/DataTable.jsx';
import PageTitle from '../../../components/ui/PageTitle.jsx';
import SampleHint from '../../../components/ui/SampleHint.jsx';
import Metric from '../../../components/dashboard/Metric.jsx';

export default function ObservabilityPage() {
  return (
    <>
      <PageTitle eyebrow="PLATFORM / HEALTH" title="Observability" description="Inspect workload health and operational signals across environments." action={<button className="button secondary" disabled>Last 24 hours</button>} />
      <SampleHint />
      <div className="metrics two-metrics"><Metric icon={Gauge} label="Availability" value="99.94%" detail="Sample period · last 7 days" /><Metric icon={Activity} label="Error rate" value="0.18%" detail="Sample request telemetry" /><Metric icon={Activity} label="P95 latency" value="184 ms" detail="Sample request telemetry" /><Metric icon={Boxes} label="Restarts" value="02" detail="Across sample workloads" /></div>
      <section className="panel"><div className="panel-heading"><div><h2>Workload health</h2><p>Sample Kubernetes status</p></div></div>
        <DataTable headers={['Workload', 'Namespace', 'Ready', 'Restarts', 'Status']} rows={deployments.map((deployment, index) => (
          <tr key={deployment.service}><td><strong>{deployment.service}</strong></td><td>development</td><td>{index === 2 ? '1 / 2' : '2 / 2'}</td><td>{index === 2 ? '2' : '0'}</td><td><Badge>{deployment.status}</Badge></td></tr>
        ))} />
      </section>
      <div className="callout muted-callout"><Activity size={18} /><div><strong>Signals are illustrative</strong><p>Metrics, logs, traces and Kubernetes events will be connected in a later phase. No live telemetry is shown.</p></div></div>
    </>
  );
}
