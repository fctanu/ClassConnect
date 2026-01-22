import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

type AuthContextType = {
  ready: boolean;
  authenticated: boolean;
  login: (accessToken: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function tryRefresh() {
      try {
        const res = await api.post('/api/auth/refresh', {}, { withCredentials: true });
        localStorage.setItem('accessToken', res.data.accessToken);
        setAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('accessToken');
        setAuthenticated(false);
      } finally {
        setReady(true);
      }
    }
    tryRefresh();
  }, []);

  function login(accessToken: string) {
    localStorage.setItem('accessToken', accessToken);
    setAuthenticated(true);
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
      // Ignore logout errors as we are clearing local state anyway
    }
    localStorage.removeItem('accessToken');
    setAuthenticated(false);
    toast.info('You have been logged out');
  }

  return (
    <AuthContext.Provider value={{ ready, authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
