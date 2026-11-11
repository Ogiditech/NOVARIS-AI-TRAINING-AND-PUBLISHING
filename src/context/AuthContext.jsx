import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, isOffline } from '../lib/api';
import { useApp } from './AppContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { setCurrencyCode, clearAcquired } = useApp();
  const [user, setUser] = useState(null);
  // loading → ready, or offline when the server/database cannot be reached
  const [status, setStatus] = useState('loading');

  const refresh = useCallback(async () => {
    try {
      const data = await api('/auth/me');
      setUser(data.user);
      setStatus('ready');
      return data.user;
    } catch (err) {
      setUser(null);
      setStatus(isOffline(err) ? 'offline' : 'ready');
      return null;
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Prices default to the learner's preferred currency whenever they sign in.
  useEffect(() => {
    if (user?.currency) setCurrencyCode(user.currency);
  }, [user?.id, user?.currency, setCurrencyCode]);

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setUser(data.user);
    refresh();
    return data.user;
  }, [refresh]);

  const signup = useCallback(async (payload) => {
    const data = await api('/auth/signup', { method: 'POST', body: payload });
    setUser({ ...data.user, streak: 0, bestStreak: 0 });
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api('/auth/logout', { method: 'POST' }); } finally {
      setUser(null);
      clearAcquired();
    }
  }, [clearAcquired]);

  const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), []);

  const value = useMemo(() => ({ user, status, refresh, login, signup, logout, updateUser }), [user, status, refresh, login, signup, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
