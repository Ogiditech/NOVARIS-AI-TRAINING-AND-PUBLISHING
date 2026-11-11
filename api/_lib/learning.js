// Shared learning statistics (streaks, weekly activity).
import { db } from './db.js';

export function safeZone(tz) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

// Consecutive days (in the learner's time zone) with at least one completed lesson.
export async function streaks(userId, timezone) {
  const sql = db();
  const tz = safeZone(timezone);
  const rows = await sql`
    SELECT DISTINCT (completed_at AT TIME ZONE ${tz})::date::text AS d
    FROM lesson_progress WHERE user_id = ${userId} AND completed AND completed_at IS NOT NULL
    ORDER BY d DESC LIMIT 400`;
  const [{ today }] = await sql`SELECT (now() AT TIME ZONE ${tz})::date::text AS today`;
  const days = rows.map((r) => r.d);
  const toNum = (d) => Math.round(Date.parse(`${d}T00:00:00Z`) / 86400000);
  const todayN = toNum(today);

  let current = 0;
  if (days.length && todayN - toNum(days[0]) <= 1) {
    current = 1;
    for (let i = 1; i < days.length && toNum(days[i - 1]) - toNum(days[i]) === 1; i++) current++;
  }
  let best = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && toNum(days[i - 1]) - toNum(days[i]) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return { current, best: Math.max(best, current) };
}

export const money = (v) => (v == null ? 0 : Number(v));
