// Database access. Runs ONLY on the server (/api functions) — never imported by the frontend.
import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import { HttpError } from './http.js';

if (globalThis.WebSocket) neonConfig.webSocketConstructor = globalThis.WebSocket;

let cached;

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new HttpError(503, 'database_unavailable', { message: 'DATABASE_URL is not configured on the server.' });
  return url;
}

// Tagged-template SQL over HTTP: sql`SELECT ... WHERE id = ${id}` (always parameterised).
export function db() {
  if (!cached) cached = neon(connectionString());
  return cached;
}

// Interactive transaction (BEGIN … COMMIT) for work that must be atomic, e.g. class bookings.
export async function transaction(fn) {
  const pool = new Pool({ connectionString: connectionString() });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// True when the error means "could not reach the database" (as opposed to a query error).
export function isConnectionError(err) {
  if (!err) return false;
  const text = `${err.message || ''} ${err.cause?.message || ''} ${err.sourceError?.message || ''}`;
  return /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|getaddrinfo|socket hang up|WebSocket|network|Connection terminated|password authentication failed/i.test(text)
    || (err.name === 'NeonDbError' && !err.code);
}
