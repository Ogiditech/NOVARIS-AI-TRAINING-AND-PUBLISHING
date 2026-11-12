// npm run check:security   (also runs on GitHub for every push — see .github/workflows/ci.yml)
// Fails if a secret could leak: checks every file tracked by git, plus the built website in dist/
// (run `npm run build` first), which is the only code that ever reaches the browser.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const problems = [];

// 1. Secrets must never be committed.
const SECRET_PATTERNS = [
  [/postgres(?:ql)?:\/\/[^\s'"`:@/]+:[^\s'"`@]+@/i, 'database connection string with a password'],
  [/\bnpg_[A-Za-z0-9]{10,}/, 'Neon database password'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}/, 'GitHub fine-grained token'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/^\s*JWT_SECRET\s*=\s*\S{16,}/m, 'JWT secret value'],
];
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
for (const file of tracked) {
  if (/(^|\/)\.env(\..+)?$/.test(file) && !file.endsWith('.env.example')) problems.push(`${file}: environment file is committed — remove it with "git rm --cached ${file}"`);
  if (!fs.existsSync(file) || fs.statSync(file).size > 2_000_000 || file === 'package-lock.json') continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const [re, what] of SECRET_PATTERNS) if (re.test(text)) problems.push(`${file}: looks like a ${what}`);
}
try {
  execFileSync('git', ['check-ignore', '-q', '.env']);
} catch {
  problems.push('.gitignore: .env is not ignored');
}

// 2. The browser bundle must contain no database access, secrets, password hashes or quiz answers.
const BUNDLE_PATTERNS = [
  [/postgres(?:ql)?:\/\//i, 'a database connection string'],
  [/neon\.tech/i, 'a Neon database host'],
  [/@neondatabase|neondatabase\/serverless/, 'the database driver'],
  [/DATABASE_URL|JWT_SECRET/, 'a server-only setting name'],
  [/password_hash|correct_index/, 'a private database column'],
  [/\$2[aby]\$\d\d\$/, 'a password hash'],
  [/\bnpg_[A-Za-z0-9]{10,}|github_pat_|\bghp_[A-Za-z0-9]{30,}/, 'a secret token'],
];
const dist = 'dist';
if (!fs.existsSync(dist)) problems.push('dist/ not found — run "npm run build" first');
else {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
  for (const file of walk(dist).filter((f) => /\.(js|html|css|json|map|txt)$/.test(f))) {
    const text = fs.readFileSync(file, 'utf8');
    for (const [re, what] of BUNDLE_PATTERNS) if (re.test(text)) problems.push(`${file}: browser code contains ${what}`);
  }
}

// 3. Paid eBook text: manuscripts are never committed, and no locked-chapter sentence reaches the bundle.
const { BOOKS, OUT_DIR, lockedSentences, validateBook } = await import('./build-ebooks.js');
for (const file of tracked) {
  if (/^content\/ebooks\/.+\.(md|docx)$/i.test(file)) problems.push(`${file}: full eBook manuscript is committed — it must stay private (git rm --cached "${file}")`);
}
const bundleText = fs.existsSync(dist)
  ? fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(dist, 'assets', f), 'utf8')).join('\n')
  : '';
const unescape = (s) => s.replace(/\\(["\\/])/g, '$1');
for (const book of BOOKS) {
  const jsonFile = path.join(OUT_DIR, `${book.slug}.json`);
  const built = fs.existsSync(jsonFile) ? JSON.parse(fs.readFileSync(jsonFile, 'utf8')) : null;
  if (built) for (const p of validateBook(built)) problems.push(`${path.relative('.', jsonFile)}: ${p}`);
  if (built?.testBuild && tracked.includes(path.relative('.', jsonFile).replace(/\\/g, '/'))) problems.push(`${book.slug}.json was built from the TEST manuscript and is committed — rebuild from the real one`);
  // Which manuscript produced the JSON? The real one when present, else the test fixture for test builds.
  const manuscript = fs.existsSync(book.source) ? book.source : built?.testBuild ? 'tests/fixtures/sample-ebook.md' : null;
  if (!manuscript || !bundleText) continue;
  const leaks = lockedSentences(book, fs.readFileSync(manuscript, 'utf8')).filter((s) => bundleText.includes(s) || unescape(bundleText).includes(s));
  if (leaks.length) problems.push(`browser bundle contains ${leaks.length} locked sentence(s) of "${book.title}", e.g. "${leaks[0].slice(0, 70)}…"`);
  else console.log(`✓ ${book.title}: ${lockedSentences(book, fs.readFileSync(manuscript, 'utf8')).length} locked sentences checked — none in the browser bundle.`);
}

if (problems.length) {
  console.error(`✗ Security check failed (${problems.length}):\n` + problems.map((p) => `  • ${p}`).join('\n'));
  process.exit(1);
}
console.log(`✓ Security check passed — ${tracked.length} tracked files and the browser bundle are free of secrets.`);
