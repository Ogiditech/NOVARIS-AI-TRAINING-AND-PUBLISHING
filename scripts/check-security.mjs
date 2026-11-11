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

if (problems.length) {
  console.error(`✗ Security check failed (${problems.length}):\n` + problems.map((p) => `  • ${p}`).join('\n'));
  process.exit(1);
}
console.log(`✓ Security check passed — ${tracked.length} tracked files and the browser bundle are free of secrets.`);
