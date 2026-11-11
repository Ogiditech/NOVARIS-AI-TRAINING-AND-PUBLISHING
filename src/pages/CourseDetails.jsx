import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, BarChart3, CheckCircle2, Clock, Languages, Loader2, Lock, PlayCircle, Star, Users, Eye, GraduationCap, SearchX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import useRequireLogin from '../hooks/useRequireLogin';
import { api } from '../lib/api';
import { celebrate } from '../lib/celebrate';
import { EmptyState } from '../components/ui';
import { ErrorState, PageSkeleton } from '../components/states';
import { categoryIcons, gradient, hours } from '../components/CourseCard';
import { initials } from '../components/UserMenu';
import { formatPrice } from '../data/constants';

function EnrollButton({ course, enrolled, firstLesson, busy, onEnroll, className = '' }) {
  const { t } = useApp();
  if (enrolled) {
    return (
      <Link to={`/learn/${course.slug}${firstLesson ? `?lesson=${firstLesson}` : ''}`} className={`btn-primary ${className}`}>
        <PlayCircle size={18} /> {course.progress_percent >= 100 ? t('courseDetails.review') : course.progress_percent > 0 ? t('courseDetails.continue') : t('courseDetails.start')}
      </Link>
    );
  }
  return (
    <button onClick={onEnroll} disabled={busy} className={`btn-primary ${className}`}>
      {busy ? <Loader2 size={18} className="animate-spin" /> : <GraduationCap size={18} />}
      {Number(course.price_usd) > 0 ? t('courseDetails.enrollPaid') : t('courseDetails.enrollFree')}
    </button>
  );
}

export default function CourseDetails() {
  const { slug } = useParams();
  const { t, toast, currency, setCheckout, acquired } = useApp();
  const navigate = useNavigate();
  const requireLogin = useRequireLogin();
  const { data, error, reload } = useApi(`/courses/${encodeURIComponent(slug)}`);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return undefined;
    document.body.classList.add('has-buybar');
    return () => document.body.classList.remove('has-buybar');
  }, [data]);

  if (error && !data) {
    return error.status === 404
      ? <EmptyState icon={SearchX} title={t('courseDetails.notFound')} action={<Link to="/courses" className="btn-primary mt-2">{t('player.back')}</Link>} />
      : <ErrorState error={error} onRetry={reload} />;
  }
  if (!data) return <PageSkeleton />;

  const { course, lessons, certificateCode } = data;
  const enrolled = course.enrolled || acquired.courses.includes(course.id);
  const Icon = categoryIcons[course.category] || GraduationCap;
  const price = formatPrice(course.price_usd, currency);
  const nextLesson = lessons.find((l) => !l.completed) || lessons[0];

  const enroll = () => requireLogin(async () => {
    if (Number(course.price_usd) > 0) {
      setCheckout({ kind: 'course', item: course, onDone: () => navigate(`/learn/${course.slug}`) });
      return;
    }
    setBusy(true);
    try {
      await api(`/courses/${course.slug}/enroll`, { method: 'POST' });
      celebrate();
      toast(t('courseDetails.enrolledToast', { title: course.title }));
      navigate(`/learn/${course.slug}`);
    } catch (err) {
      toast(err.message, 'error');
      setBusy(false);
    }
  });

  const facts = [
    [Clock, hours(course.duration_minutes)], [PlayCircle, t('courses.lessons', { n: lessons.length })],
    [BarChart3, course.level], [Languages, course.language], [Users, t('courseDetails.learners', { n: course.learners.toLocaleString() })],
  ];

  return (
    <div>
      <Link to="/courses" className="mb-2 inline-flex min-h-[40px] items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> {t('player.back')}</Link>

      {/* Hero */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[32px] p-6 text-white shadow-glow sm:p-10" style={{ background: gradient(course, 125) }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <motion.div className="absolute -right-10 -top-10" animate={{ rotate: [0, 6, 0] }} transition={{ duration: 8, repeat: Infinity }}>
          <Icon className="text-white/15" size={260} />
        </motion.div>
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-black/25 px-3 py-1 backdrop-blur">{course.category}</span>
            {course.is_featured && <span className="rounded-full bg-gold px-3 py-1 text-[#2a1a00]">{t('courseDetails.featured')}</span>}
            {enrolled && <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1"><CheckCircle2 size={13} /> {t('courses.enrolledBadge')}</span>}
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">{course.title}</h1>
          <p className="mt-3 text-lg text-white/85">{course.subtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5"><Star size={16} className="fill-gold text-gold" /> <b>{course.rating}</b> ({course.rating_count.toLocaleString()})</span>
            {facts.map(([FIcon, label]) => <span key={label} className="flex items-center gap-1.5"><FIcon size={16} /> {label}</span>)}
          </div>
          {enrolled && (
            <div className="mt-5 max-w-md">
              <div className="h-2.5 overflow-hidden rounded-full bg-white/25"><motion.div className="h-full rounded-full bg-gradient-to-r from-gold to-white" initial={{ width: 0 }} animate={{ width: `${course.progress_percent || 0}%` }} transition={{ duration: 1.2 }} /></div>
              <p className="mt-1.5 text-xs text-white/80">{t('courses.percentDone', { n: course.progress_percent || 0 })}</p>
            </div>
          )}
          <div className="mt-7 hidden flex-wrap items-center gap-4 lg:flex">
            <EnrollButton course={course} enrolled={enrolled} firstLesson={nextLesson?.id} busy={busy} onEnroll={enroll} className="!bg-white !bg-none px-7 py-4 text-base !text-violet-700 !shadow-xl" />
            {!enrolled && <span className="font-display text-3xl font-bold">{price || t('courses.free')}</span>}
            {certificateCode && <Link to={`/certificates/${certificateCode}`} className="btn border border-white/40 text-white hover:bg-white/10"><Award size={18} /> {t('courseDetails.viewCertificate')}</Link>}
          </div>
        </div>
      </motion.section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('courseDetails.about')}</h2>
            <p className="leading-relaxed text-ink/90">{course.description}</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">{t('courseDetails.whatYouLearn')}</h2>
            <ul className="glass grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              {course.what_you_learn.map((item, i) => (
                <motion.li key={item} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-400" /> {item}
                </motion.li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-1 text-2xl font-bold">{t('courseDetails.lessons')}</h2>
            <p className="mb-4 text-sm text-muted">{t('courseDetails.lessonsSub', { n: lessons.length, time: hours(course.duration_minutes) })}</p>
            <ol className="glass divide-y divide-line/10 overflow-hidden">
              {lessons.map((l) => {
                const content = (
                  <>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${l.completed ? 'bg-emerald-500/15 text-emerald-400' : l.locked ? 'bg-line/10 text-muted' : 'bg-violet-600/15 text-violet-400'}`}>
                      {l.completed ? <CheckCircle2 size={18} /> : l.locked ? <Lock size={17} /> : <PlayCircle size={18} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{l.order_index}. {l.title}</span>
                      <span className="text-xs text-muted">{t('common.min', { n: l.duration_minutes })}</span>
                    </span>
                    {l.is_free_preview && !enrolled && <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-gold"><Eye size={12} /> {t('courseDetails.preview')}</span>}
                    {l.locked && <span className="sr-only">{t('courseDetails.locked')}</span>}
                  </>
                );
                return (
                  <li key={l.id}>
                    {l.locked ? (
                      <div className="flex items-center gap-4 px-4 py-3.5 opacity-80 sm:px-5">{content}</div>
                    ) : (
                      <Link to={`/learn/${course.slug}?lesson=${l.id}`} className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-violet-600/10 sm:px-5">{content}</Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <div className="glass p-5">
            <p className="label">{t('courseDetails.instructor')}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-lg font-bold text-white shadow-lg" style={{ background: gradient(course) }}>{initials(course.instructor_name)}</span>
              <div>
                <p className="font-semibold">{course.instructor_name}</p>
                <p className="text-xs text-muted">{t('courseDetails.instructorRole', { category: course.category })}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{course.instructor_bio}</p>
          </div>
          <div className="glass hidden p-5 lg:block">
            <p className="label">{t('courseDetails.price')}</p>
            <p className="font-display text-3xl font-bold">{price || t('courses.free')}</p>
            <EnrollButton course={course} enrolled={enrolled} firstLesson={nextLesson?.id} busy={busy} onEnroll={enroll} className="mt-4 w-full py-4" />
            <p className="mt-3 text-center text-xs text-muted">{t('courseDetails.certificateNote')}</p>
          </div>
        </aside>
      </div>

      {/* Mobile: sticky enroll bar above the bottom navigation */}
      {createPortal(
        <div data-buybar className="fixed inset-x-3 z-30 lg:hidden" style={{ bottom: 'calc(88px + env(safe-area-inset-bottom))' }}>
          <div className="glass flex items-center justify-between gap-3 !rounded-[22px] !bg-surface/90 p-3 pl-5">
            <span className="font-display text-2xl font-bold">{enrolled ? t('courses.percentDone', { n: course.progress_percent || 0 }) : price || t('courses.free')}</span>
            <EnrollButton course={course} enrolled={enrolled} firstLesson={nextLesson?.id} busy={busy} onEnroll={enroll} className="shrink-0" />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
