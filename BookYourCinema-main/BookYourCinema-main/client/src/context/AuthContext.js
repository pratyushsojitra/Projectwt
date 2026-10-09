import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('byc-session');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      localStorage.removeItem('byc-session');
      localStorage.removeItem('byc-token');
      return null;
    }
  });
  const [showAuth, setShowAuth] = useState(false);

  const value = useMemo(() => ({
    session,
    showAuth,
    openAuth: () => setShowAuth(true),
    closeAuth: () => setShowAuth(false),
    login: (result, role) => {
      const nextSession = { ...result.user, role };
      localStorage.setItem('byc-token', result.token);
      localStorage.setItem('byc-session', JSON.stringify(nextSession));
      setSession(nextSession);
      setShowAuth(false);
    },
    logout: () => {
      localStorage.removeItem('byc-token');
      localStorage.removeItem('byc-session');
      setSession(null);
    }
  }), [session, showAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
