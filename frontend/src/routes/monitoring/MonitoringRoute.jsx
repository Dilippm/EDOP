import { Navigate, useParams } from 'react-router-dom';
import FeaturePlaceholder from '../../components/ui/FeaturePlaceholder.jsx';
import ObservabilityPage from '../../features/monitoring/pages/ObservabilityPage.jsx';

const monitoringSections = new Set(['metrics', 'logs', 'traces', 'alerts']);

export default function MonitoringRoute() {
  const { section } = useParams();

  if (!section) return <ObservabilityPage />;
  if (!monitoringSections.has(section)) return <Navigate to="/monitoring" replace />;

  const title = section[0].toUpperCase() + section.slice(1);
  return <FeaturePlaceholder title={title} />;
}
