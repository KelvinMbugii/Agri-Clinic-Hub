import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, signupRequest } from '../services/api.js';

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = 'ach_token';
const STORAGE_USER_KEY = 'ach_user';

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function base64UrlToBase64(input) {
  const pad = '='.repeat((4 - (input.length % 4)) % 4);
  return (input + pad).replace(/-/g, '+').replace(/_/g, '/');
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1];
    const json = atob(base64UrlToBase64(payload));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromAuth(token, user) {
  const payload = decodeJwtPayload(token);
  return payload?.role || user?.role || null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY) || '');
  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem(STORAGE_USER_KEY)) || null);
  const [initializing, setInitializing] = useState(true);

  const role = useMemo(() => getRoleFromAuth(token, user), [token, user]);
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    setInitializing(false);
  }, []);

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken('');
    setUser(null);
  };

  const persistAuth = (nextToken, nextUser) => {
    localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async ({ email, password }) => {
    const data = await loginRequest({ email, password });
    if (!data?.token || !data?.user) {
      throw new Error('Unexpected login response');
    }
    persistAuth(data.token, data.user);
    return data.user;
  };

  const signup = async ({ name, email, phone, password, role: nextRole }) => {
    const data = await signupRequest({ name, email, phone, password, role: nextRole });
    if (!data?.token || !data?.user) {
      throw new Error('Unexpected signup response');
    }
    persistAuth(data.token, data.user);
    return data.user;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      role,
      isAuthenticated,
      initializing,
      login,
      signup,
      logout
    }),
    [token, user, role, isAuthenticated, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

