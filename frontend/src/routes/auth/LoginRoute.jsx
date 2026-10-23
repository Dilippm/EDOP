import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from '../../features/auth/pages/LoginPage.jsx';
import { useAuth } from '../../app/auth-context.jsx';

export default function LoginRoute() {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const completeSignIn = async (identifier, password) => {
    await signIn(identifier, password);
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  };

  return <LoginPage onLogin={completeSignIn} />;
}
