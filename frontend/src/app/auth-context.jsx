import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AUTH_STATE_KEY = 'edop_auth_state';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function readSavedAuthState() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STATE_KEY) || 'null');
    if (!saved?.user || !Number.isFinite(saved.expiresAt) || saved.expiresAt <= Date.now()) {
      localStorage.removeItem(AUTH_STATE_KEY);
      return null;
    }
    return saved.user;
  } catch {
    return null;
  }
}

function saveAuthState(user) {
  const safeUser = {
    id: user?.id,
    name: user?.name ?? null,
    email: user?.email,
    username: user?.username ?? null,
    role: user?.role,
  };
  try {
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify({
      user: safeUser,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    }));
  } catch {
    // Keep the current page signed in if browser storage is unavailable.
  }
  return safeUser;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedAuthState);
  const [isLoading] = useState(false);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    async signIn(identifier, password) {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email:identifier, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to sign in. Please try again.');
      const savedUser = saveAuthState(data.user);
      setUser(savedUser);
      return savedUser;
    },
    async signOut() {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      } finally {
        try { localStorage.removeItem(AUTH_STATE_KEY); } catch { /* Storage may be unavailable. */ }
        setUser(null);
      }
    },
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
