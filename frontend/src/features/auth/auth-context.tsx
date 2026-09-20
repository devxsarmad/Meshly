'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentUser, registerAccount, signIn as signInRequest, signOut as signOutRequest, type AuthUser } from '../../lib/api';

type AuthContextValue = { user: AuthUser | null; loading: boolean; signIn: (email: string, password: string) => Promise<AuthUser>; register: (email: string, password: string, name: string) => Promise<AuthUser>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((session) => setUser(session.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async signIn(email, password) { const session = await signInRequest(email, password); setUser(session.user); return session.user; },
    async register(email, password, name) { const session = await registerAccount(email, password, name); setUser(session.user); return session.user; },
    async signOut() { await signOutRequest(); setUser(null); },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
