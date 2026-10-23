import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth-context.jsx';
import AppShell from './AppShell.jsx';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      open={sidebarOpen}
      onCloseNavigation={() => setSidebarOpen(false)}
      onOpenNavigation={() => setSidebarOpen(true)}
      onSignOut={handleSignOut}
    >
      <Outlet />
    </AppShell>
  );
}
