// /api/ebooks          GET  list (category, q)       /api/ebooks/:slug → GET details incl. sample
// /api/purchases       POST { id, currency } — demo checkout, records the purchase (→ /api/ebooks?op=purchase)
import { db } from './_lib/db.js';
import { route, readBody, parse, notFound, HttpError } from './_lib/http.js';
import { sessionUserId, requireUser } from './_lib/auth.js';
import { purchaseSchema } from './_lib/schemas.js';

const COLUMNS = `e.id, e.slug, e.title, e.subtitle, e.author_name, e.author_country, e.category, e.page_count, e.price_usd::float8 AS price_usd,
  e.description, e.cover_gradient, e.is_bestseller, e.published_at`;

const shape = (e) => ({ ...e, id: Number(e.id), owned: Boolean(e.owned) });

async function list(req) {
  const userId = await sessionUserId(req);
  const params = [userId];
  const where = [];
  if (typeof req.query.category === 'string' && req.query.category) { params.push(req.query.category); where.push(`e.category = $${params.length}`); }
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    params.push(`%${req.query.q.trim().slice(0, 80).replace(/[\\%_]/g, '\\$&')}%`);
    where.push(`(e.title ILIKE $${params.length} OR e.author_name ILIKE $${params.length} OR e.subtitle ILIKE $${params.length})`);
  }
  const rows = await db().query(
    `SELECT ${COLUMNS}, (p.id IS NOT NULL) AS owned FROM ebooks e LEFT JOIN ebook_purchases p ON p.ebook_id = e.id AND p.user_id = $1
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY e.is_bestseller DESC, e.published_at DESC`,
    params,
  );
  return { ebooks: rows.map(shape) };
}

async function details(req) {
  const userId = await sessionUserId(req);
  const [row] = await db().query(
    `SELECT ${COLUMNS}, e.sample_text, (p.id IS NOT NULL) AS owned FROM ebooks e LEFT JOIN ebook_purchases p ON p.ebook_id = e.id AND p.user_id = $2 WHERE e.slug = $1`,
    [req.query.slug, userId],
  );
  if (!row) throw notFound('That eBook');
  return { ebook: shape(row) };
}

async function purchase(req) {
  const user = await requireUser(req);
  const { id, currency } = parse(purchaseSchema, readBody(req));
  const sql = db();
  const [book] = await sql`SELECT id, title, price_usd FROM ebooks WHERE id = ${id}`;
  if (!book) throw notFound('That eBook');
  const inserted = await sql`
    INSERT INTO ebook_purchases (user_id, ebook_id, price_paid_usd, currency_shown) VALUES (${user.id}, ${id}, ${book.price_usd}, ${currency})
    ON CONFLICT (user_id, ebook_id) DO NOTHING RETURNING id, purchased_at`;
  const [existing] = inserted.length ? inserted : await sql`SELECT id, purchased_at FROM ebook_purchases WHERE user_id = ${user.id} AND ebook_id = ${id}`;
  return { owned: true, alreadyOwned: inserted.length === 0, purchase: { id: Number(existing.id), purchasedAt: existing.purchased_at, title: book.title } };
}

export default route({
  GET: (req) => (req.query.slug ? details(req) : list(req)),
  POST: (req) => {
    if (req.query.op !== 'purchase') throw new HttpError(404, 'Unknown eBook action.');
    return purchase(req);
  },
});
