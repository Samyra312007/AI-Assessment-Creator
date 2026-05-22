'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import { getToken, setToken, removeToken, getStoredUser, setStoredUser } from './auth';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; schoolName?: string; schoolLocation?: string }) => Promise<void>;
  logout: () => void;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  login: async () => {}, register: async () => {}, logout: () => {},
  isTeacher: false, isStudent: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (getToken() && stored) {
      setUser(stored);
      api.getMe().then(setUser).catch(() => { removeToken(); setUser(null); }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; schoolName?: string; schoolLocation?: string }) => {
    const res = await api.register(data);
    setToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isTeacher: user?.role === 'teacher' || user?.role === 'admin',
      isStudent: user?.role === 'student',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
