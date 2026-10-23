import { Outlet } from 'react-router-dom';

// LoginPage owns the existing visual auth screen; this layout leaves it intact.
export default function AuthLayout() {
  return <Outlet />;
}
