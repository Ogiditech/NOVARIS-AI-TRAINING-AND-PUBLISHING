// npm run db:refresh-classes
// The sample live classes are dated "this week and next" from the day the database was seeded.
// This moves every class that has already finished forward in two-week steps (same weekday and time)
// so the demo schedule always shows upcoming classes. Real learners' bookings for the old dates are
// removed; demo learners keep theirs so "seats left" still looks realistic.
import { Pool } from '@neondatabase/serverless';
import { requireDatabaseUrl } from './setup.mjs';

const pool = new Pool({ connectionString: requireDatabaseUrl() });
try {
  await pool.query('BEGIN');
  const { rows: moved } = await pool.query(`
    UPDATE live_classes
    SET start_time = start_time + make_interval(days => 14 * ceil(extract(epoch FROM (now() - start_time)) / (14 * 86400))::int)
    WHERE start_time + make_interval(mins => duration_minutes) < now()
    RETURNING id, title, start_time`);
  if (moved.length) {
    await pool.query(
      'DELETE FROM class_bookings b USING users u WHERE b.user_id = u.id AND NOT u.is_demo AND b.class_id = ANY($1)',
      [moved.map((r) => r.id)],
    );
  }
  await pool.query('COMMIT');
  if (!moved.length) console.log('✓ All live classes are still upcoming — nothing to move.');
  else {
    console.log(`✓ Moved ${moved.length} finished class(es) forward:`);
    for (const r of moved) console.log(`  • ${r.title} → ${new Date(r.start_time).toUTCString()}`);
  }
} catch (err) {
  await pool.query('ROLLBACK').catch(() => {});
  console.error('✗ Could not refresh classes:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
