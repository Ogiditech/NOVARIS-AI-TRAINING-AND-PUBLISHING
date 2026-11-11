import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, PlayCircle, Clock, Calendar, Trophy, Video, GraduationCap, ArrowRight, Award, BookOpen } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { ProgressRing, Counter, fadeUp, EmptyState } from '../components/ui';
import { DataState, PageSkeleton } from '../components/states';
import TipOfDay from '../components/TipOfDay';
import CourseCard, { categoryIcons, gradient } from '../components/CourseCard';
import { formatLocal, userTimeZone } from '../utils/time';

function greetingKey(timezone) {
  let hour;
  try { hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: timezone || userTimeZone }).format(new Date())); } catch { hour = new Date().getHours(); }
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function ChartTooltip({ active, payload, label }) {
  const { t } = useApp();
  if (!active || !payload?.length) return null;
  return (
    <div className="glass !rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold">{label}</p>
      <p className="text-violet-400">{t('common.min', { n: payload[0].value })}</p>
    </div>
  );
}

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return { d: Math.floor(diff / 86400000), h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60, s: Math.floor(diff / 1000) % 60, live: diff === 0 };
}

function NextClass({ cls }) {
  const { t } = useApp();
  const c = useCountdown(cls.start_time);
  const parts = [['d', c.d], ['h', c.h], ['m', c.m], ['s', c.s]];
  return (
    <div className="glass relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="relative flex flex-wrap items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-400"><Calendar size={22} /></div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow !text-blue-400">{cls.booked ? t('dashboard.yourNextClass') : t('dashboard.upcoming')}</p>
          <p className="mt-1 font-semibold leading-snug">{cls.title}</p>
          <p className="text-xs text-muted">{formatLocal(new Date(cls.start_time), { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {cls.instructor_name} · {cls.language}</p>
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2" role="timer" aria-label={t('dashboard.countdownLabel')}>
          {c.live && <span className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-3 font-display font-bold text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-white" /> {t('live.liveNow')}</span>}
          {!c.live && parts.map(([k, v]) => (
            <div key={k} className="w-14 rounded-xl border border-line/15 bg-surface/60 py-1.5 text-center">
              <p className="font-display text-xl font-bold tabular-nums">{String(v).padStart(2, '0')}</p>
              <p className="text-[10px] uppercase text-muted">{t(`dashboard.units.${k}`)}</p>
            </div>
          ))}
        </div>
        {cls.booked ? (
          // Placeholder meeting link — replace with the real video-call URL before launch.
          <a href={`https://meet.novaris.example/class-${cls.id}`} target="_blank" rel="noopener noreferrer" className="btn-primary ml-auto !py-2.5"><Video size={16} /> {t('dashboard.join')}</a>
        ) : (
          <Link to="/live" className="btn-ghost ml-auto !py-2.5">{t('dashboard.seeClasses')} <ArrowRight size={16} /></Link>
        )}
      </div>
    </div>
  );
}

function Content({ data }) {
  const { t, theme } = useApp();
  const { user, weekly, week, quizzes, streak, continueCourse: course, nextClass, recommended, totals } = data;
  const axis = theme === 'dark' ? '#a098be' : '#625c7a';
  const chart = weekly.map((d) => ({ day: new Date(`${d.date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' }), minutes: d.minutes }));
  const weeklyTotal = weekly.reduce((s, d) => s + d.minutes, 0);
  const goalPct = Math.round((week.lessons / Math.max(1, week.goalLessons)) * 100);
  const rings = [
    { key: 'lessons', v: [week.lessons, week.goalLessons], colors: ['#8b5cf6', '#6366f1'], sub: t('common.goal', { n: week.goalLessons }) },
    { key: 'minutes', v: [week.minutes, week.goalMinutes], colors: ['#3b82f6', '#06b6d4'], sub: t('common.goal', { n: week.goalMinutes }) },
    { key: 'quizzes', v: [quizzes.passed, Math.max(quizzes.taken, 1)], colors: ['#f5c76b', '#f97316'], sub: t('dashboard.quizzesTaken', { n: quizzes.taken }) },
  ];
  const CourseIcon = course ? categoryIcons[course.category] || GraduationCap : GraduationCap;

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        <p className="eyebrow mb-2">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: user.timezone })}</p>
        <h1 className="text-3xl font-bold sm:text-4xl">{t(`dashboard.greeting.${greetingKey(user.timezone)}`, { name: user.firstName })} 👋</h1>
        <p className="mt-2 text-muted">{goalPct >= 100 ? t('dashboard.goalDone') : t('dashboard.goalProgress', { pct: Math.min(goalPct, 99), done: week.lessons, goal: week.goalLessons })}</p>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Continue learning */}
        {course ? (
          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="relative overflow-hidden rounded-3xl p-6 text-white shadow-glow lg:col-span-2 sm:p-8" style={{ background: gradient(course, 120) }}>
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
            <CourseIcon className="absolute -bottom-8 -right-6 text-white/15" size={190} />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/75">{t('dashboard.continue')}</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{course.title}</h2>
                {course.next_lesson && <p className="mt-1 text-sm text-white/85">{t('dashboard.lessonOf', { a: course.next_lesson.order_index, b: course.total_lessons })} · {course.next_lesson.title}</p>}
                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/20">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-gold to-white" initial={{ width: 0 }} animate={{ width: `${course.progress_percent}%` }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} />
                </div>
                <p className="mt-2 text-xs text-white/75">{course.progress_percent}% · {course.instructor_name}</p>
              </div>
              <Link to={`/learn/${course.slug}${course.next_lesson ? `?lesson=${course.next_lesson.id}` : ''}`} className="btn bg-white px-6 py-4 text-violet-700 shadow-xl hover:-translate-y-0.5">
                <PlayCircle size={20} /> {t('dashboard.resume')}
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="lg:col-span-2">
            <EmptyState icon={GraduationCap} title={t('dashboard.noCourse')} body={t('dashboard.noCourseBody')} action={<Link to="/courses" className="btn-primary mt-2">{t('dashboard.exploreLibrary')} <ArrowRight size={16} /></Link>} />
          </div>
        )}

        {/* Streak */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="glass relative flex items-center gap-5 overflow-hidden p-6">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-orange-500/25 blur-3xl" />
          <motion.div animate={streak.current ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}} transition={{ duration: 1.8, repeat: Infinity }} className={`relative grid h-20 w-20 place-items-center rounded-3xl text-white ${streak.current ? 'bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 shadow-[0_0_40px_-6px_rgba(249,115,22,.7)]' : 'bg-line/20'}`}>
            <Flame size={40} />
          </motion.div>
          <div className="relative">
            <p className="font-display text-5xl font-bold"><Counter to={streak.current} duration={1.2} /></p>
            <p className="font-semibold">{t('dashboard.streak')}</p>
            <p className="text-xs text-muted">{streak.current ? t('dashboard.streakSub', { n: streak.best }) : t('dashboard.streakStart')}</p>
            <div className="mt-3 flex gap-1" aria-hidden="true">
              {weekly.map((d) => <span key={d.date} title={d.date} className={`h-1.5 w-5 rounded-full ${d.lessons ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-line/20'}`} />)}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Weekly chart */}
        <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="glass p-5 lg:col-span-3 sm:p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t('dashboard.weekly')}</h3>
              <p className="text-sm text-muted"><span className="font-display text-2xl font-bold text-ink"><Counter to={weeklyTotal} /></span> {t('dashboard.minutes')}</p>
            </div>
            <Clock className="text-violet-400" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ left: -20, right: 6, top: 10 }}>
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="1" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={axis} strokeOpacity={0.15} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: axis, fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: axis, fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#8b5cf6', strokeOpacity: 0.4 }} />
                <Area type="monotone" dataKey="minutes" stroke="url(#line)" strokeWidth={3} fill="url(#area)" animationDuration={1600} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rings */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="glass grid grid-cols-3 items-start gap-2 p-5 lg:col-span-2 lg:grid-cols-1 lg:gap-4 sm:p-6">
          {rings.map(({ key, v, colors, sub }) => (
            <div key={key} className="flex flex-col items-center gap-2 lg:flex-row lg:gap-5">
              <ProgressRing id={key} value={v[0]} max={v[1]} size={92} stroke={9} colors={colors}>
                <span className="font-display text-lg font-bold"><Counter to={v[0]} duration={1.4} /></span>
              </ProgressRing>
              <div className="text-center lg:text-left">
                <p className="text-xs font-semibold sm:text-sm">{t(`dashboard.rings.${key}`)}</p>
                <p className="text-[11px] text-muted">{Math.min(100, Math.round((v[0] / v[1]) * 100))}% · {sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {nextClass ? <NextClass cls={nextClass} /> : <TipOfDay />}
        <div className="grid gap-5">
          {nextClass && <TipOfDay />}
          <div className="glass grid grid-cols-3 divide-x divide-line/10 p-4 text-center">
            {[[GraduationCap, totals.enrolled, t('dashboard.totals.enrolled')], [Award, totals.certificates, t('dashboard.totals.certificates')], [BookOpen, Math.round(totals.minutes / 60), t('dashboard.totals.hours')]].map(([Icon, n, label]) => (
              <div key={label} className="px-2">
                <Icon size={18} className="mx-auto text-violet-400" />
                <p className="mt-1 font-display text-2xl font-bold"><Counter to={n} /></p>
                <p className="text-[11px] text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recommended.length > 0 && (
        <section className="pt-4">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold"><Trophy size={22} className="text-gold" /> {t('dashboard.recommended')}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c, i) => <CourseCard key={c.slug} course={c} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data, error, loading, reload } = useApi('/dashboard');
  return <DataState data={data} error={error} loading={loading} onRetry={reload} skeleton={<PageSkeleton />}>{(d) => <Content data={d} />}</DataState>;
}
