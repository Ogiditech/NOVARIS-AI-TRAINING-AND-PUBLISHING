// npm run db:reset -- --yes
// DANGER: drops every Novaris table (all users, progress and purchases) and rebuilds from schema.sql + seed.sql.
import { Pool } from '@neondatabase/serverless';
import { TABLES, requireDatabaseUrl, runFile, printCounts } from './setup.mjs';

if (!process.argv.includes('--yes')) {
  console.error('\nThis deletes ALL data in the Novaris database (users, progress, purchases) and rebuilds it.');
  console.error('If you are sure, run:  npm run db:reset -- --yes\n');
  process.exit(1);
}

const pool = new Pool({ connectionString: requireDatabaseUrl() });
try {
  await pool.query(`DROP TABLE IF EXISTS ${[...TABLES, 'rate_limits'].join(', ')} CASCADE`);
  console.log('✓ dropped all tables');
  await runFile(pool, 'schema.sql');
  await runFile(pool, 'seed.sql');
  await printCounts(pool);
} catch (err) {
  console.error('\n✗ Reset failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
