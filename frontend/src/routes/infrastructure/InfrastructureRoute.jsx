import { useLocation } from 'react-router-dom';
import InfrastructurePage from '../../features/infrastructure/pages/InfrastructurePage.jsx';

export default function InfrastructureRoute() {
  const { pathname } = useLocation();
  const title = pathname === '/environments' ? 'Environments' : 'Infrastructure';
  return <InfrastructurePage title={title} />;
}
