import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Gem, MapPin, CalendarDays, Lock, BookOpen, Sparkles, Flame, Target, Globe, Bot, Trophy, Video, Pencil, Loader2, Save, X, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { api } from '../lib/api';
import { Counter, Field, inputProps } from '../components/ui';
import { DataState, PageSkeleton } from '../components/states';
import { LogoMark } from '../components/Logo';
import { Avatar } from '../components/UserMenu';
import MyLibrary from '../components/MyLibrary';
import { countries, currencies, courseLanguages } from '../data/constants';
import { profileSchema } from '../../shared/schemas.js';

const badgeIcons = { Sparkles, Flame, Target, Globe, BookOpen, Bot, Trophy, Video };

function GoalSlider({ id, label, value, min, max, step, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="label !mb-0">{label}</label>
        <span className="font-display text-lg font-bold text-violet-400">{format(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="range-slider w-full" style={{ '--pct': `${pct}%` }} />
    </div>
  );
}

function EditProfile({ user, onClose, onSaved }) {
  const { t, toast } = useApp();
  const [form, setForm] = useState({
    fullName: user.fullName, country: user.country, currency: user.currency, language: user.language,
    weeklyGoalLessons: user.weeklyGoalLessons, weeklyGoalMinutes: user.weeklyGoalMinutes,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { const v = e?.target ? e.target.value : e; setForm((f) => ({ ...f, [k]: v })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };

  const save = async (e) => {
    e.preventDefault();
    const check = profileSchema.safeParse(form);
    if (!check.success) {
      const found = {};
      for (const issue of check.error.issues) if (!found[issue.path[0]]) found[issue.path[0]] = issue.message;
      setErrors(found);
      return;
    }
    setBusy(true);
    try {
      const data = await api('/profile', { method: 'PATCH', body: form });
      onSaved(data.user);
      toast(t('profile.saved'));
    } catch (err) {
      setErrors(err.fieldErrors || {});
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={save} noValidate className="overflow-hidden">
      <div className="glass mt-6 space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('profile.editTitle')}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:text-ink" aria-label={t('common.close')}><X size={18} /></button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="pr-name" label={t('auth.fullName')} error={errors.fullName}><input {...inputProps('pr-name', errors.fullName)} value={form.fullName} onChange={set('fullName')} autoComplete="name" /></Field>
          <Field id="pr-country" label={t('auth.country')} error={errors.country}>
            <select {...inputProps('pr-country', errors.country)} value={form.country} onChange={set('country')}>{countries.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field id="pr-currency" label={t('auth.currency')} error={errors.currency}>
            <select {...inputProps('pr-currency', errors.currency)} value={form.currency} onChange={set('currency')}>{currencies.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.symbol.trim()}</option>)}</select>
          </Field>
          <Field id="pr-language" label={t('auth.language')} error={errors.language}>
            <select {...inputProps('pr-language', errors.language)} value={form.language} onChange={set('language')}>{courseLanguages.map((l) => <option key={l}>{l}</option>)}</select>
          </Field>
        </div>
        <div className="grid gap-5 rounded-2xl border border-line/15 bg-surface/40 p-4 sm:grid-cols-2">
          <GoalSlider id="pr-goal-lessons" label={t('auth.goalLessons')} value={form.weeklyGoalLessons} min={1} max={20} step={1} onChange={set('weeklyGoalLessons')} format={(v) => t('auth.lessonsPerWeek', { n: v })} />
          <GoalSlider id="pr-goal-minutes" label={t('auth.goalMinutes')} value={form.weeklyGoalMinutes} min={30} max={600} step={15} onChange={set('weeklyGoalMinutes')} format={(v) => t('auth.minutesPerWeek', { n: v })} />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">{t('checkout.cancel')}</button>
          <button className="btn-primary" disabled={busy}>{busy ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t('profile.save')}</button>
        </div>
      </div>
    </motion.form>
  );
}

function Content({ data, reload }) {
  const { t, setCurrencyCode } = useApp();
  const { updateUser } = useAuth();
  const [user, setUser] = useState(data.user);
  const [editing, setEditing] = useState(false);
  useEffect(() => setUser(data.user), [data.user]);
  const { stats, badges, certificates } = data;
  const fmt = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const onSaved = (u) => {
    setUser(u);
    updateUser(u);
    setCurrencyCode(u.currency);
    setEditing(false);
    reload();
  };

  const statTiles = [
    ['enrolled', stats.enrolled], ['completed', stats.completed], ['hours', Math.round(stats.hours)], ['streak', stats.streak],
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden">
        <div className="h-32 sm:h-40" style={{ background: `linear-gradient(120deg, ${user.avatarColor}, #2563eb)` }}>
          <div className="h-full w-full opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        </div>
        <div className="flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:px-8">
          <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }} className="-mt-14 w-fit rounded-[30px] border-4 border-bg shadow-glow">
            <Avatar user={user} size={104} className="!rounded-[26px] !ring-0" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold">{user.fullName}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1"><MapPin size={14} /> {user.country}</span>
              <span className="flex items-center gap-1"><CalendarDays size={14} /> {t('profile.memberSince', { date: fmt(user.createdAt) })}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {user.timezone}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold"><Gem size={16} /> {user.plan}</span>
            <button onClick={() => setEditing((e) => !e)} className="btn-ghost" aria-expanded={editing}><Pencil size={16} /> {t('profile.edit')}</button>
            <Link to="/pricing" className="btn-primary">{t('profile.upgrade')}</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-line/10 sm:grid-cols-4">
          {statTiles.map(([k, v]) => (
            <div key={k} className="p-4 text-center">
              <p className="font-display text-2xl font-bold sm:text-3xl"><Counter to={v} duration={1.2} /></p>
              <p className="text-xs text-muted">{t(`profile.stats.${k}`)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>{editing && <EditProfile user={user} onClose={() => setEditing(false)} onSaved={onSaved} />}</AnimatePresence>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold"><Award className="text-gold" /> {t('profile.certificates')}</h2>
        {certificates.length === 0 ? (
          <div className="glass flex flex-col items-center gap-3 px-6 py-10 text-center">
            <Award size={30} className="text-muted" />
            <p className="text-sm text-muted">{t('profile.noCerts')}</p>
            <Link to="/courses" className="btn-primary">{t('library.exploreCourses')}</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((c, i) => (
              <motion.div key={c.certificate_code} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -5, rotate: -0.5 }}>
                <Link to={`/certificates/${c.certificate_code}`} className="relative block overflow-hidden rounded-3xl border border-gold/25 p-5 shadow-card" style={{ background: `linear-gradient(140deg, ${c.cover_gradient[0]}66, #120c26 75%)` }}>
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[10px] border-gold/15" />
                  <div className="flex items-center gap-2 text-white/70"><LogoMark size={22} /><span className="text-[10px] font-semibold uppercase tracking-[.25em]">{t('profile.certLabel')}</span></div>
                  <p className="mt-4 font-display text-lg font-bold leading-snug text-white">{c.course_title}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-white/60">{t('profile.issued', { date: fmt(c.issued_at) })}</span>
                    <span className="font-mono text-[11px] text-gold">{c.certificate_code}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold"><Sparkles className="text-violet-400" /> {t('profile.badges')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {badges.map((b, i) => {
            const Icon = badgeIcons[b.icon] || Award;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className={`glass flex flex-col items-center p-5 text-center ${b.earned ? '' : 'opacity-50 grayscale'}`}>
                <div className={`relative grid h-16 w-16 place-items-center rounded-full ${b.earned ? 'bg-gradient-to-br from-violet-500 via-blue-500 to-gold text-white shadow-glow' : 'bg-line/10 text-muted'}`}>
                  <Icon size={28} />
                  {!b.earned && <Lock size={14} className="absolute -bottom-1 -right-1 rounded-full bg-surface p-0.5" />}
                </div>
                <p className="mt-3 text-sm font-semibold">{t(`badges.${b.id}.name`)}</p>
                <p className="mt-0.5 text-xs text-muted">{t(`badges.${b.id}.desc`)}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <MyLibrary />
    </div>
  );
}

export default function Profile() {
  const { data, error, loading, reload } = useApi('/profile');
  return <DataState data={data} error={error} loading={loading} onRetry={reload} skeleton={<PageSkeleton />}>{(d) => <Content data={d} reload={reload} />}</DataState>;
}
