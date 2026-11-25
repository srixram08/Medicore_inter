import React, { createContext, useCallback, useContext, useState } from 'react';

export interface MockUser {
  email: string;
  name: string;
  role: string;
  hospitalName: string;
  initials: string;
}

interface AuthSession {
  user: MockUser;
  loggedInAt: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const STORAGE_KEY = 'medicore_3d_mock_session';

const DEMO_USER: MockUser = {
  email: 'admin@medicore.demo',
  name: 'Dr. Arvind Narayanan',
  role: 'Chief Medical Administrator',
  hospitalName: 'MediCore Apex Hospital',
  initials: 'AN',
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed?.user?.email) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    await new Promise((resolve) => setTimeout(resolve, 680));

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== 'admin@medicore.demo' || password !== 'Demo@1234') {
      return {
        ok: false,
        error: 'Invalid email or password. Use admin@medicore.demo / Demo@1234.',
      };
    }

    const newSession: AuthSession = {
      user: DEMO_USER,
      loggedInAt: new Date().toISOString(),
    };

    try {
      const serialized = JSON.stringify(newSession);
      if (remember) {
        localStorage.setItem(STORAGE_KEY, serialized);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, serialized);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors in sandboxed iframes
    }

    setSession(newSession);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
