import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from '../../features/auth/pages/LoginPage.jsx';
import { useAuth } from '../../app/auth-context.jsx';

export default function LoginRoute() {
  const { isAuthenticated, signInPreview } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const completePreviewSignIn = () => {
    // Development-only UI transition. This is not credential verification.
    signInPreview();
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  };

  return <LoginPage onLogin={completePreviewSignIn} />;
}
