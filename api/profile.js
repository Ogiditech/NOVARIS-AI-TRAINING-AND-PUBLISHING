// /api/profile         GET   profile, stats, badges, certificates      PATCH  update profile
// /api/library         GET   My Library: courses, eBooks, certificates, classes, products  (→ /api/profile?op=library)
import { db } from './_lib/db.js';
import { route, readBody, parse } from './_lib/http.js';
import { requireUser, publicUser, USER_FIELDS } from './_lib/auth.js';
import { profileSchema } from './_lib/schemas.js';
import { safeZone, streaks } from './_lib/learning.js';

async function profile(req) {
  const user = await requireUser(req);
  const sql = db();
  const [[s], streak, certificates] = await Promise.all([
    sql`
      SELECT
        (SELECT count(*)::int FROM enrollments WHERE user_id = ${user.id}) AS enrolled,
        (SELECT count(*)::int FROM enrollments WHERE user_id = ${user.id} AND status = 'completed') AS completed,
        (SELECT count(*)::int FROM lesson_progress WHERE user_id = ${user.id} AND completed) AS lessons,
        (SELECT COALESCE(sum(minutes_spent), 0)::int FROM lesson_progress WHERE user_id = ${user.id} AND completed) AS minutes,
        (SELECT count(*)::int FROM lesson_progress WHERE user_id = ${user.id} AND quiz_score = 100) AS perfect_quizzes,
        (SELECT count(*)::int FROM ebook_purchases WHERE user_id = ${user.id}) AS ebooks,
        (SELECT count(*)::int FROM product_purchases WHERE user_id = ${user.id}) AS products,
        (SELECT count(*)::int FROM class_bookings WHERE user_id = ${user.id}) AS classes,
        (SELECT count(*)::int FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = ${user.id} AND e.status = 'completed' AND c.category = 'AI Agents') AS agents_completed,
        (SELECT count(*)::int FROM (
           SELECT c.language FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = ${user.id}
           UNION ALL SELECT lc.language FROM class_bookings b JOIN live_classes lc ON lc.id = b.class_id WHERE b.user_id = ${user.id}
         ) x WHERE x.language <> 'English') AS other_language`,
    streaks(user.id, user.timezone),
    sql`SELECT ce.certificate_code, ce.issued_at, c.title AS course_title, c.slug AS course_slug, c.cover_gradient
        FROM certificates ce JOIN courses c ON c.id = ce.course_id WHERE ce.user_id = ${user.id} ORDER BY ce.issued_at DESC`,
  ]);
  const badges = [
    { id: 'b1', icon: 'Sparkles', earned: s.lessons >= 1 },
    { id: 'b2', icon: 'Flame', earned: streak.best >= 7 },
    { id: 'b3', icon: 'Target', earned: s.perfect_quizzes >= 3 },
    { id: 'b4', icon: 'Globe', earned: s.other_language >= 1 },
    { id: 'b5', icon: 'BookOpen', earned: s.ebooks >= 3 },
    { id: 'b6', icon: 'Bot', earned: s.agents_completed >= 1 },
    { id: 'b7', icon: 'Trophy', earned: streak.best >= 30 },
    { id: 'b8', icon: 'Video', earned: s.classes >= 3 },
  ];
  return { user: publicUser(user), stats: { ...s, streak: streak.current, bestStreak: streak.best, hours: Math.round((s.minutes / 60) * 10) / 10 }, badges, certificates };
}

async function update(req) {
  const user = await requireUser(req);
  const input = parse(profileSchema, readBody(req));
  const [row] = await db().query(
    `UPDATE users SET
       full_name = COALESCE($2, full_name), country = COALESCE($3, country), preferred_currency = COALESCE($4, preferred_currency),
       preferred_language = COALESCE($5, preferred_language), timezone = COALESCE($6, timezone), plan = COALESCE($7, plan),
       weekly_goal_lessons = COALESCE($8, weekly_goal_lessons), weekly_goal_minutes = COALESCE($9, weekly_goal_minutes)
     WHERE id = $1 RETURNING ${USER_FIELDS}`,
    [user.id, input.fullName ?? null, input.country ?? null, input.currency ?? null, input.language ?? null,
      input.timezone ? safeZone(input.timezone) : null, input.plan ?? null, input.weeklyGoalLessons ?? null, input.weeklyGoalMinutes ?? null],
  );
  return { user: publicUser(row) };
}

async function library(req) {
  const user = await requireUser(req);
  const sql = db();
  const [courses, ebooks, certificates, classes, products] = await Promise.all([
    sql`
      SELECT c.slug, c.title, c.category, c.level, c.instructor_name, c.cover_gradient, e.status, e.progress_percent, e.enrolled_at, e.completed_at,
             (SELECT count(*)::int FROM lessons l WHERE l.course_id = c.id) AS lessons_count,
             (SELECT certificate_code FROM certificates ce WHERE ce.user_id = e.user_id AND ce.course_id = c.id) AS certificate_code
      FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = ${user.id} ORDER BY e.enrolled_at DESC`,
    sql`
      SELECT b.id, b.slug, b.title, b.subtitle, b.author_name, b.author_country, b.page_count, b.cover_gradient, p.purchased_at
      FROM ebook_purchases p JOIN ebooks b ON b.id = p.ebook_id WHERE p.user_id = ${user.id} ORDER BY p.purchased_at DESC`,
    sql`
      SELECT ce.certificate_code, ce.issued_at, c.title AS course_title, c.slug AS course_slug, c.cover_gradient
      FROM certificates ce JOIN courses c ON c.id = ce.course_id WHERE ce.user_id = ${user.id} ORDER BY ce.issued_at DESC`,
    sql`
      SELECT c.id, c.title, c.instructor_name, c.topic, c.language, c.level, c.start_time, c.duration_minutes, b.booked_at
      FROM class_bookings b JOIN live_classes c ON c.id = b.class_id WHERE b.user_id = ${user.id} ORDER BY c.start_time`,
    sql`
      SELECT d.id, d.slug, d.title, d.subtitle, d.category, d.product_type, d.level, d.format, d.file_size, d.page_or_item_count,
             d.price_usd::float8 AS price_usd, d.cover_gradient, p.purchased_at
      FROM product_purchases p JOIN digital_products d ON d.id = p.product_id WHERE p.user_id = ${user.id} ORDER BY p.purchased_at DESC`,
  ]);
  return {
    courses,
    ebooks: ebooks.map((b) => ({ ...b, id: Number(b.id) })),
    certificates,
    classes: classes.map((c) => ({ ...c, id: Number(c.id) })),
    products: products.map((p) => ({ ...p, id: Number(p.id) })),
  };
}

export default route({
  GET: (req) => (req.query.op === 'library' ? library(req) : profile(req)),
  PATCH: update,
});
