import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

/**
 * Development-only auth placeholder. State is intentionally in memory and is
 * cleared on refresh. It is not authentication and provides no security.
 */
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const value = useMemo(() => ({
    isAuthenticated,
    signInPreview: () => setIsAuthenticated(true),
    signOutPreview: () => setIsAuthenticated(false),
  }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
