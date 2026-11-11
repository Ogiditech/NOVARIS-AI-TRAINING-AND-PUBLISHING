// /api/dashboard — everything the learner dashboard needs, for the logged-in user only.
import { db } from './_lib/db.js';
import { route } from './_lib/http.js';
import { requireUser, publicUser } from './_lib/auth.js';
import { safeZone, streaks } from './_lib/learning.js';

export default route({
  GET: async (req) => {
    const user = await requireUser(req);
    const tz = safeZone(user.timezone);
    const sql = db();

    const [weekly, [week], [quizzes], [current], [nextBooked], [nextOpen], recommended, [totals], streak] = await Promise.all([
      sql`
        WITH days AS (
          SELECT generate_series((now() AT TIME ZONE ${tz})::date - 6, (now() AT TIME ZONE ${tz})::date, interval '1 day')::date AS d
        )
        SELECT days.d::text AS date, COALESCE(sum(p.minutes_spent), 0)::int AS minutes, count(p.id)::int AS lessons
        FROM days LEFT JOIN lesson_progress p
          ON p.user_id = ${user.id} AND p.completed AND (p.completed_at AT TIME ZONE ${tz})::date = days.d
        GROUP BY days.d ORDER BY days.d`,
      sql`
        SELECT count(*)::int AS lessons, COALESCE(sum(minutes_spent), 0)::int AS minutes
        FROM lesson_progress
        WHERE user_id = ${user.id} AND completed
          AND (completed_at AT TIME ZONE ${tz}) >= date_trunc('week', now() AT TIME ZONE ${tz})`,
      sql`SELECT count(*) FILTER (WHERE quiz_score >= 67)::int AS passed, count(quiz_score)::int AS taken FROM lesson_progress WHERE user_id = ${user.id}`,
      sql`
        SELECT c.id, c.slug, c.title, c.category, c.instructor_name, c.cover_gradient, e.progress_percent,
               (SELECT count(*)::int FROM lessons l WHERE l.course_id = c.id) AS total_lessons,
               (SELECT count(*)::int FROM lessons l JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = e.user_id AND p.completed WHERE l.course_id = c.id) AS done_lessons,
               (SELECT json_build_object('id', l.id, 'title', l.title, 'order_index', l.order_index, 'duration_minutes', l.duration_minutes)
                  FROM lessons l LEFT JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = e.user_id
                  WHERE l.course_id = c.id AND NOT COALESCE(p.completed, false) ORDER BY l.order_index LIMIT 1) AS next_lesson
        FROM enrollments e JOIN courses c ON c.id = e.course_id
        WHERE e.user_id = ${user.id} AND e.status = 'active'
        ORDER BY GREATEST(e.enrolled_at, COALESCE((SELECT max(p.completed_at) FROM lesson_progress p JOIN lessons l ON l.id = p.lesson_id WHERE p.user_id = e.user_id AND l.course_id = c.id), e.enrolled_at)) DESC
        LIMIT 1`,
      sql`
        SELECT c.id, c.title, c.instructor_name, c.language, c.start_time, c.duration_minutes, true AS booked
        FROM class_bookings b JOIN live_classes c ON c.id = b.class_id
        WHERE b.user_id = ${user.id} AND c.start_time + make_interval(mins => c.duration_minutes) > now()
        ORDER BY c.start_time LIMIT 1`,
      sql`
        SELECT c.id, c.title, c.instructor_name, c.language, c.start_time, c.duration_minutes, false AS booked
        FROM live_classes c WHERE c.start_time > now() ORDER BY c.start_time LIMIT 1`,
      sql`
        SELECT c.slug, c.title, c.subtitle, c.category, c.level, c.language, c.duration_minutes, c.price_usd::float8 AS price_usd, c.rating::float8 AS rating,
               c.rating_count, c.instructor_name, c.cover_gradient, (SELECT count(*)::int FROM lessons l WHERE l.course_id = c.id) AS lessons_count
        FROM courses c WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.user_id = ${user.id})
        ORDER BY c.is_featured DESC, c.rating DESC, c.rating_count DESC LIMIT 3`,
      sql`
        SELECT (SELECT count(*)::int FROM enrollments WHERE user_id = ${user.id}) AS enrolled,
               (SELECT count(*)::int FROM enrollments WHERE user_id = ${user.id} AND status = 'completed') AS completed,
               (SELECT count(*)::int FROM certificates WHERE user_id = ${user.id}) AS certificates,
               (SELECT COALESCE(sum(minutes_spent), 0)::int FROM lesson_progress WHERE user_id = ${user.id} AND completed) AS minutes`,
      streaks(user.id, tz),
    ]);

    return {
      user: publicUser(user),
      weekly,
      week: { lessons: week.lessons, minutes: week.minutes, goalLessons: user.weekly_goal_lessons, goalMinutes: user.weekly_goal_minutes },
      quizzes,
      streak,
      continueCourse: current ? { ...current, id: Number(current.id) } : null,
      nextClass: nextBooked || nextOpen || null,
      recommended,
      totals,
    };
  },
});
