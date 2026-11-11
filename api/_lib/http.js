// Small helpers shared by every /api function (standard Vercel Node handlers: (req, res) => …).

export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export const badRequest = (message, fieldErrors) => new HttpError(400, message, fieldErrors ? { fieldErrors } : {});
export const unauthorized = () => new HttpError(401, 'Please log in to continue.', { code: 'unauthorized' });
export const notFound = (what = 'That item') => new HttpError(404, `${what} could not be found.`);

export function readBody(req) {
  if (req.body == null || req.body === '') return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { throw badRequest('The request body is not valid JSON.'); }
  }
  return req.body;
}

// Validate with a zod schema and turn problems into friendly field errors.
export function parse(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] ?? 'form';
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  throw badRequest('Please check the highlighted fields.', fieldErrors);
}

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

// Wraps a map of { GET, POST, … } handlers with method routing and consistent JSON errors.
export function route(methods) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const fn = methods[req.method];
    if (!fn) {
      res.setHeader('Allow', Object.keys(methods).join(', '));
      return res.status(405).json({ error: 'Method not allowed.' });
    }
    try {
      const result = await fn(req, res);
      if (!res.headersSent) res.status(200).json(result ?? { ok: true });
    } catch (err) {
      const { isConnectionError } = await import('./db.js');
      if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message, ...err.extra });
      } else if (isConnectionError(err)) {
        console.error('[api] database unreachable:', err.message);
        res.status(503).json({ error: 'database_unavailable', message: 'We could not reach the database. Please try again in a moment.' });
      } else {
        console.error('[api] unexpected error:', err);
        res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
      }
    }
  };
}
