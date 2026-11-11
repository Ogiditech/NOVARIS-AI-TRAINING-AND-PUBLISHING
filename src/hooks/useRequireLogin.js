import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// Wraps a protected action: logged-in users run it, everyone else goes to login and comes back here afterwards.
export default function useRequireLogin() {
  const { user } = useAuth();
  const { t, toast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback((action, { message } = {}) => {
    if (user) return action();
    toast(message || t('auth.loginToContinue'), 'info');
    navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    return undefined;
  }, [user, toast, t, navigate, location.pathname, location.search]);
}

// Only allow redirects to paths inside this site.
export function safeNext(next, fallback = '/dashboard') {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
