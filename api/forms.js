// /api/contact      POST  contact form           (→ /api/forms?op=contact)
// /api/submissions  POST  manuscript submission  (→ /api/forms?op=submission)
import { db } from './_lib/db.js';
import { route, readBody, parse, HttpError } from './_lib/http.js';
import { sessionUserId } from './_lib/auth.js';
import { rateLimit } from './_lib/rateLimit.js';
import { contactSchema, submissionSchema } from './_lib/schemas.js';

async function contact(req) {
  await rateLimit(req, 'contact', { limit: 8, windowSeconds: 600 });
  const input = parse(contactSchema, readBody(req));
  const [row] = await db()`
    INSERT INTO contact_messages (name, email, country, message) VALUES (${input.name}, ${input.email}, ${input.country}, ${input.message})
    RETURNING id, created_at`;
  return { ok: true, id: Number(row.id) };
}

async function submission(req) {
  await rateLimit(req, 'submission', { limit: 5, windowSeconds: 600 });
  const input = parse(submissionSchema, readBody(req));
  const userId = await sessionUserId(req);
  const [row] = await db()`
    INSERT INTO manuscript_submissions (user_id, author_name, email, country, book_title, genre, summary)
    VALUES (${userId}, ${input.authorName}, ${input.email}, ${input.country}, ${input.bookTitle}, ${input.genre}, ${input.summary})
    RETURNING id, submitted_at, status`;
  const year = new Date(row.submitted_at).getUTCFullYear();
  return { ok: true, reference: `NOV-MS-${year}-${String(row.id).padStart(5, '0')}`, status: row.status, bookTitle: input.bookTitle };
}

export default route({
  POST: (req) => {
    if (req.query.op === 'contact') return contact(req);
    if (req.query.op === 'submission') return submission(req);
    throw new HttpError(404, 'Unknown form.');
  },
});
