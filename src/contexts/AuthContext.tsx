import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { LoginCredentials, RegisterPayload, User } from '../types/auth';
import * as authService from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  authMode: 'supabase' | 'local';
  login: (credentials: LoginCredentials) => Promise<User>;
  loginWithGoogle: (returnPath?: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setUser(await authService.getCurrentUser());
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    authService.initAuth().then((u) => {
      setUser(u);
      setIsLoading(false);
    });

    unsub = authService.subscribeAuthChanges(() => {
      refresh();
    });

    return () => unsub?.();
  }, [refresh]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loggedIn = await authService.login(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const loginWithGoogle = useCallback(async (returnPath?: string) => {
    await authService.loginWithGoogle(returnPath);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const created = await authService.register(payload);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      authMode: authService.authMode(),
      login,
      loginWithGoogle,
      register,
      logout,
      refresh,
      getAccessToken: authService.getAccessToken,
    }),
    [user, isLoading, login, loginWithGoogle, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
