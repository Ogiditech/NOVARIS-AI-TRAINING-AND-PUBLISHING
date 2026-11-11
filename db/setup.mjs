// npm run db:setup — creates tables (schema.sql) then loads sample data (seed.sql).
// Safe to run again: nothing is duplicated.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool, neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = globalThis.WebSocket;
const here = path.dirname(fileURLToPath(import.meta.url));

export const TABLES = ['users', 'courses', 'lessons', 'quiz_questions', 'enrollments', 'lesson_progress', 'certificates', 'ebooks', 'ebook_purchases', 'live_classes', 'class_bookings', 'manuscript_submissions', 'contact_messages', 'digital_products', 'product_bundles', 'product_purchases'];

export function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    console.error('\nDATABASE_URL is missing from .env.\nCopy it from https://console.neon.tech → project "novaris" → Connect (keep "Connection pooling" on).\n');
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

export async function runFile(pool, file) {
  const text = fs.readFileSync(path.join(here, file), 'utf8');
  const started = Date.now();
  await pool.query(text);
  console.log(`✓ ${file} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
}

export async function printCounts(pool) {
  const parts = TABLES.map((t) => `SELECT '${t}' AS table_name, count(*)::int AS rows FROM ${t}`).join(' UNION ALL ');
  const { rows } = await pool.query(parts);
  console.log('\nRow counts');
  console.table(Object.fromEntries(rows.map((r) => [r.table_name, r.rows])));
}

async function main() {
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  try {
    await runFile(pool, 'schema.sql');
    await runFile(pool, 'seed.sql');
    await printCounts(pool);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => { console.error('\n✗ Database setup failed:', err.message); process.exit(1); });
}
