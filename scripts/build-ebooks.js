// npm run build:ebooks  (runs automatically before `npm run dev` and `npm run build`, so Vercel runs it on every deploy)
//
// Turns a full manuscript (content/ebooks/<slug>.md) into the JSON the app ships to the browser:
//   • FREE sections keep their full Markdown.
//   • LOCKED sections keep only their title and a 2-sentence teaser — never the full text.
// The full .md files are git-ignored (the GitHub repo is public), so on Vercel the source is absent and the
// committed JSON is used as-is after it passes the same safety checks. The script refuses to write (and fails
// the build) if any locked text beyond the teaser would end up in the output.
//
// Teasers: by default the first two sentences of a locked section. To choose your own, put
//   <!-- teaser: Your two sentences here. -->
// anywhere inside that section of the .md file.
//
// Options: --source <file.md> uses a different manuscript (used by the tests), --slug <slug> builds one book.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const OUT_DIR = path.join(ROOT, 'src', 'data', 'ebooks');

export const BOOKS = [
  {
    slug: 'ai-for-business',
    source: 'content/ebooks/ai-for-business.md',
    title: 'AI for Business',
    subtitle: 'A Practical Guide to Saving Time, Winning Customers and Growing with AI',
    author: 'Samuel Gideon Omurok',
    publisher: 'Novaris AI Training and Publishing',
    edition: 'First edition, November 2026',
    price: 9.99,
    currency: 'USD',
    status: 'coming-soon',
    category: 'AI for Business',
    cover: ['#6d28d9', '#c2780a'],
    // Sections readable for free. Everything else is locked.
    free: [/^a note from the author\b/i, /^introduction\b/i, /^chapter\s*(1|one)\b(?!\d)/i],
    // Optional hand-picked teasers, keyed by section title, e.g. teasers: { 'Extras': '…' }.
    // None set: every locked section uses its first two sentences (the author bio teaser
    // intentionally shows birth year, birthplace and schools, at the author's request).
  },
  {
    slug: 'ai-for-beginners',
    source: 'content/ebooks/ai-for-beginners.md',
    title: 'AI for Beginners',
    subtitle: 'A Novaris AI Training and Publishing Guide',
    author: 'Samuel Gideon Omurok',
    publisher: 'Novaris AI Training and Publishing',
    edition: 'First edition, November 2026',
    price: 7.99,
    currency: 'USD',
    status: 'coming-soon',
    category: 'AI Basics',
    cover: ['#1d4ed8', '#0d9488'],
    free: [/^copyright\b/i, /^introduction\b/i, /^chapter\s*(1|one)\b(?!\d)/i],
  },
  {
    slug: 'ai-for-job-seekers',
    source: 'content/ebooks/ai-for-job-seekers.md',
    title: 'AI for Job Seekers',
    subtitle: 'A Novaris AI Training and Publishing Guide',
    author: 'Samuel Gideon Omurok',
    publisher: 'Novaris AI Training and Publishing',
    edition: 'First edition, November 2026',
    price: 7.99,
    currency: 'USD',
    status: 'coming-soon',
    category: 'AI Basics',
    cover: ['#047857', '#0e7490'],
    free: [/^introduction\b/i, /^chapter\s*(1|one)\b(?!\d)/i],
  },
  {
    slug: 'prompt-engineering-for-everyone',
    source: 'content/ebooks/prompt-engineering-for-everyone.md',
    title: 'Prompt Engineering for Everyone',
    subtitle: 'A Novaris AI Training and Publishing Guide',
    author: 'Samuel Gideon Omurok',
    publisher: 'Novaris AI Training and Publishing',
    edition: 'First edition, November 2026',
    price: 9.99,
    currency: 'USD',
    status: 'coming-soon',
    category: 'Prompt Engineering',
    cover: ['#9333ea', '#db2777'],
    free: [/^introduction\b/i, /^chapter\s*(1|one)\b(?!\d)/i],
    skip: [/^contents$/i], // printed table of contents — the reader shows its own
  },
];

/** Headings may contain HTML entities from editors (e.g. "About the Author&#32;"). */
const decodeEntities = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

const WORDS_PER_MINUTE = 220;

// ---------- Markdown helpers ----------
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Markdown → plain prose (no code, tables, headings markers, links or emphasis) for teasers and leak checks. */
export function plainText(md) {
  return md
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .split(/\r?\n/)
    .filter((l) => !/^\s*\|/.test(l)) // table rows
    .map((l) => (/^\s{0,3}#{1,6}\s/.test(l) ? '' : l)) // headings are labels, not sentences
    .map((l) => l.replace(/^\s*>\s?/, '').replace(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/, ''))
    .join('\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|_|~~)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/\\$/gm, '') // hard line breaks
    .replace(/\\([\\`*_{}[\]()#+\-.!|<>~])/g, '$1') // Markdown escapes: \[ → [
    .replace(/\s+/g, ' ')
    .trim();
}

// Abbreviations that end in a full stop but do not end a sentence ("St. Aloysius", "Mr. Kumar").
const ABBREVIATION = /\b(?:Mr|Mrs|Ms|Dr|St|Prof|Sr|Jr|No|vs|etc|e\.g|i\.e|approx)\.$/i;
export function sentences(text) {
  const out = [];
  for (const piece of text.split(/(?<=[.!?…]["”’)]?)\s+(?=["“‘(]?[A-Z0-9])/)) {
    const p = piece.trim();
    if (!p) continue;
    if (out.length && ABBREVIATION.test(out[out.length - 1])) out[out.length - 1] += ` ${p}`;
    else out.push(p);
  }
  return out;
}

const countWords = (md) => (plainText(md).match(/\S+/g) || []).length;

// Priority: teaser set in the book's config (by section title) → <!-- teaser: --> in the manuscript → first two sentences.
function teaserFor(md, override) {
  if (override) return override.replace(/\s+/g, ' ').trim();
  const custom = md.match(/<!--\s*teaser:\s*([\s\S]*?)-->/i);
  if (custom) return custom[1].replace(/\s+/g, ' ').trim();
  const t = sentences(plainText(md)).slice(0, 2).join(' ');
  return t.length > 360 ? `${t.slice(0, 357).replace(/\s+\S*$/, '')}…` : t;
}

/** Splits a manuscript into sections at every "## " heading (headings inside code blocks are ignored). */
export function splitSections(md) {
  const lines = md.replace(/^﻿/, '').split(/\r?\n/);
  const sections = [];
  let current = null;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const h = !inFence && line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (h) {
      current = { title: decodeEntities(h[1]).replace(/\s+/g, ' ').trim(), body: [] };
      sections.push(current);
    } else if (current) current.body.push(line);
  }
  return sections.map((s) => ({ title: s.title, body: s.body.join('\n').trim() }));
}

/** The book's sections, minus any the config skips (e.g. a printed "Contents" list — the reader has its own). */
const bookSections = (config, md) => splitSections(md).filter((s) => !(config.skip || []).some((re) => re.test(s.title)));

function frontMatter(md) {
  const m = md.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  return Object.fromEntries(m[1].split(/\r?\n/).map((l) => l.match(/^([A-Za-z_]+):\s*(.*)$/)).filter(Boolean).map(([, k, v]) => [k, v.replace(/^["']|["']$/g, '')]));
}

/** Builds the public JSON for one book. Locked sections never get a `content` field. */
export function buildBook(config, md) {
  const sections = bookSections(config, md);
  if (!sections.length) throw new Error(`${config.source}: no "## " headings found — each section must start with "## Title".`);
  const ids = new Set();
  const out = sections.map((s) => {
    let id = slugify(s.title) || 'section';
    while (ids.has(id)) id += '-2';
    ids.add(id);
    const free = config.free.some((re) => re.test(s.title));
    const minutes = Math.max(1, Math.round(countWords(s.body) / WORDS_PER_MINUTE));
    return free
      ? { id, title: s.title, free: true, minutes, content: s.body.replace(/<!--[\s\S]*?-->\n?/g, '').trim() }
      : { id, title: s.title, free: false, minutes, teaser: teaserFor(s.body, config.teasers?.[s.title]) };
  });
  const fm = frontMatter(md);
  const intro = sections.find((s) => /^introduction\b/i.test(s.title)) || sections[0];
  const description = fm.description || sentences(plainText(intro.body)).slice(0, 2).join(' ');
  const { source, free, teasers, skip, ...meta } = config;
  return {
    ...meta,
    description,
    minutes: out.reduce((n, s) => n + s.minutes, 0),
    freeCount: out.filter((s) => s.free).length,
    sections: out,
  };
}

/** Sentences of locked sections that must never appear in anything shipped to the browser. */
export function lockedSentences(config, md) {
  const result = [];
  const all = bookSections(config, md);
  const isFree = (s) => config.free.some((re) => re.test(s.title));
  // A sentence repeated word-for-word in a free section is public anyway, so it is not a leak.
  const publicText = all.filter(isFree).map((s) => plainText(s.body)).join(' ');
  const publicRaw = all.filter(isFree).map((s) => s.body).join('\n');
  for (const s of all) {
    if (isFree(s)) continue;
    const teaser = teaserFor(s.body, config.teasers?.[s.title]);
    for (const sentence of sentences(plainText(s.body))) {
      if (sentence.length >= 40 && !teaser.includes(sentence) && !publicText.includes(sentence)) result.push(sentence);
    }
    // Code boxes (often the paid prompts and templates) are not prose, so check them line by line.
    for (const [, code] of s.body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
      for (const line of code.split(/\r?\n/).map((l) => l.trim())) {
        if (line.length >= 40 && !publicRaw.includes(line)) result.push(line);
      }
    }
  }
  return result;
}

/** Structural check, used for both freshly built and committed JSON. */
export function validateBook(book) {
  const problems = [];
  if (!Array.isArray(book.sections) || !book.sections.length) problems.push('no sections');
  for (const s of book.sections || []) {
    if (s.free) continue;
    const extra = Object.keys(s).filter((k) => !['id', 'title', 'free', 'minutes', 'teaser'].includes(k));
    if (extra.length) problems.push(`locked section "${s.title}" has extra fields: ${extra.join(', ')}`);
    if (sentences(s.teaser || '').length > 3 || (s.teaser || '').length > 400) problems.push(`locked section "${s.title}" teaser is longer than 2 sentences`);
  }
  if (!book.sections?.some((s) => s.free)) problems.push('no free sample sections');
  return problems;
}

function writeIndex() {
  const books = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.json') && f !== 'index.json').map((f) => JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), 'utf8')));
  // Listing + contents data only: titles, never section text.
  const index = books.map(({ sections, ...meta }) => ({ ...meta, sectionCount: sections.length, toc: sections.map(({ id, title, free, minutes }) => ({ id, title, free, minutes })) }));
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
}

function main(argv) {
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const only = arg('--slug');
  const sourceOverride = arg('--source');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let failed = false;

  for (const config of BOOKS.filter((b) => !only || b.slug === only)) {
    const source = path.resolve(ROOT, sourceOverride || config.source);
    const outFile = path.join(OUT_DIR, `${config.slug}.json`);
    if (!fs.existsSync(source)) {
      if (fs.existsSync(outFile)) {
        const existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
        const problems = validateBook(existing);
        if (problems.length) { console.error(`✗ ${config.slug}.json: ${problems.join('; ')}`); failed = true; }
        else if (existing.testBuild) console.log(`• ${config.slug}: using the TEST preview in ${path.relative(ROOT, outFile)} (built from tests/fixtures — never commit it; add ${config.source} to publish the real book).`);
        else console.log(`• ${config.slug}: manuscript not present here — using the built ${path.relative(ROOT, outFile)} (checked).`);
      } else {
        console.warn(`! ${config.slug}: ${config.source} not found and no built JSON yet — the book is skipped. Add the manuscript and run "npm run build:ebooks".`);
      }
      continue;
    }
    const md = fs.readFileSync(source, 'utf8');
    const book = buildBook(config, md);
    // Built from a stand-in manuscript (tests): marked so it is never mistaken for — or committed as — the real book.
    if (sourceOverride) book.testBuild = true;
    const json = `${JSON.stringify(book, null, 2)}\n`;
    const problems = validateBook(book);
    const leaked = lockedSentences(config, md).filter((s) => json.includes(s));
    if (leaked.length) problems.push(`${leaked.length} locked sentence(s) would leak, e.g. "${leaked[0].slice(0, 80)}…"`);
    if (problems.length) { console.error(`✗ ${config.slug}: ${problems.join('; ')} — nothing written.`); failed = true; continue; }
    fs.writeFileSync(outFile, json);
    const free = book.sections.filter((s) => s.free).map((s) => s.title);
    console.log(`✓ ${config.slug}: ${book.sections.length} sections → ${path.relative(ROOT, outFile)} (${(json.length / 1024).toFixed(1)} KB)`);
    console.log(`  free: ${free.join(' · ')}`);
    console.log(`  locked (title + teaser only): ${book.sections.length - free.length}`);
  }

  if (fs.readdirSync(OUT_DIR).some((f) => f.endsWith('.json') && f !== 'index.json')) writeIndex();
  else fs.writeFileSync(path.join(OUT_DIR, 'index.json'), '[]\n');
  if (failed) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main(process.argv.slice(2));
