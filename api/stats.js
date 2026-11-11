// /api/stats — public numbers for the landing page.
import { db } from './_lib/db.js';
import { route } from './_lib/http.js';

export default route({
  GET: async () => {
    const sql = db();
    const [counts] = await sql`
      SELECT
        (SELECT count(*)::int FROM users) AS learners,
        (SELECT count(DISTINCT country)::int FROM users) AS countries,
        (SELECT count(*)::int FROM enrollments WHERE status = 'completed') AS completed,
        (SELECT count(*)::int FROM ebooks) AS ebooks,
        (SELECT count(*)::int FROM courses) AS courses,
        (SELECT count(*)::int FROM digital_products) AS products,
        (SELECT count(DISTINCT user_id)::int FROM lesson_progress WHERE completed_at > now() - interval '7 days') AS active_this_week`;
    const countries = await sql`SELECT country, count(*)::int AS learners FROM users GROUP BY country ORDER BY learners DESC, country`;
    const featured = await sql`
      SELECT c.slug, c.title, c.subtitle, c.category, c.level, c.language, c.duration_minutes, c.price_usd::float8 AS price_usd, c.rating::float8 AS rating, c.rating_count,
             c.instructor_name, c.cover_gradient, (SELECT count(*)::int FROM lessons l WHERE l.course_id = c.id) AS lessons_count
      FROM courses c WHERE c.is_featured ORDER BY c.rating DESC, c.rating_count DESC LIMIT 4`;
    const bestsellers = await sql`
      SELECT slug, title, subtitle, author_name, author_country, category, page_count, price_usd::float8 AS price_usd, cover_gradient
      FROM ebooks WHERE is_bestseller ORDER BY published_at DESC LIMIT 3`;
    return {
      learners: counts.learners, countries: counts.countries, completed: counts.completed, ebooks: counts.ebooks,
      courses: counts.courses, products: counts.products, activeThisWeek: counts.active_this_week,
      countryList: countries, featured, bestsellers,
    };
  },
});
