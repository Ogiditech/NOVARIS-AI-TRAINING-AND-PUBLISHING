// eBook reader walkthrough — run with `npm run test:ebook` while `npm run dev` is running.
// Works with the real manuscript or the test build (`npm run build:ebooks -- --source tests/fixtures/sample-ebook.md`).
// Screenshots go to tests/output/. Exits with code 1 if any check fails.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { BOOKS, lockedSentences } from '../scripts/build-ebooks.js';

const BASE = process.env.BASE || 'http://localhost:5173';
const OUT = fileURLToPath(new URL('./output/', import.meta.url));
fs.mkdirSync(OUT, { recursive: true });
const config = BOOKS[0];
const SLUG = config.slug;
const index = JSON.parse(fs.readFileSync(new URL(`../src/data/ebooks/index.json`, import.meta.url), 'utf8'));
const meta = index.find((b) => b.slug === SLUG);
if (!meta) { console.error(`No built book "${SLUG}" — run npm run build:ebooks first.`); process.exit(1); }
const manuscript = fs.existsSync(config.source) ? config.source : meta.testBuild ? 'tests/fixtures/sample-ebook.md' : null;
const secrets = manuscript ? lockedSentences(config, fs.readFileSync(manuscript, 'utf8')) : [];
const firstFree = meta.toc.find((s) => s.free);
const firstLocked = meta.toc.find((s) => !s.free);
const fullBook = JSON.parse(fs.readFileSync(new URL(`../src/data/ebooks/${SLUG}.json`, import.meta.url), 'utf8'));
const tableSection = fullBook.sections.find((s) => s.free && /^\s*\|.*\|\s*$/m.test(s.content)) || null;

/** Counts what a section's Markdown should produce on screen (outside fenced code). */
function expectedMarkdown(md) {
  const fences = (md.match(/^\s*```/gm) || []).length / 2;
  const prose = md.replace(/```[\s\S]*?```/g, '');
  const lines = prose.split(/\r?\n/);
  const tables = lines.filter((l) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(l)).length;
  const tableLines = lines.filter((l) => /^\s*\|.*\|\s*$/.test(l)).length;
  const tasks = lines.filter((l) => /^\s*[-*+]\s+\[[ xX]\]\s/.test(l)).length;
  const items = lines.filter((l) => /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(l)).length - tasks;
  return { tables, rows: tableLines - tables * 2, tasks, checked: lines.filter((l) => /^\s*[-*+]\s+\[[xX]\]\s/.test(l)).length, code: fences, lists: items };
}

const results = [];
const check = (area, name, ok, detail = '') => results.push({ area, name, ok: !!ok, detail });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const consoleIssues = [];

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--lang=en-US'] });
async function newPage(width = 1280, height = 900, { theme = 'dark', blockStorage = false } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width, height });
  await page.evaluateOnNewDocument((theme, blockStorage) => {
    if (blockStorage) {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });
    } else {
      try { localStorage.setItem('novaris:theme', JSON.stringify(theme)); } catch { /* ignore */ }
    }
  }, theme, blockStorage);
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) consoleIssues.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => consoleIssues.push(`pageerror: ${e.message}`));
  return page;
}
const go = async (page, path) => { await page.goto(BASE + path, { waitUntil: 'networkidle0' }); await wait(700); };
const text = (page) => page.evaluate(() => document.body.innerText);
// The site uses smooth scrolling: bring a button into view instantly before clicking so the click cannot miss.
const clickNav = async (page, which) => { await page.$eval(`[data-nav="${which}"]`, (e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.click(`[data-nav="${which}"]`); await wait(500); };
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

try {
  // ---------- Listing
  let page = await newPage();
  await go(page, '/ebooks');
  let tx = await text(page);
  check('Listing', 'book appears in the eBooks store with "Coming soon"', tx.includes(meta.title) && await page.$(`[data-original="${SLUG}"]`) && (await page.$eval(`[data-original="${SLUG}"]`, (e) => e.innerText)).includes('Coming soon'));

  // ---------- Detail page
  await go(page, `/ebooks/${SLUG}`);
  tx = await text(page);
  const buy = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('Buy eBook')); return b && { disabled: b.disabled, badge: /coming soon/i.test(b.parentElement.innerText) }; });
  check('Detail', 'cover, title, subtitle, author, description', await page.$('[data-book] .aspect-\\[3\\/4\\]') && tx.includes(meta.title) && tx.includes(meta.subtitle) && tx.includes(meta.author) && tx.includes(meta.description.slice(0, 40)));
  check('Detail', '"Read free sample" button + Buy shows "Coming soon" (disabled)', tx.includes('Read free sample') && buy?.disabled && buy?.badge, JSON.stringify(buy));
  check('Detail', 'publisher, edition and price shown', tx.includes('Novaris AI Training and Publishing') && tx.includes('First edition, November 2026') && /\$9\.99|9\.99/.test(tx));
  const locks = await page.$$eval('ol li svg[aria-label="Locked"]', (l) => l.length);
  check('Detail', 'contents list: free sections linked, locked ones marked', locks === meta.toc.filter((s) => !s.free).length, `${locks} locks`);
  await page.screenshot({ path: `${OUT}book-detail-dark.png` });

  // ---------- Reader: sample sections
  await page.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.innerText.includes('Read free sample')).click());
  await page.waitForSelector('[data-reader] article[data-section]');
  await wait(500);
  check('Reader', 'opens at the first section', (await page.$eval('article', (a) => a.dataset.section)) === meta.toc[0].id);
  check('Reader', 'sample section shows full text', !(await page.$('article[data-locked]')) && (await page.$eval('article', (a) => a.innerText.length)) > 80);
  const sidebar = await page.$$eval('aside nav li', (l) => l.length);
  check('Reader', 'table of contents sidebar on desktop', sidebar === meta.toc.length, `${sidebar} entries`);

  // Every free section: what the Markdown contains must be what the reader renders.
  const totals = { tables: 0, rows: 0, tasks: 0, code: 0, lists: 0 };
  const mismatches = [];
  for (const s of fullBook.sections.filter((x) => x.free)) {
    const expected = expectedMarkdown(s.content);
    for (const k of Object.keys(totals)) totals[k] += expected[k];
    await go(page, `/ebooks/${SLUG}/read?s=${s.id}`);
    const got = await page.evaluate(() => ({
      tables: document.querySelectorAll('article .book-table > table').length,
      rows: document.querySelectorAll('article table tbody tr').length,
      tasks: document.querySelectorAll('article .contains-task-list input[type=checkbox]').length,
      checked: document.querySelectorAll('article .contains-task-list input[type=checkbox]:checked').length,
      code: document.querySelectorAll('article pre > code').length,
      lists: document.querySelectorAll('article ul:not(.contains-task-list) > li, article ol > li').length,
      rawMarkdown: /(^|\n)\s*\|.*\|\s*(\n|$)|```|\*\*\S/.test(document.querySelector('article').innerText),
    }));
    for (const k of Object.keys(expected)) if (got[k] !== expected[k]) mismatches.push(`${s.id} ${k}: expected ${expected[k]}, got ${got[k]}`);
    if (got.rawMarkdown) mismatches.push(`${s.id}: raw Markdown symbols visible`);
    if (s.id === tableSection?.id) await page.screenshot({ path: `${OUT}book-tables-dark.png`, fullPage: true });
  }
  const sum = `${totals.tables} tables / ${totals.rows} rows · ${totals.tasks} checklist items · ${totals.code} code blocks · ${totals.lists} list items`;
  check('Markdown', 'sample sections render every table, list, checklist and code block', mismatches.length === 0 && totals.tables > 0, mismatches[0] || sum);

  // ---------- Navigation + progress
  await go(page, `/ebooks/${SLUG}/read?s=${meta.toc[0].id}`);
  const p0 = Number(await page.$eval('[role=progressbar]', (e) => e.getAttribute('aria-valuenow')));
  await clickNav(page, 'next');
  const afterNext = { id: await page.$eval('article', (a) => a.dataset.section), url: page.url() };
  const p1 = Number(await page.$eval('[role=progressbar]', (e) => e.getAttribute('aria-valuenow')));
  await clickNav(page, 'prev');
  const afterPrev = await page.$eval('article', (a) => a.dataset.section);
  check('Reader', 'next / previous navigation (URL updates)', afterNext.id === meta.toc[1].id && afterNext.url.includes(`s=${meta.toc[1].id}`) && afterPrev === meta.toc[0].id, `${afterNext.id} · ${afterNext.url.split('?')[1]} · back to ${afterPrev}`);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await wait(400);
  const pScroll = Number(await page.$eval('[role=progressbar]', (e) => e.getAttribute('aria-valuenow')));
  check('Reader', 'progress bar moves with chapters and scrolling', p1 > p0 && pScroll > p0, `${p0}% → next ${p1}% · scrolled ${pScroll}%`);

  // ---------- Font size
  const fs0 = await page.$eval('article', (a) => parseFloat(getComputedStyle(a).fontSize));
  // 70ch resolves to pixels; compare it with the width of 70 "0" characters in the article's font.
  const mw = await page.$eval('article', (a) => { const probe = document.createElement('span'); probe.textContent = '0'.repeat(70); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; a.appendChild(probe); const w = probe.getBoundingClientRect().width; probe.remove(); return Math.round((parseFloat(getComputedStyle(a).maxWidth) / w) * 70); });
  await page.click('button[aria-label="Larger text"]'); await page.click('button[aria-label="Larger text"]'); await wait(200);
  const fs2 = await page.$eval('article', (a) => parseFloat(getComputedStyle(a).fontSize));
  await page.click('button[aria-label="Smaller text"]'); await wait(200);
  const fs1 = await page.$eval('article', (a) => parseFloat(getComputedStyle(a).fontSize));
  const lh = await page.$eval('article', (a) => parseFloat(getComputedStyle(a).lineHeight) / parseFloat(getComputedStyle(a).fontSize));
  check('Reading', '18px text, ~70ch width, comfortable line height', fs0 === 18 && mw === 70 && lh >= 1.6, `${fs0}px · max-width ${mw} characters · line-height ${lh.toFixed(2)}`);
  check('Reading', 'A− / A+ font size control', fs2 === 20 && fs1 === 19, `${fs0} → ${fs2} → ${fs1}`);

  // ---------- Locked chapter
  await go(page, `/ebooks/${SLUG}/read?s=${firstLocked.id}`);
  tx = await page.$eval('article', (a) => a.innerText);
  const notify = await page.evaluate(() => ({ wa: document.querySelector('[data-notify=whatsapp]')?.href, target: document.querySelector('[data-notify=whatsapp]')?.target, mail: document.querySelector('[data-notify=email]')?.href }));
  check('Locked', 'title, teaser, lock icon and "Full book coming soon"', tx.includes(firstLocked.title) && await page.$('article .book-teaser') && await page.$('article svg.lucide-lock') && tx.includes('Full book coming soon'));
  check('Locked', 'locked chapter shows no full text on screen', secrets.length > 0 && !secrets.some((s) => tx.includes(s)), `${secrets.length} private sentences checked`);
  const waText = notify.wa ? decodeURIComponent(new URL(notify.wa).searchParams.get('text') || '') : '';
  check('Notify', '"Notify me" opens WhatsApp +971 52 460 5012 with a prefilled message', notify.wa?.startsWith('https://wa.me/971524605012?text=') && waText.includes(meta.title) && notify.target === '_blank', waText);
  check('Notify', 'email link to samomurok@gmail.com', notify.mail?.startsWith('mailto:samomurok@gmail.com?subject='));
  await page.screenshot({ path: `${OUT}book-locked-dark.png` });

  // No locked text anywhere the browser downloaded.
  const downloaded = await page.evaluate(async () => {
    const urls = performance.getEntriesByType('resource').map((r) => r.name).filter((u) => u.startsWith(location.origin) && !u.includes('/api/'));
    const bodies = await Promise.all(urls.map((u) => fetch(u).then((r) => r.text()).catch(() => '')));
    return bodies.join('\n') + document.documentElement.outerHTML;
  });
  const leaked = secrets.filter((s) => downloaded.includes(s) || downloaded.includes(JSON.stringify(s).slice(1, -1)));
  check('Locked', 'no locked text in anything the browser downloaded', secrets.length > 0 && leaked.length === 0, leaked[0] || `${secrets.length} sentences checked`);

  // ---------- Remember last position
  await go(page, `/ebooks/${SLUG}/read?s=${meta.toc[1].id}`);
  await page.evaluate(() => window.scrollTo(0, 200)); await wait(400);
  await go(page, `/ebooks/${SLUG}/read`);
  const resumed = await page.$eval('article', (a) => a.dataset.section);
  check('Reader', 'remembers last position (section + scroll)', resumed === meta.toc[1].id && page.url().includes(`s=${meta.toc[1].id}`), resumed);
  check('Reader', 'font size remembered', (await page.$eval('article', (a) => parseFloat(getComputedStyle(a).fontSize))) === 19);

  // ---------- localStorage blocked
  const blocked = await newPage(1280, 900, { blockStorage: true });
  await go(blocked, `/ebooks/${SLUG}/read`);
  await clickNav(blocked, 'next').catch(() => {});
  check('Reader', 'works when localStorage is blocked', (await blocked.$eval('article', (a) => a.dataset.section).catch(() => null)) === meta.toc[1].id);

  // ---------- Light mode
  const light = await newPage(1280, 900, { theme: 'light' });
  await go(light, `/ebooks/${SLUG}/read?s=${(tableSection || firstFree).id}`);
  const colors = async (p) => p.evaluate(() => ({ dark: document.documentElement.classList.contains('dark'), bg: getComputedStyle(document.body).backgroundColor, ink: getComputedStyle(document.querySelector('article')).color }));
  const lc = await colors(light);
  const dc = await colors(page);
  check('Theme', 'light and dark mode both styled', !lc.dark && dc.dark && lc.ink !== dc.ink && lc.bg !== dc.bg, `light ${lc.ink} on ${lc.bg} · dark ${dc.ink} on ${dc.bg}`);
  await light.screenshot({ path: `${OUT}book-reader-light.png`, fullPage: true });
  await go(light, `/ebooks/${SLUG}/read?s=${firstLocked.id}`);
  await light.screenshot({ path: `${OUT}book-locked-light.png` });

  // ---------- Mobile
  const m = await newPage(375, 800);
  await go(m, `/ebooks/${SLUG}/read?s=${(tableSection || firstFree).id}`);
  const mOver = await overflow(m);
  const sidebarHidden = await m.$eval('aside', (a) => getComputedStyle(a).display === 'none');
  const tableScrolls = tableSection ? await m.$eval('.book-table', (t) => getComputedStyle(t).overflowX === 'auto') : true;
  await m.screenshot({ path: `${OUT}book-mobile-reader.png` });
  await m.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Contents').click()); await wait(600);
  const drawerOpen = await m.$('[role=dialog][aria-label="Contents"]');
  await m.screenshot({ path: `${OUT}book-mobile-drawer.png` });
  await m.evaluate((id) => [...document.querySelectorAll('[role=dialog] li button')].at(-1).click(), null); await wait(700);
  const afterPick = await m.$eval('article', (a) => a.dataset.section);
  const drawerClosed = !(await m.$('[role=dialog][aria-label="Contents"]'));
  check('Mobile', 'no sideways scrolling; sidebar hidden; wide tables scroll inside their box', mOver <= 0 && sidebarHidden && tableScrolls, `overflow ${mOver}px`);
  check('Mobile', 'contents drawer opens, picks a chapter and closes', drawerOpen && afterPick === meta.toc.at(-1).id && drawerClosed, afterPick);
  await go(m, `/ebooks/${SLUG}`);
  check('Mobile', 'detail page fits a phone screen', (await overflow(m)) <= 0);
  await m.screenshot({ path: `${OUT}book-mobile-detail.png`, fullPage: true });
  await go(m, '/ebooks');
  check('Mobile', 'store listing fits a phone screen', (await overflow(m)) <= 0);
} catch (err) {
  console.error('SCRIPT ERROR', err);
  results.push({ area: 'Script', name: err.message, ok: false });
} finally {
  await browser.close();
  const issues = [...new Set(consoleIssues)];
  check('Console', 'zero console errors and warnings', issues.length === 0, issues.slice(0, 6).join('\n'));
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} | ${r.area} | ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`);
  process.exitCode = results.every((r) => r.ok) ? 0 : 1;
}
