// Browser → /api helper. The database is never contacted from the browser.
export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || data?.error || 'Request failed');
    this.status = status;
    this.data = data || {};
    this.fieldErrors = data?.fieldErrors || {};
    this.code = data?.code || (data?.error === 'database_unavailable' ? 'database_unavailable' : undefined);
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, { error: 'network_error', code: 'network_error' });
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty or non-JSON body */ }
  if (!res.ok) throw new ApiError(res.status, data || (res.status >= 500 ? { error: 'database_unavailable' } : null));
  return data;
}

// "We can't reach the server/database" — show the full-page retry message.
export const isOffline = (err) => Boolean(err) && (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504 || err.code === 'database_unavailable' || err.code === 'network_error');
export const isAuthError = (err) => err?.status === 401;
