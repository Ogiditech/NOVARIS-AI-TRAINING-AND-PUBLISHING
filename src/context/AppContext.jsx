import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translate } from '../i18n/translations';
import { currencies } from '../data/constants';

const AppContext = createContext(null);

// Only harmless per-device preferences are kept in the browser (theme, display currency).
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(`novaris:${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(`novaris:${key}`, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => load('theme', 'dark'));
  const [lang] = useState('en');
  const [toasts, setToasts] = useState([]);
  const [currencyCode, setCurrencyCode] = useState(() => load('currency', 'USD'));
  const [searchOpen, setSearchOpen] = useState(false);
  // Demo checkout modal: { kind: 'product' | 'ebook' | 'course' | 'plan', item, onDone }
  const [checkout, setCheckout] = useState(null);
  // Items acquired during this visit, so every card updates instantly without refetching.
  const [acquired, setAcquired] = useState({ products: [], ebooks: [], courses: [] });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    save('theme', theme);
  }, [theme]);
  useEffect(() => save('currency', currencyCode), [currencyCode]);

  const t = useCallback((path, vars) => translate(lang, path, vars), [lang]);

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list.slice(-3), { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id) => setToasts((l) => l.filter((x) => x.id !== id)), []);

  const markAcquired = useCallback((kind, ids) => {
    setAcquired((a) => ({ ...a, [kind]: [...new Set([...a[kind], ...ids.map(Number)])] }));
  }, []);
  const clearAcquired = useCallback(() => setAcquired({ products: [], ebooks: [], courses: [] }), []);

  const value = useMemo(() => ({
    t, lang, theme,
    toggleTheme: () => setTheme((th) => (th === 'dark' ? 'light' : 'dark')),
    toasts, toast, dismissToast,
    currency: currencies.find((c) => c.code === currencyCode) || currencies[0],
    setCurrencyCode,
    searchOpen, setSearchOpen,
    checkout, setCheckout,
    acquired, markAcquired, clearAcquired,
  }), [t, lang, theme, toasts, toast, dismissToast, currencyCode, searchOpen, checkout, acquired, markAcquired, clearAcquired]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
