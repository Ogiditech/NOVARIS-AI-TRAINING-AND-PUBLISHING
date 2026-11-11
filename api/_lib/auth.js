// Sessions: a signed JWT in an httpOnly, SameSite=Lax cookie (Secure in production), valid for 7 days.
import { SignJWT, jwtVerify } from 'jose';
import { db } from './db.js';
import { HttpError, unauthorized } from './http.js';

const COOKIE = 'novaris_session';
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new HttpError(500, 'Server login is not configured (JWT_SECRET missing).');
  return new TextEncoder().encode(s);
}

const isProduction = () => process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

function cookie(value, maxAge) {
  return [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`, isProduction() ? 'Secure' : null].filter(Boolean).join('; ');
}

export async function startSession(res, userId) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(String(userId)).setIssuedAt().setExpirationTime('7d').sign(secret());
  res.setHeader('Set-Cookie', cookie(token, MAX_AGE));
}

export function endSession(res) {
  res.setHeader('Set-Cookie', cookie('', 0));
}

function readCookie(req) {
  const header = req.headers.cookie || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : null;
}

export async function sessionUserId(req) {
  const token = readCookie(req);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    const id = Number(payload.sub);
    return Number.isSafeInteger(id) ? id : null;
  } catch {
    return null;
  }
}

// Columns that are safe to send to the browser (never password_hash).
export const USER_FIELDS = 'id, email, full_name, avatar_color, country, preferred_currency, preferred_language, timezone, plan, weekly_goal_lessons, weekly_goal_minutes, created_at';

export function publicUser(row) {
  if (!row) return null;
  return {
    id: Number(row.id), email: row.email, fullName: row.full_name, firstName: row.full_name.split(' ')[0], avatarColor: row.avatar_color,
    country: row.country, currency: row.preferred_currency, language: row.preferred_language, timezone: row.timezone, plan: row.plan,
    weeklyGoalLessons: row.weekly_goal_lessons, weeklyGoalMinutes: row.weekly_goal_minutes, createdAt: row.created_at,
  };
}

export async function currentUser(req) {
  const id = await sessionUserId(req);
  if (!id) return null;
  const sql = db();
  const rows = await sql`SELECT id, email, full_name, avatar_color, country, preferred_currency, preferred_language, timezone, plan, weekly_goal_lessons, weekly_goal_minutes, created_at FROM users WHERE id = ${id} AND NOT is_demo`;
  return rows[0] || null;
}

export async function requireUser(req) {
  const user = await currentUser(req);
  if (!user) throw unauthorized();
  return user;
}
