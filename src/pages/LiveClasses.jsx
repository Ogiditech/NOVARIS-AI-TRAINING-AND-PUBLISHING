import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CalendarPlus, Clock, Globe, Users, Check, Languages, Video, CalendarX, Loader2, Flame, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import useRequireLogin from '../hooks/useRequireLogin';
import { api } from '../lib/api';
import { celebrate } from '../lib/celebrate';
import { SectionHeader, EmptyState } from '../components/ui';
import { CardGridSkeleton, ErrorState } from '../components/states';
import { formatLocal, localDayKey, toICSDate, tzAbbrev, userTimeZone } from '../utils/time';

function ClassCard({ s, index, onChange }) {
  const { t, toast } = useApp();
  const requireLogin = useRequireLogin();
  const [busy, setBusy] = useState(false);
  const start = new Date(s.start_time);
  const full = s.seats_left <= 0 && !s.booked;
  const almostFull = !full && s.seats_left > 0 && s.seats_left < 3;
  // A class that is already running can be joined (if booked) but no longer booked or cancelled.
  const started = start.getTime() <= Date.now();
  const fill = ((s.capacity - s.seats_left) / s.capacity) * 100;

  const book = () => requireLogin(async () => {
    setBusy(true);
    try {
      const res = await api('/bookings', { method: 'POST', body: { id: s.id } });
      onChange(s.id, { booked: true, seats_left: res.seatsLeft });
      if (!res.alreadyBooked) { celebrate(); toast(t('live.bookedToast', { topic: s.title })); }
    } catch (err) {
      if (err.data?.code === 'class_full') onChange(s.id, { seats_left: 0 });
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }, { message: t('live.loginToBook') });

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await api(`/bookings?id=${s.id}`, { method: 'DELETE' });
      onChange(s.id, { booked: false, seats_left: res.seatsLeft ?? s.seats_left + 1 });
      toast(t('live.cancelledToast', { topic: s.title }), 'info');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const addToCalendar = () => {
    const end = new Date(start.getTime() + s.duration_minutes * 60000);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Novaris//Live//EN', 'BEGIN:VEVENT', `UID:class-${s.id}@novaris.app`, `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(start)}`, `DTEND:${toICSDate(end)}`, `SUMMARY:${t('certificate.calSummary', { topic: s.title })}`, `DESCRIPTION:${t('certificate.calDescription', { instructor: s.instructor_name, language: s.language })}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `novaris-class-${s.id}.ics` });
    a.click();
    URL.revokeObjectURL(url);
    toast(t('live.calendarToast'), 'info');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -3 }} className={`glass flex flex-col gap-5 p-5 md:flex-row md:items-center ${s.booked ? 'ring-1 ring-emerald-500/40' : ''}`} data-class={s.id}>
      <div className="flex items-center gap-4 md:w-44 md:flex-col md:items-start md:gap-1">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-glow md:hidden"><Video size={22} /></div>
        <div>
          <p className="font-display text-2xl font-bold">{formatLocal(start, { hour: 'numeric', minute: '2-digit' })}</p>
          <p className="flex items-center gap-1 text-xs text-muted"><Clock size={12} /> {t('live.min', { n: s.duration_minutes })} · {tzAbbrev(start)}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-400"><Languages size={12} /> {s.language}</span>
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 font-semibold text-violet-400">{s.level}</span>
          <span className="rounded-full bg-line/10 px-2 py-0.5 font-semibold text-muted">{s.topic}</span>
          {started && <span className="flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 font-bold text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> {t('live.liveNow')}</span>}
          {almostFull && !started && <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-bold text-amber-400"><Flame size={12} /> {t('live.almostFull')}</span>}
          {s.booked && <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-bold text-emerald-400"><Check size={12} /> {t('live.booked')}</span>}
        </div>
        <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
        <p className="text-sm text-muted">{s.instructor_name}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 max-w-48 flex-1 overflow-hidden rounded-full bg-line/10">
            <motion.div className={`h-full rounded-full ${s.seats_left <= 0 ? 'bg-rose-500' : almostFull ? 'bg-amber-400' : 'bg-emerald-400'}`} initial={{ width: 0 }} animate={{ width: `${fill}%` }} transition={{ duration: 1, delay: 0.2 }} />
          </div>
          <span className={`flex items-center gap-1 text-xs font-semibold ${s.seats_left <= 0 ? 'text-rose-400' : almostFull ? 'text-amber-400' : 'text-muted'}`} data-seats>
            <Users size={13} /> {s.seats_left <= 0 ? t('live.full') : t('live.seats', { n: s.seats_left })}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 md:w-48 md:flex-col">
        {s.booked ? (
          <>
            {/* Placeholder meeting link — replace with the real video-call URL before launch. */}
            <a href={`https://meet.novaris.example/class-${s.id}`} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1"><Video size={16} /> {t('dashboard.join')}</a>
            {!started && <button onClick={cancel} disabled={busy} className="btn-ghost flex-1 text-rose-400">{busy ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} {t('live.cancel')}</button>}
          </>
        ) : started ? (
          <button disabled className="btn-ghost flex-1">{t('live.started')}</button>
        ) : full ? (
          <button onClick={() => toast(t('live.waitlistToast'), 'info')} className="btn-ghost flex-1">{t('live.waitlist')}</button>
        ) : (
          <button onClick={book} disabled={busy} className="btn-primary flex-1">{busy ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />} {t('live.book')}</button>
        )}
        <button onClick={addToCalendar} className="btn-ghost flex-1" aria-label={t('live.calendar')}><CalendarPlus size={16} /> <span className="md:hidden lg:inline">{t('live.calendar')}</span></button>
      </div>
    </motion.div>
  );
}

export default function LiveClasses() {
  const { t } = useApp();
  const { data, error, reload, setData } = useApi('/classes');
  const classes = useMemo(() => data?.classes || [], [data]);

  // The next 14 days in the learner's own time zone.
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return { key: localDayKey(d), date: d };
  }), []);
  const [day, setDay] = useState(null);
  const counts = useMemo(() => Object.fromEntries(days.map(({ key }) => [key, classes.filter((c) => localDayKey(new Date(c.start_time)) === key).length])), [days, classes]);
  useEffect(() => {
    if (!day && data) setDay(days.find((d) => counts[d.key])?.key || days[0].key);
  }, [day, data, days, counts]);
  const list = classes.filter((s) => localDayKey(new Date(s.start_time)) === day);

  const onChange = (id, patch) => setData((d) => ({ ...d, classes: d.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  return (
    <div>
      <SectionHeader eyebrow={t('nav.live')} title={t('live.title')} sub={<>{t('live.sub')} <span className="inline-flex items-center gap-1 font-semibold text-ink"><Globe size={14} className="text-violet-400" /> {userTimeZone} ({tzAbbrev()})</span></>} />

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {days.map(({ key, date }, i) => {
          const active = day === key;
          return (
            <button key={key} onClick={() => setDay(key)} aria-pressed={active} className={`relative flex min-w-[76px] shrink-0 flex-col items-center rounded-2xl border px-3 py-3 transition ${active ? 'border-violet-500/60 text-ink' : 'border-line/15 bg-surface/40 text-muted hover:text-ink'}`}>
              {active && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-600/30 to-blue-600/10" />}
              <span className="relative text-[11px] font-semibold uppercase">{i === 0 ? t('live.today') : formatLocal(date, { weekday: 'short' })}</span>
              <span className="relative font-display text-2xl font-bold">{formatLocal(date, { day: 'numeric' })}</span>
              <span className="relative mt-1 flex h-1 gap-0.5">{Array.from({ length: Math.min(counts[key] || 0, 4) }).map((_, j) => <span key={j} className="h-1 w-1 rounded-full bg-violet-400" />)}</span>
            </button>
          );
        })}
      </div>

      {error && !data ? <ErrorState error={error} onRetry={reload} /> : !data ? <CardGridSkeleton count={3} cover="h-0" className="space-y-4" /> : (
        <AnimatePresence mode="wait">
          <motion.div key={day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {list.length === 0 && <EmptyState icon={CalendarX} title={t('live.noClasses')} />}
            {list.map((s, i) => <ClassCard key={s.id} s={s} index={i} onChange={onChange} />)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
