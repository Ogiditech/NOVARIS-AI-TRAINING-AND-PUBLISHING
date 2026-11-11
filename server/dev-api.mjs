// Local stand-in for Vercel's /api runtime.
// Loads the SAME files in /api and applies the SAME rewrites from vercel.json, so nothing changes at deploy time.
// Started by `npm run dev` (together with Vite, which proxies /api here). No Vercel login needed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fork } from 'node:child_process';
import express from 'express';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Supervisor: restart the API server only when files in /api or /server change (not node_modules).
if (!process.env.NOVARIS_API_CHILD) {
  let child;
  let timer;
  // Windows (and antivirus scanners) can report "changes" when a file is only read, so restart only when
  // the file's modification time really changed.
  const mtimes = new Map();
  const mtime = (file) => { try { return fs.statSync(path.join(root, file)).mtimeMs; } catch { return 0; } };
  const start = () => { child = fork(fileURLToPath(import.meta.url), { env: { ...process.env, NOVARIS_API_CHILD: '1' }, stdio: 'inherit' }); };
  const restart = (file) => {
    const now = mtime(file);
    if (mtimes.has(file) && mtimes.get(file) === now) return;
    const firstSeen = !mtimes.has(file);
    mtimes.set(file, now);
    if (firstSeen && now < startedAt) return; // unchanged since the server started
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`[api] ${file} changed — restarting`);
      child.once('exit', start);
      child.kill();
    }, 150);
  };
  const startedAt = Date.now();
  for (const dir of ['api', 'server']) fs.watch(path.join(root, dir), { recursive: true }, (_, file) => file && /\.(m?js|json)$/.test(file) && restart(`${dir}/${file.replace(/\\/g, '/')}`));
  fs.watch(path.join(root, 'vercel.json'), () => restart('vercel.json'));
  start();
  process.on('SIGINT', () => { child.kill(); process.exit(0); });
  process.on('SIGTERM', () => { child.kill(); process.exit(0); });
} else {
  await main();
}

async function main() {
const PORT = Number(process.env.API_PORT || 3001);

if (!process.env.JWT_SECRET) console.warn('[api] JWT_SECRET is missing from .env — login will not work.');
if (!process.env.DATABASE_URL) console.warn('[api] DATABASE_URL is missing from .env — copy it from Neon: project "novaris" → Connect.');

// vercel.json rewrites → matchers. ":name" segments become captured params.
const rewrites = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')).rewrites
  .filter((r) => r.source.startsWith('/api/'))
  .map((r) => {
    const names = [];
    const pattern = r.source.replace(/:([A-Za-z]+)/g, (_, n) => { names.push(n); return '([^/]+)'; });
    return { regex: new RegExp(`^${pattern}/?$`), names, destination: r.destination };
  });

function resolve(pathname) {
  const direct = pathname.match(/^\/api\/([a-z-]+)\/?$/);
  if (direct && fs.existsSync(path.join(root, 'api', `${direct[1]}.js`))) return { file: direct[1], query: {} };
  for (const r of rewrites) {
    const m = pathname.match(r.regex);
    if (!m) continue;
    let dest = r.destination;
    r.names.forEach((n, i) => { dest = dest.replaceAll(`:${n}`, encodeURIComponent(decodeURIComponent(m[i + 1]))); });
    const url = new URL(dest, 'http://local');
    return { file: url.pathname.replace(/^\/api\//, ''), query: Object.fromEntries(url.searchParams) };
  }
  return null;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));

app.all('/api/*', async (req, res) => {
  const target = resolve(req.path);
  if (!target) return res.status(404).json({ error: 'Not found.' });
  try {
    const mod = await import(pathToFileURL(path.join(root, 'api', `${target.file}.js`)).href);
    req.query = { ...req.query, ...target.query };
    await mod.default(req, res);
  } catch (err) {
    console.error(`[api] ${req.method} ${req.path} crashed:`, err);
    if (!res.headersSent) res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
  }
});

const server = app.listen(PORT, () => console.log(`[api] /api functions ready on http://localhost:${PORT} (proxied through Vite)`));
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[api] Port ${PORT} is already in use — another Novaris API server is probably still running.\n[api] Close the other terminal (or restart your computer) and run "npm run dev" again.\n`);
    process.exit(1);
  }
  throw err;
});
}
