// Simple fixed-window rate limiting stored in Postgres, so it works across serverless instances.
import { db } from './db.js';
import { HttpError, clientIp } from './http.js';

export async function rateLimit(req, bucket, { limit, windowSeconds }) {
  const sql = db();
  const key = `${bucket}:${clientIp(req)}`;
  const [row] = await sql`
    INSERT INTO rate_limits (key, hits, window_start) VALUES (${key}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      hits = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}) THEN 1 ELSE rate_limits.hits + 1 END,
      window_start = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}) THEN now() ELSE rate_limits.window_start END
    RETURNING hits, extract(epoch FROM (window_start + make_interval(secs => ${windowSeconds}) - now()))::int AS retry_after`;
  if (row.hits > limit) {
    throw new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.', { retryAfter: Math.max(1, row.retry_after) });
  }
}
