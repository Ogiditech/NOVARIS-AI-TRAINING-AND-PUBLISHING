// /api/auth/signup · /api/auth/login · /api/auth/logout · /api/auth/me   (rewritten to /api/auth?action=…)
import bcrypt from 'bcryptjs';
import { db } from './_lib/db.js';
import { route, readBody, parse, HttpError } from './_lib/http.js';
import { startSession, endSession, currentUser, publicUser, USER_FIELDS } from './_lib/auth.js';
import { rateLimit } from './_lib/rateLimit.js';
import { signupSchema, loginSchema } from './_lib/schemas.js';
import { safeZone, streaks } from './_lib/learning.js';

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#db2777', '#0891b2', '#059669', '#ea580c', '#4f46e5', '#c026d3'];

async function signup(req, res) {
  await rateLimit(req, 'signup', { limit: 10, windowSeconds: 3600 });
  const input = parse(signupSchema, readBody(req));
  const sql = db();
  const existing = await sql`SELECT 1 FROM users WHERE email = ${input.email}`;
  if (existing.length) throw new HttpError(409, 'An account with this email already exists.', { fieldErrors: { email: 'An account with this email already exists. Try logging in instead.' } });

  const hash = await bcrypt.hash(input.password, 11);
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const rows = await sql.query(
    `INSERT INTO users (email, password_hash, full_name, avatar_color, country, preferred_currency, preferred_language, timezone, weekly_goal_lessons, weekly_goal_minutes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (email) DO NOTHING
     RETURNING ${USER_FIELDS}`,
    [input.email, hash, input.fullName, color, input.country, input.currency, input.language, safeZone(input.timezone), input.weeklyGoalLessons, input.weeklyGoalMinutes],
  );
  if (!rows.length) throw new HttpError(409, 'An account with this email already exists.', { fieldErrors: { email: 'An account with this email already exists. Try logging in instead.' } });
  await startSession(res, rows[0].id);
  res.status(201).json({ user: publicUser(rows[0]) });
}

async function login(req, res) {
  await rateLimit(req, 'login', { limit: 20, windowSeconds: 600 });
  const { email, password } = parse(loginSchema, readBody(req));
  const sql = db();
  const [row] = await sql.query(`SELECT ${USER_FIELDS}, password_hash, is_demo FROM users WHERE email = $1`, [email]);
  const valid = row && !row.is_demo && row.password_hash.startsWith('$2') && (await bcrypt.compare(password, row.password_hash));
  if (!valid) throw new HttpError(401, 'That email and password do not match. Please try again.', { fieldErrors: { password: 'That email and password do not match.' } });
  await startSession(res, row.id);
  return { user: publicUser(row) };
}

async function me(req) {
  const user = await currentUser(req);
  if (!user) return { user: null };
  const streak = await streaks(user.id, user.timezone);
  return { user: { ...publicUser(user), streak: streak.current, bestStreak: streak.best } };
}

export default route({
  GET: (req) => {
    if (req.query.action !== 'me') throw new HttpError(404, 'Unknown auth action.');
    return me(req);
  },
  POST: (req, res) => {
    switch (req.query.action) {
      case 'signup': return signup(req, res);
      case 'login': return login(req, res);
      case 'logout': endSession(res); return { ok: true };
      default: throw new HttpError(404, 'Unknown auth action.');
    }
  },
});
