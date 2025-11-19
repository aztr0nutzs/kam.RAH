import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/domain';
import * as apiClient from '../api/client';
import { SECURE_STORAGE_KEYS, STORAGE_KEYS } from '../config/appConfig';
import { deleteSecureItem, readSecureJson, writeSecureJson } from '../utils/secureStore';
import { captureError } from '../utils/logger';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const payload = await readSecureJson<{ token: string; user: User }>(SECURE_STORAGE_KEYS.AUTH);
        if (payload && isMounted) {
          setUser(payload.user);
          setToken(payload.token);
          apiClient.setAuthToken(payload.token);
        }
      } catch (error) {
        captureError(error, 'Failed to bootstrap auth session');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      // Remove legacy storage if any residual secrets exist
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_LEGACY);
    };

    bootstrapSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = useCallback(async (nextToken: string | null, nextUser: User | null) => {
    try {
      if (nextToken && nextUser) {
        await writeSecureJson(SECURE_STORAGE_KEYS.AUTH, { token: nextToken, user: nextUser });
        apiClient.setAuthToken(nextToken);
      } else {
        await deleteSecureItem(SECURE_STORAGE_KEYS.AUTH);
        apiClient.setAuthToken(null);
      }
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      captureError(error, 'Failed to persist auth session');
      throw error;
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiClient.login(email, password);
      await persistSession(response.token, response.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await apiClient.register(name, email, password);
      await persistSession(response.token, response.user);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    await persistSession(null, null);
  }, [persistSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
