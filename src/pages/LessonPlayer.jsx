import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, Captions, CheckCircle2, Circle, Lock, Award, ChevronRight, XCircle, Volume2, Maximize, FileText, HelpCircle, SearchX, Loader2, LogIn, GraduationCap, Eye, Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { api } from '../lib/api';
import { bigCelebration, celebrate } from '../lib/celebrate';
import { EmptyState } from '../components/ui';
import { ErrorState, PageSkeleton } from '../components/states';
import { LogoMark } from '../components/Logo';
import { gradient } from '../components/CourseCard';
import { subtitleLanguages } from '../data/constants';

function Quiz({ lesson, canSave, onScored }) {
  const { t, toast } = useApp();
  const [answers, setAnswers] = useState(() => lesson.questions.map(() => null));
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const complete = answers.every((a) => a !== null);

  const check = async () => {
    setBusy(true);
    try {
      const data = await api('/quiz', { method: 'POST', body: { lessonId: lesson.id, answers } });
      setResult(data);
      if (data.passed) celebrate();
      onScored(data.score);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!lesson.questions.length) return null;
  return (
    <div className="space-y-5">
      {lesson.questions.map((q, qi) => {
        const r = result?.results[qi];
        return (
          <div key={q.id}>
            <p className="font-medium"><span className="mr-2 text-violet-400">{qi + 1}.</span>{q.question}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={q.question}>
              {q.options.map((opt, i) => {
                const chosen = answers[qi] === i;
                let cls = 'border-line/15 hover:border-violet-500/50';
                if (chosen && !r) cls = 'border-violet-500 bg-violet-600/15';
                if (r && i === r.correctIndex) cls = 'border-emerald-500/60 bg-emerald-500/15';
                if (r && chosen && !r.correct) cls = 'border-rose-500/60 bg-rose-500/10';
                return (
                  <motion.button
                    key={i} role="radio" aria-checked={chosen} disabled={Boolean(result)}
                    onClick={() => setAnswers((a) => a.map((x, j) => (j === qi ? i : x)))}
                    animate={r && chosen && !r.correct ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                    className={`flex min-h-[48px] items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition disabled:cursor-default ${cls}`}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface/80 text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {r && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mt-2 flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${r.correct ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {r.correct ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <XCircle size={17} className="mt-0.5 shrink-0" />}
                  <span><b>{r.correct ? t('player.correctShort') : t('player.wrongShort')}</b> <span className="text-ink/80">{r.explanation}</span></span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-3">
        {result ? (
          <>
            <span className={`rounded-full px-4 py-2 font-display text-lg font-bold ${result.passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>{t('player.score', { n: result.score })}</span>
            <span className="text-sm text-muted">{result.passed ? t('player.passed') : t('player.tryAgainHint')}</span>
            {!result.saved && canSave === false && <span className="text-xs text-muted">{t('player.notSaved')}</span>}
            <button onClick={() => { setResult(null); setAnswers(lesson.questions.map(() => null)); }} className="btn-ghost ml-auto !py-2.5">{t('player.retake')}</button>
          </>
        ) : (
          <button className="btn-primary" disabled={!complete || busy} onClick={check}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : <HelpCircle size={18} />} {t('player.check')}
          </button>
        )}
      </div>
    </div>
  );
}

function LockedLesson({ course, loggedIn, onEnroll, busy }) {
  const { t } = useApp();
  const location = `/learn/${course.slug}`;
  return (
    <div className="glass flex flex-col items-center gap-4 px-6 py-14 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-600/15 text-violet-400"><Lock size={30} /></div>
      <h2 className="text-xl font-semibold">{loggedIn ? t('player.lockedTitle') : t('player.loginTitle')}</h2>
      <p className="max-w-sm text-sm text-muted">{loggedIn ? t('player.lockedBody') : t('player.loginBody')}</p>
      {loggedIn
        ? <button onClick={onEnroll} disabled={busy} className="btn-primary">{busy ? <Loader2 size={18} className="animate-spin" /> : <GraduationCap size={18} />} {Number(course.price_usd) > 0 ? t('courseDetails.enrollPaid') : t('courseDetails.enrollFree')}</button>
        : <Link to={`/login?next=${encodeURIComponent(location)}`} className="btn-primary"><LogIn size={18} /> {t('auth.loginButton')}</Link>}
    </div>
  );
}

export default function LessonPlayer() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, toast, setCheckout } = useApp();
  const { refresh: refreshUser } = useAuth();
  const { data, error, reload } = useApi(`/lessons?course=${encodeURIComponent(slug)}`);
  const [lessons, setLessons] = useState([]);
  const [saving, setSaving] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [subLang, setSubLang] = useState(subtitleLanguages[0]);
  const [tab, setTab] = useState('notes');
  const [finished, setFinished] = useState(null); // certificate code after finishing

  useEffect(() => { if (data) setLessons(data.lessons); }, [data]);

  const course = data?.course;
  const requested = Number(params.get('lesson'));
  const current = useMemo(() => {
    if (!lessons.length) return null;
    return lessons.find((l) => l.id === requested) || lessons.find((l) => !l.completed && !l.locked) || lessons[0];
  }, [lessons, requested]);
  const idx = current ? lessons.indexOf(current) : -1;

  // Pin the chosen lesson in the URL so ticking it complete never jumps to another lesson.
  useEffect(() => {
    if (current && requested !== current.id) setParams({ lesson: String(current.id) }, { replace: true });
  }, [current, requested, setParams]);

  useEffect(() => { setPlaying(false); setElapsed(0); setTab('notes'); }, [current?.id]);
  useEffect(() => {
    if (!playing || !current) return undefined;
    const id = setInterval(() => setElapsed((e) => (e >= current.duration_minutes * 60 ? e : e + 7)), 250);
    return () => clearInterval(id);
  }, [playing, current]);

  if (error && !data) {
    return error.status === 404
      ? <EmptyState icon={SearchX} title={t('player.notFound')} action={<Link to="/courses" className="btn-primary mt-2">{t('player.back')}</Link>} />
      : <ErrorState error={error} onRetry={reload} />;
  }
  if (!data || !current) return <PageSkeleton />;

  const enrolled = course.enrolled;
  const doneCount = lessons.filter((l) => l.completed).length;
  const coursePct = Math.round((doneCount / lessons.length) * 100);
  const total = current.duration_minutes * 60;
  const pct = Math.min(100, (elapsed / total) * 100);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const nextLesson = lessons[idx + 1];
  const goTo = (lesson) => setParams({ lesson: String(lesson.id) });

  const enroll = async () => {
    if (Number(course.price_usd) > 0) {
      setCheckout({ kind: 'course', item: { ...course, lessons_count: lessons.length }, onDone: () => reload() });
      return;
    }
    setEnrolling(true);
    try {
      await api(`/courses/${course.slug}/enroll`, { method: 'POST' });
      celebrate();
      toast(t('courseDetails.enrolledToast', { title: course.title }));
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setEnrolling(false);
    }
  };

  // Optimistic: tick immediately, roll back with an error toast if saving fails.
  const toggleComplete = async () => {
    const lesson = current;
    const value = !lesson.completed;
    setLessons((ls) => ls.map((l) => (l.id === lesson.id ? { ...l, completed: value } : l)));
    setSaving(true);
    try {
      const res = await api('/progress', { method: 'POST', body: { lessonId: lesson.id, completed: value, minutes: lesson.duration_minutes } });
      if (value) refreshUser();
      if (res.justCompleted && res.certificateCode) {
        bigCelebration();
        setFinished(res.certificateCode);
      } else if (value) {
        toast(t('player.lessonSaved'));
      }
    } catch (err) {
      setLessons((ls) => ls.map((l) => (l.id === lesson.id ? { ...l, completed: !value } : l)));
      toast(t('player.saveFailed', { reason: err.message }), 'error');
    } finally {
      setSaving(false);
    }
  };

  const onScored = (score) => setLessons((ls) => ls.map((l) => (l.id === current.id ? { ...l, quiz_score: enrolled ? score : l.quiz_score } : l)));

  return (
    <div>
      <Link to={`/courses/${course.slug}`} className="mb-2 inline-flex min-h-[40px] items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> {t('player.backToCourse')}</Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="min-w-0 space-y-5">
            {current.locked ? (
              <>
                <div>
                  <p className="eyebrow">{course.title}</p>
                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{current.title}</h1>
                </div>
                <LockedLesson course={course} loggedIn={data.loggedIn} onEnroll={enroll} busy={enrolling} />
              </>
            ) : (
              <>
                {/* Video (placeholder) */}
                <div className="relative aspect-video overflow-hidden rounded-3xl border border-line/10 shadow-card" style={{ background: `radial-gradient(circle at 30% 20%, ${course.cover_gradient[0]}, #0b0716 72%)` }}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
                  <AnimatePresence>
                    {playing && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                        {[0, 1, 2].map((i) => (
                          <motion.span key={i} className="absolute rounded-full border border-violet-400/40" initial={{ width: 60, height: 60, opacity: 0.8 }} animate={{ width: 360, height: 360, opacity: 0 }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8 }} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute left-4 top-4 flex items-center gap-2 text-white">
                    <LogoMark size={26} />
                    <span className="rounded-full bg-black/40 px-3 py-1 text-xs backdrop-blur">{t('dashboard.lessonOf', { a: idx + 1, b: lessons.length })}</span>
                    {current.is_free_preview && !enrolled && <span className="flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-[11px] font-bold text-[#2a1a00]"><Eye size={12} /> {t('courseDetails.preview')}</span>}
                  </div>
                  <button onClick={() => setPlaying((p) => !p)} className="absolute inset-0 m-auto grid h-20 w-20 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/25" aria-label={playing ? t('common.pause') : t('player.play')}>
                    {playing ? <Pause size={34} /> : <Play size={34} className="ml-1" />}
                  </button>
                  <AnimatePresence>
                    {playing && current.notes && (
                      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-6 bottom-16 mx-auto w-fit max-w-[90%] rounded-lg bg-black/60 px-3 py-1.5 text-center text-xs text-white sm:text-sm">
                        [{subLang}] {current.notes.split('\n')[Math.floor(elapsed / 40) % current.notes.split('\n').length]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400 transition-[width]" style={{ width: `${pct}%` }} /></div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <button onClick={() => setPlaying((p) => !p)} className="-m-2 grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10" aria-label={playing ? t('common.pause') : t('player.play')}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
                      <Volume2 size={16} aria-hidden="true" />
                      <span>{fmt(elapsed)} / {fmt(total)}</span>
                      <label className="ml-auto flex items-center gap-1.5">
                        <Captions size={16} />
                        <span className="sr-only">{t('player.subtitles')}</span>
                        <select value={subLang} onChange={(e) => setSubLang(e.target.value)} className="min-h-[34px] rounded-md bg-black/40 px-2 py-1.5 text-xs outline-none">
                          {subtitleLanguages.map((l) => <option key={l} className="text-black">{l}</option>)}
                        </select>
                      </label>
                      <Maximize size={16} className="hidden sm:block" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow">{course.title}</p>
                    <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{current.title}</h1>
                    <p className="mt-1 text-sm text-muted">{course.instructor_name} · {t('common.min', { n: current.duration_minutes })} · {course.language}</p>
                  </div>
                  {enrolled ? (
                    <button onClick={toggleComplete} disabled={saving} aria-pressed={current.completed}
                      className={`btn shrink-0 border ${current.completed ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400' : 'border-line/20 bg-surface/50 text-ink hover:border-violet-500/50'}`}>
                      <motion.span key={String(current.completed)} initial={{ scale: 0.5 }} animate={{ scale: 1 }}>{current.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}</motion.span>
                      {current.completed ? t('player.completed') : t('player.markComplete')}
                    </button>
                  ) : (
                    <button onClick={() => (data.loggedIn ? enroll() : navigate(`/login?next=${encodeURIComponent(`/learn/${course.slug}`)}`))} className="btn-primary shrink-0" disabled={enrolling}>
                      {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} {t('player.enrollToSave')}
                    </button>
                  )}
                </div>

                {/* Mobile tabs */}
                <div className="glass flex gap-1 p-1 md:hidden" role="tablist">
                  {[['notes', FileText], ['quiz', HelpCircle]].map(([k, Icon]) => (
                    <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl text-xs font-semibold transition ${tab === k ? 'bg-violet-600/25 text-ink' : 'text-muted'}`}>
                      <Icon size={15} /> {t(`player.${k}`)}
                    </button>
                  ))}
                </div>

                <div className={`glass p-5 sm:p-6 ${tab === 'notes' ? '' : 'hidden md:block'}`}>
                  <h3 className="flex items-center gap-2 font-semibold"><FileText size={18} className="text-violet-400" /> {t('player.notes')}</h3>
                  <ul className="mt-3 space-y-3 text-sm leading-relaxed">
                    {current.notes.split('\n').filter(Boolean).map((n, i) => <li key={i} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />{n}</li>)}
                  </ul>
                </div>

                <div className={`glass p-5 sm:p-6 ${tab === 'quiz' ? '' : 'hidden md:block'}`}>
                  <h3 className="mb-4 flex items-center gap-2 font-semibold"><HelpCircle size={18} className="text-violet-400" /> {t('player.quiz')}
                    {current.quiz_score != null && <span className="ml-auto rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-400">{t('player.lastScore', { n: current.quiz_score })}</span>}
                  </h3>
                  <Quiz key={current.id} lesson={current} canSave={enrolled} onScored={onScored} />
                </div>

                <div className="glass flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
                  <p className="text-sm text-muted">{current.completed ? `✨ ${t('player.lessonDone')}` : t('player.finishHint')}</p>
                  {nextLesson ? (
                    <button className="btn-primary w-full sm:w-auto" onClick={() => goTo(nextLesson)}>{t('player.nextLesson')} <ChevronRight size={18} /></button>
                  ) : data.certificateCode ? (
                    <Link to={`/certificates/${data.certificateCode}`} className="btn-primary w-full sm:w-auto"><Award size={18} /> {t('courseDetails.viewCertificate')}</Link>
                  ) : null}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Outline */}
        <aside className="glass h-fit p-5 xl:sticky xl:top-24">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: gradient(course) }}><GraduationCap size={20} /></div>
            <div className="min-w-0"><h3 className="truncate font-semibold">{course.title}</h3><p className="text-xs text-muted">{t('player.lessons')}</p></div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-line/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" animate={{ width: `${coursePct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted">{t('player.progressSummary', { done: doneCount, total: lessons.length, pct: coursePct })}</p>
          <ol className="mt-4 space-y-1.5">
            {lessons.map((l, i) => {
              const active = l.id === current.id;
              return (
                <li key={l.id}>
                  <button onClick={() => goTo(l)} aria-current={active ? 'step' : undefined} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${active ? 'bg-violet-600/20 ring-1 ring-violet-500/40' : 'hover:bg-surface/60'} ${l.locked ? 'opacity-60' : ''}`}>
                    {l.completed ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : l.locked ? <Lock size={18} className="shrink-0 text-muted" /> : <Play size={18} className="shrink-0 text-violet-400" />}
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{i + 1}. {l.title}</span><span className="text-xs text-muted">{t('common.min', { n: l.duration_minutes })}{l.is_free_preview && !enrolled ? ` · ${t('courseDetails.preview')}` : ''}</span></span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>

      {/* Course completed */}
      {createPortal(
        <AnimatePresence>
          {finished && (
            <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="glass w-full max-w-md !bg-surface/95 p-8 text-center" role="dialog" aria-modal="true" aria-labelledby="done-title">
                <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-gold via-amber-400 to-orange-500 text-white shadow-[0_0_60px_-6px_rgba(245,199,107,.8)]">
                  <Award size={48} />
                </motion.div>
                <h2 id="done-title" className="mt-6 text-3xl font-bold text-brand">{t('player.congrats')}</h2>
                <p className="mt-2 text-muted">{t('player.congratsSub', { course: course.title })}</p>
                <p className="mt-4 font-mono text-sm text-gold">{finished}</p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button onClick={() => navigate(`/certificates/${finished}`)} className="btn-primary flex-1"><Award size={18} /> {t('player.openCertificate')}</button>
                  <button onClick={() => { setFinished(null); navigate('/dashboard'); }} className="btn-ghost flex-1">{t('player.close')}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
