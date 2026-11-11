// /api/lessons?course=slug  GET   lessons + notes + quiz questions (never the answers)
// /api/progress             POST  { lessonId, completed, minutes? }
// /api/quiz                 POST  { lessonId, answers: [index, …] }  — checked on the server
// (all rewritten to /api/learning?op=…)
import crypto from 'node:crypto';
import { db } from './_lib/db.js';
import { route, readBody, parse, notFound, HttpError } from './_lib/http.js';
import { sessionUserId, requireUser } from './_lib/auth.js';
import { progressSchema, quizSchema } from './_lib/schemas.js';

async function lessons(req) {
  const userId = await sessionUserId(req);
  const sql = db();
  const [course] = await sql`
    SELECT c.id, c.slug, c.title, c.category, c.level, c.language, c.instructor_name, c.cover_gradient, c.price_usd::float8 AS price_usd,
           e.status AS enrollment_status, e.progress_percent
    FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = ${userId}
    WHERE c.slug = ${req.query.course || ''}`;
  if (!course) throw notFound('That course');
  const enrolled = Boolean(course.enrollment_status);
  const rows = await sql`
    SELECT l.id, l.title, l.order_index, l.duration_minutes, l.video_url, l.notes, l.is_free_preview,
           COALESCE(p.completed, false) AS completed, p.quiz_score
    FROM lessons l LEFT JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = ${userId}
    WHERE l.course_id = ${course.id} ORDER BY l.order_index`;
  const accessibleIds = rows.filter((l) => enrolled || l.is_free_preview).map((l) => l.id);
  const questions = accessibleIds.length
    ? await sql`SELECT id, lesson_id, question, options FROM quiz_questions WHERE lesson_id = ANY(${accessibleIds}) ORDER BY lesson_id, id`
    : [];
  const [cert] = userId ? await sql`SELECT certificate_code FROM certificates WHERE user_id = ${userId} AND course_id = ${course.id}` : [];

  return {
    course: { ...course, id: Number(course.id), enrolled, progress_percent: course.progress_percent ?? 0 },
    loggedIn: Boolean(userId),
    certificateCode: cert?.certificate_code || null,
    lessons: rows.map((l) => {
      const open = enrolled || l.is_free_preview;
      return {
        id: Number(l.id), title: l.title, order_index: l.order_index, duration_minutes: l.duration_minutes, is_free_preview: l.is_free_preview,
        completed: l.completed, quiz_score: l.quiz_score, locked: !open,
        video_url: open ? l.video_url : null,
        notes: open ? l.notes : null,
        questions: open ? questions.filter((q) => q.lesson_id === l.id).map((q) => ({ id: Number(q.id), question: q.question, options: q.options })) : [],
      };
    }),
  };
}

async function lessonWithEnrollment(sql, lessonId, userId) {
  const [row] = await sql`
    SELECT l.id, l.course_id, l.duration_minutes, l.is_free_preview, e.id AS enrollment_id
    FROM lessons l LEFT JOIN enrollments e ON e.course_id = l.course_id AND e.user_id = ${userId}
    WHERE l.id = ${lessonId}`;
  if (!row) throw notFound('That lesson');
  return row;
}

function certificateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  return `NOV-${new Date().getUTCFullYear()}-${Array.from(bytes, (b) => chars[b % chars.length]).join('')}`;
}

async function issueCertificate(sql, userId, courseId) {
  for (let attempt = 0; attempt < 5; attempt++) {
    await sql`INSERT INTO certificates (user_id, course_id, certificate_code) VALUES (${userId}, ${courseId}, ${certificateCode()}) ON CONFLICT DO NOTHING`;
    const [cert] = await sql`SELECT certificate_code FROM certificates WHERE user_id = ${userId} AND course_id = ${courseId}`;
    if (cert) return cert.certificate_code;
  }
  throw new HttpError(500, 'Could not create your certificate. Please try again.');
}

async function progress(req) {
  const user = await requireUser(req);
  const { lessonId, completed, minutes } = parse(progressSchema, readBody(req));
  const sql = db();
  const lesson = await lessonWithEnrollment(sql, lessonId, user.id);
  if (!lesson.enrollment_id) throw new HttpError(403, 'Enroll in this course to save your progress.', { code: 'not_enrolled' });

  const spent = minutes ?? (completed ? lesson.duration_minutes : 0);
  await sql`
    INSERT INTO lesson_progress (user_id, lesson_id, completed, minutes_spent, completed_at)
    VALUES (${user.id}, ${lessonId}, ${completed}, ${spent}, ${completed ? new Date() : null})
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
      completed = EXCLUDED.completed,
      minutes_spent = GREATEST(lesson_progress.minutes_spent, EXCLUDED.minutes_spent),
      completed_at = CASE WHEN EXCLUDED.completed THEN COALESCE(lesson_progress.completed_at, now()) ELSE NULL END`;

  const [{ total, done }] = await sql`
    SELECT count(*)::int AS total, count(p.id) FILTER (WHERE p.completed)::int AS done
    FROM lessons l LEFT JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = ${user.id}
    WHERE l.course_id = ${lesson.course_id}`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const finished = total > 0 && done === total;
  const [before] = await sql`SELECT status FROM enrollments WHERE id = ${lesson.enrollment_id}`;
  await sql`
    UPDATE enrollments SET progress_percent = ${pct},
      status = ${finished ? 'completed' : 'active'},
      completed_at = CASE WHEN ${finished} THEN COALESCE(completed_at, now()) ELSE NULL END
    WHERE id = ${lesson.enrollment_id}`;
  const code = finished ? await issueCertificate(sql, user.id, lesson.course_id) : null;

  return { lessonId, completed, progressPercent: pct, completedLessons: done, totalLessons: total, courseCompleted: finished, justCompleted: finished && before.status !== 'completed', certificateCode: code };
}

async function quiz(req) {
  const { lessonId, answers } = parse(quizSchema, readBody(req));
  const userId = await sessionUserId(req);
  const sql = db();
  const lesson = await lessonWithEnrollment(sql, lessonId, userId);
  const enrolled = Boolean(lesson.enrollment_id);
  if (!lesson.is_free_preview && !userId) throw new HttpError(401, 'Please log in to take this quiz.', { code: 'unauthorized' });
  if (!lesson.is_free_preview && !enrolled) throw new HttpError(403, 'Enroll in this course to take this quiz.', { code: 'not_enrolled' });

  const questions = await sql`SELECT id, correct_index, explanation FROM quiz_questions WHERE lesson_id = ${lessonId} ORDER BY id`;
  if (answers.length !== questions.length) throw new HttpError(400, 'Please answer every question.');
  // The right answer (and its explanation, which gives it away) is only returned for questions the
  // learner already got right — otherwise one throwaway attempt would reveal the whole answer key.
  const results = questions.map((q, i) => {
    const correct = answers[i] === q.correct_index;
    return { questionId: Number(q.id), chosen: answers[i], correct, ...(correct && { correctIndex: q.correct_index, explanation: q.explanation }) };
  });
  const score = Math.round((results.filter((r) => r.correct).length / results.length) * 100);

  let saved = false;
  if (userId && enrolled) {
    await sql`
      INSERT INTO lesson_progress (user_id, lesson_id, quiz_score) VALUES (${userId}, ${lessonId}, ${score})
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET quiz_score = EXCLUDED.quiz_score`;
    saved = true;
  }
  return { results, score, passed: score >= 67, saved };
}

export default route({
  GET: (req) => {
    if (req.query.op !== 'lessons') throw new HttpError(404, 'Unknown learning action.');
    return lessons(req);
  },
  POST: (req) => {
    if (req.query.op === 'progress') return progress(req);
    if (req.query.op === 'quiz') return quiz(req);
    throw new HttpError(404, 'Unknown learning action.');
  },
});
