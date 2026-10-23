import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import AuditRoute from '../routes/audit/AuditRoute.jsx';
import LoginRoute from '../routes/auth/LoginRoute.jsx';
import DashboardRoute from '../routes/dashboard/DashboardRoute.jsx';
import DeploymentsRoute from '../routes/deployments/DeploymentsRoute.jsx';
import PipelinesRoute from '../routes/deployments/PipelinesRoute.jsx';
import InfrastructureRoute from '../routes/infrastructure/InfrastructureRoute.jsx';
import MonitoringRoute from '../routes/monitoring/MonitoringRoute.jsx';
import NotFoundRoute from '../routes/NotFoundRoute.jsx';
import RepositoriesRoute from '../routes/repositories/RepositoriesRoute.jsx';
import SettingsRoute from '../routes/settings/SettingsRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useAuth } from './auth-context.jsx';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <LoginRoute /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <DashboardLayout />,
      children: [
        { path: '/dashboard', element: <DashboardRoute /> },
        { path: '/repositories', element: <RepositoriesRoute /> },
        { path: '/pipelines', element: <PipelinesRoute /> },
        { path: '/deployments', element: <DeploymentsRoute /> },
        { path: '/infrastructure', element: <InfrastructureRoute /> },
        { path: '/environments', element: <InfrastructureRoute /> },
        { path: '/monitoring', element: <MonitoringRoute /> },
        { path: '/monitoring/:section', element: <MonitoringRoute /> },
        { path: '/audit', element: <AuditRoute /> },
        { path: '/settings', element: <SettingsRoute /> },
      ],
    }],
  },
  { path: '/', element: <RootRedirect /> },
  { path: '*', element: <NotFoundRoute /> },
]);
