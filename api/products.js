// /api/products                GET  list (category, type, level, price, q, sort) — or ?slug= for details
// /api/products/purchase       POST { id, currency } — bundles add every included product in one statement
// /api/products/library        GET  the logged-in user's products
import { db } from './_lib/db.js';
import { route, readBody, parse, notFound, HttpError } from './_lib/http.js';
import { sessionUserId, requireUser } from './_lib/auth.js';
import { purchaseSchema, CATEGORIES, LEVELS } from './_lib/schemas.js';

const TYPES = ['Prompt Pack', 'Template', 'Toolkit', 'Workbook', 'Cheat Sheet', 'Bundle'];
const SORTS = {
  popular: 'd.download_count DESC',
  newest: 'd.created_at DESC',
  rating: 'd.rating DESC, d.download_count DESC',
  priceAsc: 'd.price_usd ASC, d.download_count DESC',
  priceDesc: 'd.price_usd DESC, d.download_count DESC',
};
const COLUMNS = `d.id, d.slug, d.title, d.subtitle, d.category, d.product_type, d.level, d.format, d.file_size, d.page_or_item_count,
  d.price_usd::float8 AS price_usd, d.rating::float8 AS rating, d.download_count, d.cover_gradient, d.is_featured, d.is_bestseller, d.created_at`;
const ITEMS = `(SELECT COALESCE(json_agg(json_build_object('id', i.id, 'slug', i.slug, 'title', i.title, 'product_type', i.product_type,
      'cover_gradient', i.cover_gradient, 'price_usd', i.price_usd::float8) ORDER BY pb.id), '[]'::json)
    FROM product_bundles pb JOIN digital_products i ON i.id = pb.included_product_id WHERE pb.product_id = d.id) AS items`;

function shape(p) {
  const items = p.items || [];
  const original = items.reduce((s, i) => s + Number(i.price_usd), 0);
  return {
    ...p, id: Number(p.id), owned: Boolean(p.owned), items: items.map((i) => ({ ...i, id: Number(i.id) })),
    original_price_usd: items.length ? Math.round(original * 100) / 100 : null,
    saving_pct: items.length && original ? Math.round((1 - p.price_usd / original) * 100) : null,
  };
}

async function list(req) {
  const userId = await sessionUserId(req);
  const { category, type, level, price, q, sort } = req.query;
  const params = [userId];
  const where = [];
  const add = (build, value) => { params.push(value); where.push(build(`$${params.length}`)); };
  if (CATEGORIES.includes(category)) add((p) => `d.category = ${p}`, category);
  if (TYPES.includes(type)) add((p) => `d.product_type = ${p}`, type);
  if (LEVELS.includes(level)) add((p) => `d.level = ${p}`, level);
  if (price === 'free') where.push('d.price_usd = 0');
  if (price === 'paid') where.push('d.price_usd > 0');
  if (typeof q === 'string' && q.trim()) add((p) => `d.title ILIKE ${p}`, `%${q.trim().slice(0, 80).replace(/[\\%_]/g, '\\$&')}%`);
  const rows = await db().query(
    `SELECT ${COLUMNS}, ${ITEMS}, EXISTS (SELECT 1 FROM product_purchases pp WHERE pp.product_id = d.id AND pp.user_id = $1) AS owned
     FROM digital_products d ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${SORTS[sort] || SORTS.popular}`,
    params,
  );
  return { products: rows.map(shape) };
}

async function details(req) {
  const userId = await sessionUserId(req);
  const sql = db();
  const [row] = await sql.query(
    `SELECT ${COLUMNS}, d.description, d.whats_included, d.preview_items, ${ITEMS},
            EXISTS (SELECT 1 FROM product_purchases pp WHERE pp.product_id = d.id AND pp.user_id = $2) AS owned
     FROM digital_products d WHERE d.slug = $1`,
    [req.query.slug, userId],
  );
  if (!row) throw notFound('That product');
  const [bundles, related] = await Promise.all([
    sql.query(
      `SELECT ${COLUMNS}, ${ITEMS}, EXISTS (SELECT 1 FROM product_purchases pp WHERE pp.product_id = d.id AND pp.user_id = $2) AS owned
       FROM digital_products d WHERE d.id IN (SELECT product_id FROM product_bundles WHERE included_product_id = $1)`,
      [row.id, userId],
    ),
    sql.query(
      `SELECT ${COLUMNS}, '[]'::json AS items, EXISTS (SELECT 1 FROM product_purchases pp WHERE pp.product_id = d.id AND pp.user_id = $3) AS owned
       FROM digital_products d WHERE d.category = $1 AND d.id <> $2 AND d.product_type <> 'Bundle' ORDER BY d.download_count DESC LIMIT 6`,
      [row.category, row.id, userId],
    ),
  ]);
  return { product: shape(row), bundles: bundles.map(shape), related: related.map(shape) };
}

async function purchase(req) {
  const user = await requireUser(req);
  const { id, currency } = parse(purchaseSchema, readBody(req));
  const sql = db();
  const [product] = await sql`SELECT id, title, product_type, price_usd FROM digital_products WHERE id = ${id}`;
  if (!product) throw notFound('That product');
  // One statement: the product itself plus (for bundles) every included product. Already-owned rows are kept as they are.
  const inserted = await sql`
    INSERT INTO product_purchases (user_id, product_id, price_paid_usd, currency_shown)
    SELECT ${user.id}, x.id, x.price, ${currency} FROM (
      SELECT ${id}::bigint AS id, ${product.price_usd}::numeric AS price
      UNION ALL SELECT included_product_id, 0 FROM product_bundles WHERE product_id = ${id}
    ) x
    ON CONFLICT (user_id, product_id) DO NOTHING
    RETURNING product_id`;
  const owned = await sql`
    SELECT d.id, d.slug FROM product_purchases p JOIN digital_products d ON d.id = p.product_id
    WHERE p.user_id = ${user.id} AND (d.id = ${id} OR d.id IN (SELECT included_product_id FROM product_bundles WHERE product_id = ${id}))`;
  return { owned: true, alreadyOwned: !inserted.some((r) => Number(r.product_id) === id), title: product.title, productIds: owned.map((r) => Number(r.id)), slugs: owned.map((r) => r.slug) };
}

async function library(req) {
  const user = await requireUser(req);
  const rows = await db().query(
    `SELECT ${COLUMNS}, d.description, d.whats_included, d.preview_items, ${ITEMS}, true AS owned, p.purchased_at
     FROM product_purchases p JOIN digital_products d ON d.id = p.product_id WHERE p.user_id = $1 ORDER BY p.purchased_at DESC`,
    [user.id],
  );
  return { products: rows.map(shape) };
}

export default route({
  GET: (req) => {
    if (req.query.op === 'library') return library(req);
    return req.query.slug ? details(req) : list(req);
  },
  POST: (req) => {
    if (req.query.op !== 'purchase') throw new HttpError(404, 'Unknown product action.');
    return purchase(req);
  },
});
