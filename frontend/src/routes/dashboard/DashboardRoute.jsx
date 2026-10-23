import { useNavigate } from 'react-router-dom';
import OverviewPage from '../../features/dashboard/pages/OverviewPage.jsx';
import { navigationItems } from '../../data/navigation.js';

export default function DashboardRoute() {
  const navigate = useNavigate();

  const navigateToPage = (label) => {
    const destination = navigationItems.find((item) => item.label === label)?.path;
    if (destination) navigate(destination);
  };

  return <OverviewPage navigate={navigateToPage} />;
}
