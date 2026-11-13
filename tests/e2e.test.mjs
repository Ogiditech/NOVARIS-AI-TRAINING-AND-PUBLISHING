// Browser walkthrough — run with `npm run test:e2e` while `npm run dev` is running.
// Signs in as test@novaris.com (recreating it), drives the real UI in headless Chrome and writes
// screenshots to tests/output/. Set CHROME_PATH if Chrome is installed somewhere else.
// `npm run test:e2e -- persist` re-checks saved data after restarting the server.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

const BASE = 'http://localhost:5173';
const OUT = fileURLToPath(new URL('./output/', import.meta.url));
fs.mkdirSync(OUT, { recursive: true });
const EMAIL = 'test@novaris.com';
const PASSWORD = 'Test1234!';
const phase = process.argv[2] || 'all';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Wait until the page has finished talking to the server (saves, grading), then a moment for the UI to update.
const settle = async (page) => { await wait(300); await page.waitForNetworkIdle({ idleTime: 400, timeout: 15000 }).catch(() => {}); await wait(300); };
const results = [];
const check = (area, name, ok, detail = '') => { results.push({ area, name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} | ${area} | ${name}${detail ? ' — ' + detail : ''}`); };
const consoleIssues = [];

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--lang=en-US'] });
async function newPage(vp = { width: 1440, height: 900 }, ctx) {
  const page = await (ctx || browser).newPage();
  page.on('console', (m) => { if (['error', 'warn'].includes(m.type())) consoleIssues.push(`${page.url().replace(BASE, '')} ${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => consoleIssues.push(`${page.url().replace(BASE, '')} pageerror: ${e.message}`));
  await page.setViewport(vp);
  await page.emulateTimezone('Africa/Kampala');
  return page;
}
const go = async (page, path) => { await page.goto(BASE + path, { waitUntil: 'networkidle0' }); await wait(900); };
const text = (page) => page.evaluate(() => document.body.innerText);
const toast = (page) => page.evaluate(() => [...document.querySelectorAll('[role=status] p')].map((p) => p.textContent).join(' | '));
const clickText = (page, sel, txt) => page.evaluate((sel, txt) => {
  const el = [...document.querySelectorAll(sel)].find((x) => x.textContent.trim().includes(txt) && !x.disabled && x.offsetParent !== null);
  if (el) { el.click(); return true; } return false;
}, sel, txt);
const waitFor = async (page, fn, arg, timeout = 8000) => { try { await page.waitForFunction(fn, { timeout, polling: 150 }, arg); return true; } catch { return false; } };
// Replace a field's contents: select everything, delete it, then type (React sees real key events).
const typeInto = async (page, sel, value) => { await page.focus(sel); await page.$eval(sel, (e) => e.select()); await page.keyboard.press('Backspace'); if (value) await page.type(sel, value); };

async function login(page, next = '') {
  await go(page, `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  if (!(await page.$('#login-email'))) return; // already logged in → redirected
  await page.type('#login-email', EMAIL);
  await page.type('#login-password', PASSWORD);
  await clickText(page, 'button', 'Log in');
  await waitFor(page, (n) => location.pathname === (n || '/dashboard'), next);
  await wait(900);
}

try {
  if (phase === 'all') {
    await sql`DELETE FROM users WHERE email = ${EMAIL}`;
    await sql`DELETE FROM contact_messages WHERE email = ${EMAIL}`;
    await sql`DELETE FROM manuscript_submissions WHERE email = ${EMAIL}`;
    await sql`DELETE FROM rate_limits`;
    const page = await newPage();

    // ---------------- protected redirect
    await go(page, '/dashboard');
    check('Auth', 'Dashboard while logged out → login', page.url().includes('/login?next=%2Fdashboard'));
    await go(page, '/');
    check('Auth', '"Start Learning" goes to sign up when logged out', await page.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.textContent.includes('Start Learning'))?.getAttribute('href') === '/signup'));

    // ---------------- sign up (2 steps)
    await go(page, '/signup');
    await clickText(page, 'button', 'Continue');
    await wait(300);
    const step1Errors = await page.evaluate(() => [...document.querySelectorAll('[role=alert]')].map((e) => e.id));
    check('Sign up', 'step 1 shows field errors when empty', ['su-name-error', 'su-email-error', 'su-password-error'].every((x) => step1Errors.includes(x)), step1Errors.join(','));
    await page.type('#su-name', 'Test Learner');
    await page.type('#su-email', EMAIL);
    await page.type('#su-password', 'abc');
    const weak = await page.evaluate(() => document.body.innerText.match(/Password strength: (\w+)/)?.[1]);
    await typeInto(page, '#su-password', PASSWORD);
    const strong = await page.evaluate(() => document.body.innerText.match(/Password strength: (\w+)/)?.[1]);
    check('Sign up', 'password strength meter reacts', weak && strong && weak !== strong, `${weak} → ${strong}`);
    await page.click('#su-password + button');
    check('Sign up', 'show/hide password toggle', (await page.$eval('#su-password', (e) => e.type)) === 'text');
    await clickText(page, 'button', 'Continue');
    await waitFor(page, () => document.querySelector('#su-country'));
    const step2 = await page.evaluate(() => ({ bar: document.querySelector('[role=progressbar]').getAttribute('aria-valuenow'), tz: document.body.innerText.includes('Africa/Kampala'), country: document.querySelector('#su-country').value, currency: document.querySelector('#su-currency').value }));
    check('Sign up', 'step 2 with progress bar, detected time zone, smart defaults', step2.bar === '100' && step2.tz && step2.country === 'Uganda' && step2.currency === 'UGX', JSON.stringify(step2));
    await page.select('#su-language', 'English');
    await page.evaluate(() => { const s = document.querySelector('#su-goal-lessons'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(s, '6'); s.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.screenshot({ path: OUT + 'signup-step2.png' });
    await clickText(page, 'button', 'Create my account');
    const toDash = await waitFor(page, () => location.pathname === '/dashboard', null, 12000);
    await wait(1500);
    check('Sign up', 'account created → confetti, welcome toast, dashboard', toDash && (await toast(page)).includes('Welcome to Novaris, Test'), await toast(page));
    const [dbUser] = await sql`SELECT password_hash, timezone, preferred_currency, weekly_goal_lessons FROM users WHERE email = ${EMAIL}`;
    check('Sign up', 'saved with bcrypt hash, time zone and preferences', dbUser.password_hash.startsWith('$2') && dbUser.timezone === 'Africa/Kampala' && dbUser.preferred_currency === 'UGX' && dbUser.weekly_goal_lessons === 6, JSON.stringify({ ...dbUser, password_hash: dbUser.password_hash.slice(0, 7) + '…' }));
    const cookies = await page.cookies();
    const sess = cookies.find((c) => c.name === 'novaris_session');
    check('Security', 'session cookie is httpOnly + SameSite=Lax, 7 days', sess && sess.httpOnly && sess.sameSite === 'Lax' && Math.round((sess.expires * 1000 - Date.now()) / 86400000) === 7);
    const me = await page.evaluate(() => fetch('/api/auth/me').then((r) => r.text()));
    check('Security', 'no password or hash ever sent to the browser', !/password|hash/i.test(me));

    // ---------------- dashboard (empty)
    let tx = await text(page);
    check('Dashboard', 'personal greeting by local time', /Good (morning|afternoon|evening|night), Test/.test(tx));
    check('Dashboard', 'empty state when no course yet', tx.includes('You haven’t started a course yet'));
    const nav = await page.evaluate(() => ({ name: document.querySelector('header button[aria-haspopup=menu]')?.innerText, sidebar: document.querySelector('aside')?.innerText.includes('Test Learner') }));
    check('Navbar', 'avatar + first name in navbar, user in sidebar', nav.name?.includes('Test') && nav.sidebar);
    await page.screenshot({ path: OUT + 'dashboard-empty.png' });

    // ---------------- courses: filter, search, sort
    await go(page, '/courses');
    const chip = (label, opt) => page.evaluate((label, opt) => { const lab = [...document.querySelectorAll('p.label')].find((p) => p.textContent.trim() === label); [...lab.nextElementSibling.querySelectorAll('button')].find((x) => x.textContent.trim() === opt).click(); }, label, opt);
    // Count once the grid has settled: the same number on three readings 500 ms apart (database replies vary in speed).
    const count = async () => {
      await wait(800);
      const read = () => page.evaluate(() => document.querySelectorAll('main [data-course]').length);
      let last = await read(); let same = 0;
      for (let i = 0; i < 20 && same < 2; i++) { await wait(500); const n = await read(); same = n === last ? same + 1 : 0; last = n; }
      return last;
    };
    check('Courses', 'library loads 18 courses from the database', (await count()) === 18);
    await chip('Category', 'AI Agents'); const agents = await count();
    await chip('Level', 'Advanced'); const agentsAdv = await count();
    await chip('Category', 'All'); await chip('Level', 'All'); await chip('Language', 'Swahili'); const sw = await count();
    await chip('Language', 'All');
    check('Courses', 'filters by category, level, language', agents === 3 && agentsAdv === 1 && sw === 1, `agents ${agents}, +advanced ${agentsAdv}, swahili ${sw}`);
    await page.type('main input[type=search]', 'prompt');
    // Wait for the debounced search to come back from the database instead of a fixed delay.
    await page.waitForFunction(() => document.querySelectorAll('main [data-course]').length === 3, { timeout: 8000 }).catch(() => {});
    const q = await count();
    check('Courses', 'search by title', q === 3, `${q} for "prompt"`);
    await typeInto(page, 'main input[type=search]', ''); await page.keyboard.press('Backspace');
    await page.select('main select', 'priceDesc'); await wait(1600);
    const first = await page.evaluate(() => document.querySelector('main [data-course] h3').textContent);
    check('Courses', 'sort by price high → low', first === 'RAG Systems in Production', first);

    // ---------------- course details + enroll (free course)
    await go(page, '/courses/ai-basics-for-everyone');
    tx = await text(page);
    const locks = await page.evaluate(() => document.querySelectorAll('main ol .lucide-lock').length);
    check('Course details', 'hero, what you’ll learn, lessons with locks, instructor', tx.includes('What you’ll learn') && tx.includes('YOUR INSTRUCTOR') && locks === 4 && tx.includes('Free preview'), `${locks} locked`);
    await clickText(page, 'main button', 'Enroll for free');
    await waitFor(page, () => location.pathname.startsWith('/learn/ai-basics-for-everyone'));
    await wait(1200);
    check('Enroll', 'enroll → lesson player', page.url().includes('/learn/ai-basics-for-everyone') && (await toast(page)).includes('enrolled'), await toast(page));

    // ---------------- lessons + quizzes (server-checked)
    const lessons = await sql`SELECT l.id, l.order_index FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.slug = 'ai-basics-for-everyone' ORDER BY l.order_index`;
    const answerKey = async (lessonId) => (await sql`SELECT correct_index FROM quiz_questions WHERE lesson_id = ${lessonId} ORDER BY id`).map((r) => r.correct_index);
    // wrong answers first on lesson 1
    const key1 = await answerKey(lessons[0].id);
    // The quiz loads from the database; answer only once every question is on screen.
    await waitFor(page, (n) => document.querySelectorAll('[role=radiogroup]').length >= n, key1.length, 15000);
    await page.evaluate((key) => { const groups = document.querySelectorAll('[role=radiogroup]'); groups.forEach((g, i) => g.querySelectorAll('[role=radio]')[(key[i] + 1) % 4].click()); }, key1);
    await clickText(page, 'button', 'Check answer');
    await waitFor(page, (n) => document.body.innerText.includes('Score:') && (document.body.innerText.match(/Not quite\./g) || []).length >= n, key1.length, 15000);
    await wait(400);
    tx = await text(page);
    const greens = await page.evaluate(() => [...document.querySelectorAll('[role=radio]')].filter((b) => b.className.includes('bg-emerald-500/15')).length);
    check('Quiz', 'server marks wrong answers without revealing the right one', tx.includes('Score: 0%') && (tx.match(/Not quite\./g) || []).length === 3 && (tx.match(/Check this part of the lesson again/g) || []).length === 3 && greens === 0, `${(tx.match(/Score: \d+%/) || ['no score'])[0]} · not-quite ${(tx.match(/Not quite\./g) || []).length} · hints ${(tx.match(/Check this part of the lesson again/g) || []).length} · highlighted ${greens}`);
    await clickText(page, 'button', 'Retake quiz'); await wait(300);
    await page.evaluate((key) => { document.querySelectorAll('[role=radiogroup]').forEach((g, i) => g.querySelectorAll('[role=radio]')[key[i]].click()); }, key1);
    await clickText(page, 'button', 'Check answer');
    await waitFor(page, () => document.body.innerText.includes('Score: 100%'));
    const [{ quiz_score: savedScore }] = await sql`SELECT quiz_score FROM lesson_progress p JOIN users u ON u.id = p.user_id WHERE u.email = ${EMAIL} AND p.lesson_id = ${lessons[0].id}`;
    check('Quiz', 'correct answers → 100% saved to the database', savedScore === 100);

    // tick complete (optimistic) and move through lessons
    for (let i = 0; i < lessons.length; i++) {
      await waitFor(page, () => [...document.querySelectorAll('main button')].some((b) => b.textContent.includes('Mark lesson complete')));
      await clickText(page, 'main button', 'Mark lesson complete');
      const instant = await page.evaluate(() => [...document.querySelectorAll('main button')].some((b) => b.textContent.trim().endsWith('Completed')));
      if (i === 0) check('Lesson player', 'ticking complete updates instantly (optimistic)', instant);
      await settle(page);
      if (i < lessons.length - 1) {
        if (i === 1) {
          const key = await answerKey(lessons[i].id);
          await page.evaluate((key) => { document.querySelectorAll('[role=radiogroup]').forEach((g, j) => g.querySelectorAll('[role=radio]')[key[j]].click()); }, key);
          await clickText(page, 'button', 'Check answer'); await settle(page);
        }
        await clickText(page, 'main button', 'Next lesson');
        await settle(page);
      }
    }
    const certModal = await waitFor(page, () => document.body.innerText.includes('Course complete!'), null, 10000);
    const outlineTicks = await page.evaluate(() => document.querySelectorAll('aside .lucide-circle-check, aside .lucide-check-circle-2, aside .lucide-circle-check-big').length);
    const confetti = await page.evaluate(() => [...document.querySelectorAll('canvas')].some((c) => c.style.position === 'fixed'));
    check('Lesson player', 'outline ticks + last lesson → confetti + completion', certModal && confetti && outlineTicks >= 5, `ticks ${outlineTicks}`);
    await page.screenshot({ path: OUT + 'course-complete.png' });
    const [cert] = await sql`SELECT certificate_code FROM certificates ce JOIN users u ON u.id = ce.user_id WHERE u.email = ${EMAIL}`;
    check('Certificate', 'certificate created with unique code', /^NOV-\d{4}-[A-Z0-9]{6}$/.test(cert?.certificate_code || ''), cert?.certificate_code);
    await clickText(page, 'button', 'Open my certificate');
    await waitFor(page, () => location.pathname.startsWith('/certificates/'));
    await wait(1500);
    tx = await text(page);
    check('Certificate', 'certificate page: name, course, code, PDF + LinkedIn buttons', tx.includes('Test Learner') && tx.includes('AI Basics for Everyone') && tx.includes(cert.certificate_code) && tx.includes('Download as PDF') && tx.includes('Share on LinkedIn'));
    const li = await page.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.textContent.includes('LinkedIn'))?.href);
    check('Certificate', 'LinkedIn link includes certificate details', li.startsWith('https://www.linkedin.com/profile/add?') && li.includes(cert.certificate_code));
    await page.emulateMediaType('print');
    await page.pdf({ path: OUT + 'certificate.pdf', landscape: true, printBackground: true, format: 'A4' });
    await page.emulateMediaType(null);
    check('Certificate', 'print-to-PDF produces a file', fs.statSync(OUT + 'certificate.pdf').size > 20000);
    await page.screenshot({ path: OUT + 'certificate.png' });

    // public verify (separate logged-out browser context)
    const anonCtx = await browser.createBrowserContext();
    const anon = await newPage({ width: 1440, height: 900 }, anonCtx);
    await go(anon, `/verify/${cert.certificate_code}`);
    tx = await text(anon);
    check('Verify', 'public verify page confirms the certificate (logged out)', tx.includes('This certificate is genuine') && tx.includes('Test Learner'));
    await anon.screenshot({ path: OUT + 'verify.png' });

    // paid course via demo checkout
    await go(page, '/courses/ai-powered-marketing');
    await clickText(page, 'main button', 'Enroll now');
    await waitFor(page, () => document.querySelector('[role=dialog]'));
    const dlg = await page.evaluate(() => ({ demo: document.querySelector('[role=dialog]').innerText.includes('DEMO CHECKOUT') || document.querySelector('[role=dialog]').innerText.includes('Demo checkout'), inputs: document.querySelectorAll('[role=dialog] input').length }));
    check('Checkout', 'paid course opens "Demo checkout" (no card fields)', dlg.demo && dlg.inputs === 0);
    await clickText(page, '[role=dialog] button', 'Complete demo purchase');
    await waitFor(page, () => location.pathname.startsWith('/learn/ai-powered-marketing'), null, 8000);
    check('Checkout', 'paid course enrolled after demo checkout', page.url().includes('/learn/ai-powered-marketing'));

    // ---------------- eBooks: buy + read
    await go(page, '/ebooks');
    await page.evaluate(() => document.querySelector('[data-ebook="the-prompt-playbook"]').scrollIntoView());
    await page.evaluate(() => [...document.querySelector('[data-ebook="the-prompt-playbook"]').querySelectorAll('button')].find((b) => b.textContent.includes('Buy')).click());
    await waitFor(page, () => document.querySelector('[role=dialog]'));
    await clickText(page, '[role=dialog] button', 'Complete demo purchase');
    await waitFor(page, () => document.querySelector('[data-ebook="the-prompt-playbook"]').innerText.includes('Owned'));
    check('eBooks', 'buy with demo checkout → toast + Owned badge + Read', (await toast(page)).includes('now in your library') && await page.evaluate(() => document.querySelector('[data-ebook="the-prompt-playbook"]').innerText.includes('Read')));
    const [{ n: purchases }] = await sql`SELECT count(*)::int AS n FROM ebook_purchases p JOIN users u ON u.id = p.user_id WHERE u.email = ${EMAIL}`;
    check('eBooks', 'purchase recorded in the database', purchases === 1);
    await page.evaluate(() => [...document.querySelector('[data-ebook="the-prompt-playbook"]').querySelectorAll('button')].find((b) => b.textContent.includes('Read')).click());
    await waitFor(page, () => document.querySelector('[role=dialog] article'));
    await wait(800);
    await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].find((b) => b.getAttribute('aria-label') === 'Sepia').click());
    await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button')].find((b) => b.getAttribute('aria-label') === 'Larger text').click());
    await page.evaluate(() => { const s = document.querySelector('[role=dialog] article').parentElement; s.scrollTop = s.scrollHeight / 2; s.dispatchEvent(new Event('scroll')); });
    await wait(400);
    const reader = await page.evaluate(() => ({ bg: getComputedStyle(document.querySelector('[role=dialog]')).backgroundColor, owned: document.querySelector('[role=dialog]').innerText.includes('In your library'), progress: Number(document.querySelector('[role=dialog] [role=progressbar]').getAttribute('aria-valuenow')), words: document.querySelector('[role=dialog] article').innerText.split(/\s+/).length }));
    check('Reader', 'reader: sepia theme, font size, progress bar, owned', reader.bg === 'rgb(244, 236, 216)' && reader.owned && reader.progress > 20 && reader.words > 300, JSON.stringify(reader));
    await page.screenshot({ path: OUT + 'reader-sepia.png' });
    await page.keyboard.press('Escape'); await wait(600);

    // ---------------- live classes: book + cancel
    await go(page, '/live');
    tx = await text(page);
    check('Live', 'times shown in my time zone', tx.includes('Africa/Kampala'));
    const target = await sql`SELECT c.id, c.capacity - (SELECT count(*)::int FROM class_bookings b WHERE b.class_id = c.id) AS seats FROM live_classes c WHERE c.start_time > now() ORDER BY c.start_time`;
    const open = target.find((c) => c.seats > 3);
    // find the day button that shows this class
    let found = false;
    for (let d = 0; d < 14 && !found; d++) {
      await page.evaluate((d) => document.querySelectorAll('main .no-scrollbar button')[d].click(), d); await wait(450);
      found = await page.evaluate((id) => !!document.querySelector(`[data-class="${id}"]`), Number(open.id));
    }
    const seats = () => page.evaluate((id) => Number(document.querySelector(`[data-class="${id}"] [data-seats]`).textContent.match(/\d+/)?.[0] ?? 0), Number(open.id));
    const before = await seats();
    await page.evaluate((id) => [...document.querySelector(`[data-class="${id}"]`).querySelectorAll('button')].find((b) => b.textContent.includes('Book seat')).click(), Number(open.id));
    await waitFor(page, (id) => document.querySelector(`[data-class="${id}"]`).innerText.includes('Cancel booking'), Number(open.id));
    const afterBook = await seats();
    check('Live', 'book seat → seats left goes down (from real bookings)', afterBook === before - 1 && (await toast(page)).includes('Seat booked'), `${before} → ${afterBook}`);
    const almostFull = await page.evaluate(() => document.body.innerText.includes('Almost full'));
    await page.evaluate((id) => [...document.querySelector(`[data-class="${id}"]`).querySelectorAll('button')].find((b) => b.textContent.includes('Cancel booking')).click(), Number(open.id));
    await waitFor(page, (id) => document.querySelector(`[data-class="${id}"]`).innerText.includes('Book seat'), Number(open.id));
    check('Live', 'cancel booking → seat returned', (await seats()) === before && (await toast(page)).includes('cancelled'));
    // book again so the dashboard shows "your next class"
    await page.evaluate((id) => [...document.querySelector(`[data-class="${id}"]`).querySelectorAll('button')].find((b) => b.textContent.includes('Book seat')).click(), Number(open.id));
    await wait(1200);
    // almost-full badge somewhere in the schedule (2 seats left in the seed)
    let af = almostFull;
    for (let d = 0; d < 14 && !af; d++) { await page.evaluate((d) => document.querySelectorAll('main .no-scrollbar button')[d].click(), d); await wait(800); af = await page.evaluate(() => document.body.innerText.includes('Almost full')); }
    check('Live', '"Almost full" badge under 3 seats', af);

    // ---------------- publish + contact
    await go(page, '/publish');
    await page.evaluate(() => document.querySelector('#pf-bookTitle').closest('form').querySelector('button.btn-primary').click());
    await wait(300);
    check('Publish', 'empty title shows field error', await page.evaluate(() => !!document.querySelector('#pf-bookTitle-error')));
    await page.type('#pf-bookTitle', 'AI for Smallholder Farmers');
    await page.type('#pf-summary', 'Practical AI tools for farmers in East Africa.');
    await page.evaluate(() => document.querySelector('#pf-bookTitle').closest('form').querySelector('button.btn-primary').click());
    if (!(await waitFor(page, () => document.querySelector('[data-reference]')))) {
      console.log('DEBUG publish', await page.evaluate(() => ({ errors: [...document.querySelectorAll('[role=alert]')].map((e) => `${e.id}: ${e.textContent}`), toasts: [...document.querySelectorAll('[role=status] p')].map((x) => x.textContent), vals: ['pf-authorName', 'pf-email', 'pf-bookTitle', 'pf-summary'].map((id) => document.getElementById(id)?.value) })));
    }
    const ref = await page.evaluate(() => document.querySelector('[data-reference]')?.textContent || '');
    check('Publish', 'manuscript saved → success screen with reference + next steps', /^NOV-MS-\d{4}-\d{5}$/.test(ref) && (await text(page)).includes('What happens next'), ref);
    await page.screenshot({ path: OUT + 'publish-success.png' });
    await go(page, '/contact');
    await page.type('#cf-message', 'Hello Novaris — this is the end-to-end test.');
    await page.evaluate(() => document.querySelector('#cf-name').closest('form').querySelector('button').click());
    await waitFor(page, () => document.body.innerText.includes('message has been sent'));
    const [{ n: msgs }] = await sql`SELECT count(*)::int AS n FROM contact_messages WHERE email = ${EMAIL}`;
    check('Contact', 'contact form prefilled, saved, success toast', msgs === 1);
    check('Contact', 'phone numbers + WhatsApp unchanged', await page.evaluate(() => ['tel:+256785917220', 'tel:+971524605012', 'https://wa.me/256785917220', 'https://wa.me/971524605012'].every((h) => [...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === h))));

    // ---------------- profile edit
    await go(page, '/profile');
    await clickText(page, 'main button', 'Edit profile');
    await waitFor(page, () => document.querySelector('#pr-name'));
    await typeInto(page, '#pr-name', 'Test Learner');
    await page.select('#pr-country', 'Kenya');
    await page.select('#pr-currency', 'KES');
    await page.evaluate(() => { const s = document.querySelector('#pr-goal-minutes'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(s, '180'); s.dispatchEvent(new Event('input', { bubbles: true })); });
    await clickText(page, 'main button', 'Save changes');
    await waitFor(page, () => document.body.innerText.includes('Profile updated'));
    const [p2] = await sql`SELECT country, preferred_currency, weekly_goal_minutes FROM users WHERE email = ${EMAIL}`;
    check('Profile', 'edit saved to the database', p2.country === 'Kenya' && p2.preferred_currency === 'KES' && p2.weekly_goal_minutes === 180, JSON.stringify(p2));
    tx = await text(page);
    check('Profile', 'plan, badges, certificates and stats shown', tx.includes('Free') && tx.includes('First Lesson') && tx.includes(cert.certificate_code) && tx.includes('Badges & achievements'));
    await page.screenshot({ path: OUT + 'profile.png', fullPage: false });

    // ---------------- library
    await go(page, '/library');
    const lib = {};
    for (const [tab, label] of [['courses', 'My Courses'], ['ebooks', 'My eBooks'], ['certificates', 'My Certificates'], ['classes', 'My Classes'], ['products', 'My Digital Products']]) {
      await page.evaluate((label) => [...document.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes(label)).click(), label);
      await wait(500);
      lib[tab] = await page.evaluate(() => document.querySelector('[role=tabpanel]').innerText.slice(0, 60).replace(/\n/g, ' '));
    }
    check('Library', 'tabs: courses, eBooks, certificates, classes, products', lib.courses.includes('AI') && lib.ebooks.includes('Prompt Playbook') && lib.certificates.includes('AI Basics') && !lib.classes.includes('No live') && lib.products.includes('No digital products'), JSON.stringify(lib));

    // ---------------- dashboard updated
    await go(page, '/dashboard');
    await wait(1500);
    tx = await text(page);
    const ring = await page.evaluate(() => document.querySelector('svg.-rotate-90')?.closest('div').parentElement.innerText);
    const streakN = await page.evaluate(() => { const p = [...document.querySelectorAll('main p')].find((x) => x.textContent.trim() === 'Day streak'); return p?.previousElementSibling?.textContent.trim(); });
    check('Dashboard', 'dashboard reflects progress: continue card, streak 1, lessons this week', tx.includes('AI-Powered Marketing') && streakN === '1' && ring.includes('5'), `streak ${streakN} · ${ring?.replace(/\n/g, ' ')}`);
    check('Dashboard', 'next live class card with live countdown + Join', tx.includes('YOUR NEXT LIVE CLASS') && tx.includes('Join') && await page.evaluate(() => !!document.querySelector('[role=timer]')));
    const chart = await page.evaluate(() => document.querySelectorAll('.recharts-area-dots circle, .recharts-dot').length);
    check('Dashboard', 'weekly chart drawn from real minutes', chart >= 7);
    await page.screenshot({ path: OUT + 'dashboard.png' });
    await go(page, '/pricing');
    check('Pricing', 'current plan highlighted + preferred currency (KES)', await page.evaluate(() => document.querySelector('[data-plan="Free"]').innerText.includes('Your plan') && document.body.innerText.includes('KSh')));

    // ---------------- logout + return-to after login
    await page.evaluate(() => document.querySelector('header button[aria-haspopup=menu]').click()); await wait(300);
    await clickText(page, '[role=menu] button', 'Log out');
    await waitFor(page, () => location.pathname === '/');
    await go(page, '/library');
    check('Auth', 'protected page → login with return path', page.url().includes('/login?next=%2Flibrary'));
    await page.type('#login-email', EMAIL); await page.type('#login-password', 'wrongpass1');
    await clickText(page, 'button', 'Log in');
    check('Auth', 'wrong password → friendly error', await waitFor(page, () => !!document.querySelector('#login-password-error')));
    await typeInto(page, '#login-password', PASSWORD);
    await clickText(page, 'button', 'Log in');
    await waitFor(page, () => location.pathname === '/library');
    check('Auth', 'after login you return to where you were', page.url().endsWith('/library'));

    // ---------------- mobile pass
    const m = await newPage({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await login(m);
    const mobileBad = [];
    for (const r of ['/dashboard', '/courses/ai-basics-for-everyone', '/learn/ai-basics-for-everyone', `/certificates/${cert.certificate_code}`, '/ebooks', '/live', '/library', '/profile', '/publish']) {
      await go(m, r); await wait(600);
      const o = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (o > 0) mobileBad.push(`${r} +${o}px`);
      await m.screenshot({ path: OUT + `m-${r.split('/')[1]}.png` });
    }
    check('Mobile', 'no sideways scrolling on new screens at 375px', mobileBad.length === 0, mobileBad.join(', '));
    await go(m, '/courses/ai-powered-marketing');
    const bar = await m.evaluate(() => { const b = document.querySelector('[data-buybar]'); const n = document.querySelector('nav.fixed'); return b && getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().bottom <= n.getBoundingClientRect().top + 1; });
    check('Mobile', 'sticky enroll bar above bottom navigation', bar);
    await m.close();
    const ms = await newPage({ width: 375, height: 812, isMobile: true, hasTouch: true }, anonCtx);
    await go(ms, '/signup');
    await ms.screenshot({ path: OUT + 'm-signup.png' });
    check('Mobile', 'sign up: gradient becomes a short header', await ms.evaluate(() => { const s = document.querySelector('section'); return s.getBoundingClientRect().height < 260; }), `${await ms.evaluate(() => Math.round(document.querySelector('section').getBoundingClientRect().height))}px`);
    await anonCtx.close();
  }

  if (phase === 'persist') {
    // Run after restarting the server: everything must still be there.
    const page = await newPage();
    await login(page, '/library');
    const lib = await page.evaluate(() => [...document.querySelectorAll('[role=tab]')].map((b) => b.innerText.replace(/\n/g, ' ')).join(' | '));
    check('Persistence', 'after server restart: login works and library intact', /My Courses 2/.test(lib) && /My eBooks 1/.test(lib) && /My Certificates 1/.test(lib) && /My Classes 1/.test(lib), lib);
    await go(page, '/profile');
    const tx = await text(page);
    check('Persistence', 'profile edits survived restart', tx.includes('Kenya'));
    await page.reload({ waitUntil: 'networkidle0' }); await wait(800);
    check('Persistence', 'still logged in after page refresh', (await page.evaluate(() => document.querySelector('header button[aria-haspopup=menu]')?.innerText || '')).includes('Test'));
  }
} catch (err) {
  console.error('SCRIPT ERROR', err);
  results.push({ area: 'Script', name: err.message, ok: false });
} finally {
  await browser.close();
  // The deliberate wrong-password attempt makes Chrome log an expected "401" network line.
  const issues = [...new Set(consoleIssues)].filter((i) => !(i.startsWith('/login?next=%2Flibrary') && i.includes('status of 401')));
  check('Console', 'zero console errors and warnings', issues.length === 0, issues.slice(0, 8).join('\n'));
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`);
}
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
