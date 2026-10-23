import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth-context.jsx';
import AppShell from './AppShell.jsx';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOutPreview } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    signOutPreview();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      open={sidebarOpen}
      onCloseNavigation={() => setSidebarOpen(false)}
      onOpenNavigation={() => setSidebarOpen(true)}
      onSignOut={signOut}
    >
      <Outlet />
    </AppShell>
  );
}
