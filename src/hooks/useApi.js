import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

// Loads JSON from /api. Keeps the previous data while reloading so screens never flash or shift.
export default function useApi(path, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(enabled && path) });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled || !path) {
      setState((s) => ({ ...s, loading: false }));
      return undefined;
    }
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, { signal: ctrl.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState((s) => ({ ...s, error, loading: false }));
      });
    return () => ctrl.abort();
  }, [path, enabled, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback((fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })), []);
  return { ...state, reload, setData };
}
