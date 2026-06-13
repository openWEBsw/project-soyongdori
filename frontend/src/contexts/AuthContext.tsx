import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthMember {
  id: string;
  email: string;
  name: string;
  position: string;
  status: string;
  profileImageUrl: string | null;
}

interface AuthContextValue {
  member: AuthMember | null;
  token: string | null;
  login: (token: string, member: AuthMember) => void;
  logout: () => void;
  updateMember: (updates: Partial<AuthMember>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [member, setMember] = useState<AuthMember | null>(() => {
    const stored = localStorage.getItem('member');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken: string, newMember: AuthMember) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('member', JSON.stringify(newMember));
    setToken(newToken);
    setMember(newMember);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('member');
    setToken(null);
    setMember(null);
  };

  const updateMember = (updates: Partial<AuthMember>) => {
    setMember(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('member', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ member, token, login, logout, updateMember, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
