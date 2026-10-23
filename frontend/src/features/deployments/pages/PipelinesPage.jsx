import { useState } from 'react';
import { Search } from 'lucide-react';
import { pipelines } from '../../../data/sampleData.js';
import Badge from '../../../components/ui/Badge.jsx';
import DataTable from '../../../components/ui/DataTable.jsx';
import PageTitle from '../../../components/ui/PageTitle.jsx';
import SampleHint from '../../../components/ui/SampleHint.jsx';

function PipelineDetails({ pipeline, onBack }) {
  return (
    <div className="detail-grid">
      <section className="panel">
        <div className="panel-heading"><div><h2>{pipeline.name}</h2><p>{pipeline.repo} / {pipeline.branch} · <code>{pipeline.commit}</code></p></div><Badge>{pipeline.status}</Badge></div>
        <div className="run-summary"><div><small>Duration</small><strong>{pipeline.duration}</strong></div><div><small>Started</small><strong>{pipeline.ago}</strong></div><div><small>Trigger</small><strong>Push to {pipeline.branch}</strong></div></div>
        <h3 className="subhead">Jobs</h3>
        {['checkout', 'test', 'build'].map((job, index) => <div className="job-row" key={job}><span className={`job-check ${pipeline.status === 'Failed' && index === 2 ? 'failed' : ''}`}>{pipeline.status === 'Failed' && index === 2 ? '×' : '✓'}</span><strong>{job}</strong><span className="muted">{['12s', '1m 46s', '2m 03s'][index]}</span></div>)}
      </section>
      <aside className="panel"><button className="button secondary" onClick={onBack}>← All pipelines</button><h2>Run information</h2><p className="aside-copy">This is a static preview. Live logs and external run links will be available after the GitHub Actions integration is implemented.</p><div className="key-value"><span>Workflow</span><strong>{pipeline.name}</strong></div><div className="key-value"><span>Repository</span><strong>{pipeline.repo}</strong></div><div className="key-value"><span>Branch</span><strong>{pipeline.branch}</strong></div></aside>
    </div>
  );
}

export default function PipelinesPage() {
  const [selectedPipeline, setSelectedPipeline] = useState(null);

  return (
    <>
      <PageTitle eyebrow="DELIVERY / CI" title={selectedPipeline ? 'Pipeline details' : 'Pipelines'} description={selectedPipeline ? `Sample execution details for ${selectedPipeline.repo} · ${selectedPipeline.commit}` : 'Track continuous integration activity across your repositories.'} action={selectedPipeline && <button className="button secondary" onClick={() => setSelectedPipeline(null)}>← All pipelines</button>} />
      <SampleHint />
      {selectedPipeline ? <PipelineDetails pipeline={selectedPipeline} onBack={() => setSelectedPipeline(null)} /> : (
        <section className="panel">
          <div className="toolbar"><div className="searchbox"><Search size={16} /><input placeholder="Filter workflow runs" aria-label="Filter workflow runs" /></div><button className="button secondary">All statuses</button></div>
          <DataTable headers={['Workflow / commit', 'Repository', 'Branch', 'Status', 'Duration', 'Updated']} rows={pipelines.map((pipeline) => (
            <tr
              key={pipeline.commit}
              className="click-row"
              tabIndex={0}
              aria-label={`View ${pipeline.name} run for ${pipeline.repo}`}
              onClick={() => setSelectedPipeline(pipeline)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedPipeline(pipeline);
                }
              }}
            ><td><strong>{pipeline.name}</strong><small>{pipeline.commit}</small></td><td>{pipeline.repo}</td><td><code>{pipeline.branch}</code></td><td><Badge>{pipeline.status}</Badge></td><td>{pipeline.duration}</td><td className="muted">{pipeline.ago}</td></tr>
          ))} />
        </section>
      )}
    </>
  );
}
