import { Activity, Bell, Boxes, Cloud, GitBranch, Package, ShieldCheck, Workflow, ChevronDown } from 'lucide-react';
import Badge from '../../../components/ui/Badge.jsx';
import DataTable from '../../../components/ui/DataTable.jsx';
import HealthRing from '../../../components/dashboard/HealthRing.jsx';
import PanelHeading from '../../../components/dashboard/PanelHeading.jsx';
import SummaryCard from '../../../components/dashboard/SummaryCard.jsx';

function SystemHealthPanel() {
  return (
    <section className="panel health-panel">
      <PanelHeading title="System Health" live />
      <div className="health-rings">
        <HealthRing value="92%" label="Cluster Health" detail="11/12 pods ready" tone="green" />
        <HealthRing value="78%" label="CPU Usage" detail="3.1 / 4 cores" tone="blue" />
        <HealthRing value="64%" label="Memory Usage" detail="5.2 / 8 GB" tone="orange" />
      </div>
      <div className="chart">
        <div className="chart-axis"><span>100%</span><span>50%</span><span>0%</span></div>
        <svg viewBox="0 0 500 105" preserveAspectRatio="none" role="img" aria-label="Sample CPU and memory usage chart">
          <path className="cpu-fill" d="M0 58 L25 65 L48 53 L72 55 L96 45 L120 49 L145 41 L170 48 L195 44 L220 52 L245 47 L270 55 L295 44 L320 48 L345 53 L370 45 L395 51 L420 43 L445 48 L470 40 L500 49 L500 105 L0 105 Z" />
          <path className="cpu-line" d="M0 58 L25 65 L48 53 L72 55 L96 45 L120 49 L145 41 L170 48 L195 44 L220 52 L245 47 L270 55 L295 44 L320 48 L345 53 L370 45 L395 51 L420 43 L445 48 L470 40 L500 49" />
          <path className="mem-fill" d="M0 83 L25 88 L48 84 L72 86 L96 80 L120 85 L145 78 L170 83 L195 76 L220 81 L245 75 L270 81 L295 72 L320 78 L345 74 L370 77 L395 70 L420 76 L445 69 L470 75 L500 72 L500 105 L0 105 Z" />
          <path className="mem-line" d="M0 83 L25 88 L48 84 L72 86 L96 80 L120 85 L145 78 L170 83 L195 76 L220 81 L245 75 L270 81 L295 72 L320 78 L345 74 L370 77 L395 70 L420 76 L445 69 L470 75 L500 72" />
        </svg>
        <div className="chart-times"><span>12:00</span><span>16:00</span><span>20:00</span><span>00:00</span><span>04:00</span><span>08:00</span></div>
        <div className="chart-legend"><span><i className="cpu-dot" />CPU</span><span><i className="mem-dot" />Memory</span></div>
      </div>
    </section>
  );
}

function PipelineRunsPanel({ onViewAll }) {
  const runs = [
    ['rag-chatbot', 'CI/CD Pipeline', 'main', 'Succeeded', '6m 42s', '5 min ago'],
    ['frontend', 'Build and Test', 'main', 'Succeeded', '4m 12s', '12 min ago'],
    ['infrastructure', 'Terraform Plan', 'dev', 'Running', '3m 21s', '—'],
    ['api-service', 'Security Scan', 'main', 'Failed', '8m 11s', '28 min ago'],
    ['monitoring', 'Build and Push', 'main', 'Succeeded', '5m 33s', '1 hour ago'],
  ];

  return (
    <section className="panel dashboard-panel">
      <PanelHeading title="Recent Pipeline Runs" action="View all" onClick={onViewAll} />
      <DataTable headers={['Repository', 'Workflow', 'Branch', 'Status', 'Duration', 'Finished']} rows={runs.map((run) => (
        <tr key={run[0]}>
          <td><span className="repo-cell"><GitBranch size={15} />{run[0]}</span></td><td>{run[1]}</td><td>{run[2]}</td>
          <td><Badge>{run[3]}</Badge></td><td>{run[4]}</td><td className="muted">{run[5]}</td>
        </tr>
      ))} />
    </section>
  );
}

function DeploymentsPanel({ onViewAll }) {
  const deployments = [
    ['rag-chatbot', 'dev', 'v1.2.3', 'Healthy', '12 min ago'],
    ['frontend', 'dev', 'v2.0.1', 'Deploying', '28 min ago'],
    ['api-service', 'staging', 'v1.0.5', 'Healthy', '2 hours ago'],
    ['monitoring', 'prod', 'v1.3.0', 'Healthy', '5 hours ago'],
  ];

  return (
    <section className="panel dashboard-panel">
      <PanelHeading title="Recent Deployments" action="View all" onClick={onViewAll} />
      <DataTable headers={['Application', 'Environment', 'Version', 'Status', 'Updated', '']} rows={deployments.map((row) => (
        <tr key={row[0]}><td><span className="repo-cell"><GitBranch size={15} />{row[0]}</span></td><td>{row[1]}</td><td>{row[2]}</td><td><Badge>{row[3]}</Badge></td><td className="muted">{row[4]}</td><td>⋮</td></tr>
      ))} />
    </section>
  );
}

function InfrastructurePanel({ onViewAll }) {
  const environments = [
    ['aws-dev', 'aws', 'Running', '12 resources', '~$18/day'],
    ['aws-test', 'aws', 'Stopped', '0 resources', '$0'],
    ['local', 'local', 'Running', 'N/A', '$0'],
  ];

  return (
    <section className="panel dashboard-panel">
      <PanelHeading title="Infrastructure Environments" action="View all" onClick={onViewAll} />
      <DataTable headers={['Environment', 'Provider', 'Status', 'Resources', 'Cost (est.)']} rows={environments.map((row) => (
        <tr key={row[0]}><td><span className="env-cell"><Boxes size={15} />{row[0]}</span></td><td><strong>{row[1]}</strong></td><td><Badge>{row[2]}</Badge></td><td>{row[3]}</td><td>{row[4]}</td></tr>
      ))} />
    </section>
  );
}

function AlertsPanel({ onViewAll }) {
  const alerts = [
    ['Critical', 'api-service', 'Pod crash loop detected (restart count > 5)', '18 min ago'],
    ['Warning', 'rag-chatbot', 'High memory usage (> 80%)', '42 min ago'],
    ['Warning', 'aws-dev', 'EKS node CPU usage high (> 75%)', '2 hours ago'],
    ['Info', 'frontend', 'New version v2.0.1 deployed', '3 hours ago'],
  ];

  return (
    <section className="panel dashboard-panel">
      <PanelHeading title="Recent Alerts" action="View all" onClick={onViewAll} />
      <DataTable headers={['Severity', 'Resource', 'Message', 'Time']} rows={alerts.map((row) => (
        <tr key={`${row[1]}-${row[0]}`}><td><Badge>{row[0]}</Badge></td><td>{row[1]}</td><td>{row[2]}</td><td className="muted">{row[3]}</td></tr>
      ))} />
    </section>
  );
}

function ActivityFeed({ onViewAll }) {
  const events = [
    [Package, 'Deployment started for frontend (v2.0.1) in dev', '28 min ago', 'blue'],
    [Workflow, 'Pipeline succeeded for rag-chatbot (main)', '35 min ago', 'green'],
    [Cloud, 'Terraform plan completed for aws-dev', '1 hour ago', 'purple'],
    [Bell, 'New alert: High memory usage on rag-chatbot', '2 hours ago', 'red'],
    [ShieldCheck, 'User admin approved infrastructure apply for aws-dev', '3 hours ago', 'blue'],
  ];

  return (
    <section className="panel dashboard-panel">
      <PanelHeading title="Activity Feed" action="View all" onClick={onViewAll} />
      <div className="feed-list">{events.map(([Icon, text, time, tone]) => (
        <div className="feed-item" key={text}><span className={`feed-icon ${tone}`}><Icon size={14} /></span><span>{text}</span><small>{time}</small></div>
      ))}</div>
    </section>
  );
}

export default function OverviewPage({ navigate }) {
  return (
    <>
      <div className="dashboard-heading">
        <div><div className="eyebrow">PLATFORM / OVERVIEW</div><h1>Platform Overview</h1><p>Monitor. Deploy. Provision. All in one place.</p></div>
        <div className="dashboard-controls"><button className="button secondary">Last 24 hours <ChevronDown size={14} /></button><button className="button primary" onClick={() => navigate('Deployments')}>＋ Deploy Application <ChevronDown size={14} /></button></div>
      </div>
      <div className="sample-banner"><span className="live-dot" /><strong>Sample dashboard</strong><span>Illustrative data only · no live systems are connected</span></div>
      <div className="summary-grid">
        <SummaryCard icon={GitBranch} label="Repositories" value="8" delta="↑ 2" detail="6 active, 2 archived" tone="dark" onClick={() => navigate('Repositories')} />
        <SummaryCard icon={Workflow} label="Pipeline Runs" value="24" delta="↑ 12%" detail="18 succeeded, 4 failed" tone="green" onClick={() => navigate('Pipelines')} />
        <SummaryCard icon={Package} label="Deployments" value="6" delta="↑ 1" detail="5 healthy, 1 updating" tone="mint" onClick={() => navigate('Deployments')} />
        <SummaryCard icon={Cloud} label="Infrastructure" value="2" detail="1 running, 1 stopped" tone="purple" onClick={() => navigate('Infrastructure')} />
      </div>
      <div className="dashboard-row dashboard-row-wide"><PipelineRunsPanel onViewAll={() => navigate('Pipelines')} /><SystemHealthPanel /></div>
      <div className="dashboard-row dashboard-row-half"><DeploymentsPanel onViewAll={() => navigate('Deployments')} /><InfrastructurePanel onViewAll={() => navigate('Infrastructure')} /></div>
      <div className="dashboard-row dashboard-row-half"><AlertsPanel onViewAll={() => navigate('Alerts')} /><ActivityFeed onViewAll={() => navigate('Audit')} /></div>
    </>
  );
}
