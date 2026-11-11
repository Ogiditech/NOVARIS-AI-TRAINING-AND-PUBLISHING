// /api/courses               GET  list (filters: category, level, language, q, sort)
// /api/courses/:slug         GET  details   (→ /api/courses?slug=…)
// /api/courses/:slug/enroll  POST enroll    (→ /api/courses?slug=…&action=enroll)
import { db } from './_lib/db.js';
import { route, notFound, HttpError } from './_lib/http.js';
import { sessionUserId, requireUser } from './_lib/auth.js';
import { CATEGORIES, LEVELS, LANGUAGES } from './_lib/schemas.js';

const SORTS = {
  popular: 'learners DESC, c.rating_count DESC',
  newest: 'c.created_at DESC',
  rating: 'c.rating DESC, c.rating_count DESC',
  priceAsc: 'c.price_usd ASC, c.rating DESC',
  priceDesc: 'c.price_usd DESC, c.rating DESC',
};

const COURSE_COLUMNS = `c.id, c.slug, c.title, c.subtitle, c.category, c.level, c.language, c.duration_minutes, c.price_usd::float8 AS price_usd,
  c.rating::float8 AS rating, c.rating_count, c.instructor_name, c.cover_gradient, c.is_featured,
  (SELECT count(*)::int FROM lessons l WHERE l.course_id = c.id) AS lessons_count,
  (SELECT count(*)::int FROM enrollments e WHERE e.course_id = c.id) AS learners`;

async function list(req) {
  const userId = await sessionUserId(req);
  const { category, level, language, q, sort } = req.query;
  const where = [];
  const params = [];
  // Each filter adds a numbered placeholder ($1, $2 …) — values are never concatenated into SQL.
  const add = (build, value) => { params.push(value); where.push(build(`$${params.length}`)); };
  if (CATEGORIES.includes(category)) add((p) => `c.category = ${p}`, category);
  if (LEVELS.includes(level)) add((p) => `c.level = ${p}`, level);
  if (LANGUAGES.includes(language)) add((p) => `c.language = ${p}`, language);
  if (typeof q === 'string' && q.trim()) add((p) => `(c.title ILIKE ${p} OR c.subtitle ILIKE ${p} OR c.instructor_name ILIKE ${p})`, `%${q.trim().slice(0, 80).replace(/[\\%_]/g, '\\$&')}%`);
  params.push(userId);
  const userParam = `$${params.length}`;
  const rows = await db().query(
    `SELECT ${COURSE_COLUMNS}, e.status AS enrollment_status, e.progress_percent
     FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = ${userParam}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY ${SORTS[sort] || SORTS.popular}`,
    params,
  );
  return { courses: rows.map(shape) };
}

function shape(c) {
  const { id, ...rest } = c;
  return { id: Number(id), ...rest, enrolled: Boolean(c.enrollment_status), progress_percent: c.progress_percent ?? null };
}

async function details(req) {
  const userId = await sessionUserId(req);
  const sql = db();
  const [course] = await sql.query(
    `SELECT ${COURSE_COLUMNS}, c.description, c.what_you_learn, c.instructor_bio, e.status AS enrollment_status, e.progress_percent
     FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = $2 WHERE c.slug = $1`,
    [req.query.slug, userId],
  );
  if (!course) throw notFound('That course');
  const enrolled = Boolean(course.enrollment_status);
  const lessons = await sql`
    SELECT l.id, l.title, l.order_index, l.duration_minutes, l.is_free_preview, COALESCE(p.completed, false) AS completed
    FROM lessons l LEFT JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = ${userId}
    WHERE l.course_id = ${course.id} ORDER BY l.order_index`;
  const [cert] = userId ? await sql`SELECT certificate_code FROM certificates WHERE user_id = ${userId} AND course_id = ${course.id}` : [];
  return {
    course: { ...shape(course), description: course.description, what_you_learn: course.what_you_learn, instructor_bio: course.instructor_bio },
    lessons: lessons.map((l) => ({ ...l, id: Number(l.id), locked: !enrolled && !l.is_free_preview })),
    certificateCode: cert?.certificate_code || null,
  };
}

async function enroll(req) {
  const user = await requireUser(req);
  const sql = db();
  const [course] = await sql`SELECT id FROM courses WHERE slug = ${req.query.slug}`;
  if (!course) throw notFound('That course');
  await sql`INSERT INTO enrollments (user_id, course_id) VALUES (${user.id}, ${course.id}) ON CONFLICT (user_id, course_id) DO NOTHING`;
  const [enrollment] = await sql`SELECT status, progress_percent, enrolled_at FROM enrollments WHERE user_id = ${user.id} AND course_id = ${course.id}`;
  return { enrolled: true, enrollment };
}

export default route({
  GET: (req) => (req.query.slug ? details(req) : list(req)),
  POST: (req) => {
    if (req.query.action !== 'enroll' || !req.query.slug) throw new HttpError(404, 'Unknown course action.');
    return enroll(req);
  },
});
