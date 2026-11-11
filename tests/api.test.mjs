// API test suite — run with `npm run test:api` while `npm run dev` is running.
// Uses a throwaway user that is deleted at the end. Exits with code 1 if any check fails.
import { neon } from '@neondatabase/serverless';
const BASE = process.env.BASE || 'http://localhost:3001';
let cookie = '';
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });

async function call(method, path, body, { auth = true } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json', ...(auth && cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.get('set-cookie');
  if (set && auth) cookie = set.split(';')[0];
  let json = null;
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status, json, setCookie: set };
}

const email = `apismoke-${Date.now()}@example.com`;
try {
  // auth
  let r = await call('POST', '/api/auth/signup', { fullName: 'A', email: 'bad', password: 'short' });
  check('signup validation → 400 field errors', r.status === 400 && r.json.fieldErrors?.email && r.json.fieldErrors?.password && r.json.fieldErrors?.fullName, JSON.stringify(r.json.fieldErrors));
  r = await call('POST', '/api/auth/signup', { fullName: 'Smoke Tester', email, password: 'Smoke1234!', country: 'Uganda', currency: 'UGX', language: 'English', timezone: 'Africa/Kampala', weeklyGoalLessons: 5, weeklyGoalMinutes: 120 });
  check('signup → 201 + httpOnly cookie', r.status === 201 && /HttpOnly/i.test(r.setCookie) && /SameSite=Lax/i.test(r.setCookie) && /Max-Age=604800/.test(r.setCookie), r.setCookie?.replace(/=[^;]+/, '=…'));
  check('signup never returns password hash', !JSON.stringify(r.json).includes('password'), Object.keys(r.json.user || {}).join(','));
  r = await call('POST', '/api/auth/signup', { fullName: 'Smoke Tester', email, password: 'Smoke1234!', country: 'Uganda', currency: 'UGX', language: 'English', weeklyGoalLessons: 5, weeklyGoalMinutes: 120 }, { auth: false });
  check('duplicate email → 409', r.status === 409 && r.json.fieldErrors?.email);
  r = await call('GET', '/api/auth/me');
  check('me returns user', r.json.user?.email === email && r.json.user.timezone === 'Africa/Kampala' && r.json.user.streak === 0);
  r = await call('POST', '/api/auth/logout');
  const savedCookie = cookie; cookie = '';
  r = await call('GET', '/api/auth/me');
  check('logged out → me null', r.json.user === null);
  r = await call('POST', '/api/auth/login', { email, password: 'wrong-pass1' });
  check('wrong password → 401', r.status === 401);
  r = await call('POST', '/api/auth/login', { email: 'achieng.otieno@demo.novaris.app', password: 'anything1' });
  check('demo accounts cannot log in', r.status === 401);
  r = await call('POST', '/api/auth/login', { email, password: 'Smoke1234!' });
  check('login → 200', r.status === 200 && cookie && cookie !== savedCookie);

  // protected routes without cookie
  for (const p of ['/api/dashboard', '/api/profile', '/api/library', '/api/products/library', '/api/certificates']) {
    const x = await call('GET', p, null, { auth: false });
    check(`${p} requires login`, x.status === 401);
  }
  const anonBook = await call('POST', '/api/bookings', { id: 1 }, { auth: false });
  check('booking requires login', anonBook.status === 401);

  // public
  r = await call('GET', '/api/stats', null, { auth: false });
  check('stats', r.json.learners >= 41 && r.json.countries >= 20 && r.json.ebooks === 12 && r.json.featured.length === 4 && r.json.bestsellers.length === 3, `learners ${r.json.learners}, countries ${r.json.countries}, completed ${r.json.completed}`);
  r = await call('GET', '/api/courses?category=AI%20Agents&sort=rating');
  check('courses filter + sort', r.json.courses.length === 3 && r.json.courses.every((c) => c.category === 'AI Agents'), r.json.courses.map((c) => c.title).join(' | '));
  r = await call('GET', '/api/courses?q=prompt');
  check('courses search', r.json.courses.length >= 2, r.json.courses.map((c) => c.slug).join(','));
  r = await call('GET', "/api/courses?q=' OR 1=1 --");
  check('search is injection-safe', r.status === 200 && r.json.courses.length === 0);
  r = await call('GET', '/api/courses/prompt-engineering-foundations');
  check('course details with locks', r.json.course.title && r.json.lessons[0].locked === false && r.json.lessons[1].locked === true);

  // lessons: answers never sent
  r = await call('GET', '/api/lessons?course=prompt-engineering-foundations');
  const raw = JSON.stringify(r.json);
  check('lessons never include correct answers', !raw.includes('correct_index') && !raw.includes('explanation'));
  check('locked lessons hide notes', r.json.lessons[0].notes && r.json.lessons[1].notes === null && r.json.lessons[1].questions.length === 0);
  r = await call('POST', '/api/progress', { lessonId: r.json.lessons[0].id, completed: true });
  check('progress before enrolling → 403', r.status === 403);

  // enroll + complete course
  r = await call('POST', '/api/courses/prompt-engineering-foundations/enroll');
  check('enroll', r.json.enrolled === true);
  r = await call('GET', '/api/lessons?course=prompt-engineering-foundations');
  const lessons = r.json.lessons;
  check('enrolled → all lessons open', lessons.every((l) => !l.locked && l.questions.length === 3));
  const q = await call('POST', '/api/quiz', { lessonId: lessons[0].id, answers: [0, 0, 0] });
  check('quiz graded on server', q.json.results.length === 3 && q.json.results.every((x) => typeof x.correct === 'boolean') && q.json.saved, `score ${q.json.score}`);
  check('quiz never reveals answers to wrong guesses', q.json.results.every((x) => x.correct || (x.correctIndex === undefined && x.explanation === undefined)));
  const bad = await call('POST', '/api/quiz', { lessonId: lessons[0].id, answers: [0] });
  check('quiz requires every answer', bad.status === 400);
  let last;
  for (const l of lessons) last = await call('POST', '/api/progress', { lessonId: l.id, completed: true });
  check('finishing last lesson completes course + certificate', last.json.courseCompleted && /^NOV-\d{4}-[A-Z0-9]{6}$/.test(last.json.certificateCode), last.json.certificateCode);
  const code = last.json.certificateCode;
  r = await call('GET', `/api/certificates/${code}`, null, { auth: false });
  check('public certificate verification', r.json.certificate?.learner_name === 'Smoke Tester' && !JSON.stringify(r.json).includes('email'));
  r = await call('GET', '/api/certificates/NOV-2026-NOPE00', null, { auth: false });
  check('unknown certificate → null (no error)', r.status === 200 && r.json.certificate === null);
  const untick = await call('POST', '/api/progress', { lessonId: lessons[0].id, completed: false });
  const retick = await call('POST', '/api/progress', { lessonId: lessons[0].id, completed: true });
  check('re-completing keeps the same certificate', untick.json.progressPercent < 100 && retick.json.certificateCode === code);

  // dashboard + profile
  r = await call('GET', '/api/dashboard');
  check('dashboard', r.json.weekly.length === 7 && r.json.week.lessons >= 5 && r.json.streak.current === 1 && r.json.totals.certificates === 1 && r.json.nextClass, `week ${JSON.stringify(r.json.week)} streak ${JSON.stringify(r.json.streak)}`);
  r = await call('PATCH', '/api/profile', { fullName: 'Smoke Tester Two', currency: 'EUR', weeklyGoalLessons: 7 });
  check('profile update', r.json.user.fullName === 'Smoke Tester Two' && r.json.user.currency === 'EUR' && r.json.user.weeklyGoalLessons === 7);
  r = await call('PATCH', '/api/profile', { currency: 'BTC' });
  check('profile validation', r.status === 400);
  r = await call('GET', '/api/profile');
  check('profile stats + badges', r.json.stats.completed === 1 && r.json.badges.find((b) => b.id === 'b1').earned && r.json.certificates.length === 1);

  // ebooks
  r = await call('GET', '/api/ebooks');
  const book = r.json.ebooks.find((b) => b.price_usd > 0);
  check('ebooks list', r.json.ebooks.length === 12 && !('sample_text' in r.json.ebooks[0]));
  r = await call('GET', `/api/ebooks/${book.slug}`, null, { auth: false });
  check('ebook sample public', r.json.ebook.sample_text.split(/\s+/).length >= 300);
  r = await call('POST', '/api/purchases', { id: book.id, currency: 'EUR' });
  const again = await call('POST', '/api/purchases', { id: book.id, currency: 'EUR' });
  check('buy ebook (repeat returns existing)', r.json.owned && !r.json.alreadyOwned && again.json.alreadyOwned && again.json.purchase.id === r.json.purchase.id);

  // classes: book, double-book, full, cancel
  r = await call('GET', '/api/classes');
  const open = r.json.classes.find((c) => c.seats_left > 3 && new Date(c.start_time) > Date.now() + 3600000);
  const full = r.json.classes.find((c) => c.seats_left === 0);
  check('classes with seats left', r.json.classes.length >= 3 && open && full, r.json.classes.map((c) => c.seats_left).join(','));
  const b1 = await call('POST', '/api/bookings', { id: open.id });
  const b2 = await call('POST', '/api/bookings', { id: open.id });
  check('book seat (no double booking)', b1.json.seatsLeft === open.seats_left - 1 && b2.json.alreadyBooked && b2.json.seatsLeft === open.seats_left - 1);
  const bf = await call('POST', '/api/bookings', { id: full.id });
  check('full class cannot be booked', bf.status === 409 && bf.json.code === 'class_full');
  const c1 = await call('DELETE', `/api/bookings?id=${open.id}`);
  check('cancel booking', c1.json.booked === false && c1.json.seatsLeft === open.seats_left);
  // concurrency: 6 parallel bookings for the same seat by the same user → exactly one row
  await Promise.all(Array.from({ length: 6 }, () => call('POST', '/api/bookings', { id: open.id })));
  r = await call('GET', '/api/classes');
  check('parallel bookings never double book', r.json.classes.find((c) => c.id === open.id).seats_left === open.seats_left - 1);

  // products
  r = await call('GET', '/api/products?price=free');
  check('products free filter', r.json.products.length === 6);
  r = await call('GET', '/api/products/business-growth-bundle');
  check('bundle details', r.json.product.items.length === 4 && r.json.product.saving_pct === 30);
  const pb = await call('POST', '/api/products/purchase', { id: r.json.product.id, currency: 'USD' });
  check('buying a bundle grants all included products', pb.json.productIds.length === 5);
  r = await call('GET', '/api/products/library');
  check('products library', r.json.products.length === 5);

  // forms
  r = await call('POST', '/api/contact', { name: '', email: 'x', country: '', message: '' });
  check('contact validation', r.status === 400 && Object.keys(r.json.fieldErrors).length === 4);
  r = await call('POST', '/api/contact', { name: 'Smoke Tester', email, country: 'Uganda', message: 'Hello from the smoke test.' });
  check('contact saved', r.json.ok && r.json.id);
  r = await call('POST', '/api/submissions', { authorName: 'Smoke Tester', email, country: 'Uganda', bookTitle: 'AI for Farmers', genre: 'AI Basics', summary: 'A short summary.' });
  check('manuscript saved with reference', /^NOV-MS-\d{4}-\d{5}$/.test(r.json.reference), r.json.reference);

  // library
  r = await call('GET', '/api/library');
  check('library tabs data', r.json.courses.length === 1 && r.json.ebooks.length === 1 && r.json.certificates.length === 1 && r.json.classes.length === 1 && r.json.products.length === 5);

  // misc
  r = await call('GET', '/api/nope');
  check('unknown route → 404 JSON', r.status === 404 && r.json.error);
  r = await call('DELETE', '/api/stats');
  check('wrong method → 405', r.status === 405);
} finally {
  const sql = neon(process.env.DATABASE_URL);
  await sql`DELETE FROM contact_messages WHERE email = ${email}`;
  await sql`DELETE FROM manuscript_submissions WHERE email = ${email}`;
  await sql`DELETE FROM users WHERE email = ${email}`;
  await sql`DELETE FROM rate_limits`;
}
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} | ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`);
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
