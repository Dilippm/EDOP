import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.jsx';
import { AuthProvider } from './app/auth-context.jsx';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
