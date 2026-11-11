import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Globe2, Loader2, Mail, Sparkles, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import PasswordInput, { StrengthMeter } from '../components/PasswordInput';
import { Field, inputProps } from '../components/ui';
import { safeNext } from '../hooks/useRequireLogin';
import { isOffline } from '../lib/api';
import { countries, currencies, courseLanguages } from '../data/constants';
import { signupSchema } from '../../shared/schemas.js';

const stepOneSchema = signupSchema.pick({ fullName: true, email: true, password: true });

// Best guesses from the browser's time zone — the learner can change them.
const ZONE_COUNTRY = {
  'Africa/Kampala': 'Uganda', 'Africa/Nairobi': 'Kenya', 'Africa/Lagos': 'Nigeria', 'Africa/Accra': 'Ghana', 'Africa/Johannesburg': 'South Africa',
  'Africa/Cairo': 'Egypt', 'Africa/Dakar': 'Senegal', 'Africa/Kigali': 'Rwanda', 'Africa/Dar_es_Salaam': 'Tanzania', 'Africa/Addis_Ababa': 'Ethiopia',
  'Asia/Dubai': 'UAE', 'Asia/Riyadh': 'Saudi Arabia', 'Asia/Amman': 'Jordan', 'Asia/Qatar': 'Qatar', 'Asia/Kolkata': 'India', 'Asia/Calcutta': 'India',
  'Asia/Karachi': 'Pakistan', 'Asia/Dhaka': 'Bangladesh', 'Asia/Jakarta': 'Indonesia', 'Asia/Manila': 'Philippines', 'Asia/Tokyo': 'Japan',
  'Asia/Seoul': 'South Korea', 'Asia/Singapore': 'Singapore', 'Europe/London': 'United Kingdom', 'Europe/Paris': 'France', 'Europe/Berlin': 'Germany',
  'Europe/Madrid': 'Spain', 'Europe/Rome': 'Italy', 'America/Sao_Paulo': 'Brazil', 'America/Mexico_City': 'Mexico', 'America/New_York': 'United States',
  'America/Chicago': 'United States', 'America/Los_Angeles': 'United States', 'America/Toronto': 'Canada', 'Australia/Sydney': 'Australia',
};
const COUNTRY_CURRENCY = { Uganda: 'UGX', Kenya: 'KES', Nigeria: 'NGN', UAE: 'AED', India: 'INR', 'United Kingdom': 'GBP', France: 'EUR', Germany: 'EUR', Spain: 'EUR', Italy: 'EUR', Netherlands: 'EUR', Ireland: 'EUR', Portugal: 'EUR', Senegal: 'EUR' };

function detectZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
}

function errorsFrom(result) {
  const errors = {};
  for (const issue of result.error.issues) if (!errors[issue.path[0]]) errors[issue.path[0]] = issue.message;
  return errors;
}

function Slider({ id, label, value, min, max, step, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="label !mb-0">{label}</label>
        <span className="font-display text-lg font-bold text-violet-400">{format(value)}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider w-full" style={{ '--pct': `${pct}%` }} />
    </div>
  );
}

export default function Signup() {
  const { t, toast } = useApp();
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const timezone = useMemo(detectZone, []);
  const guessedCountry = ZONE_COUNTRY[timezone] || 'Uganda';

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    country: guessedCountry, currency: COUNTRY_CURRENCY[guessedCountry] || 'USD', language: 'English',
    weeklyGoalLessons: 5, weeklyGoalMinutes: 120,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = `${t('auth.signupTitle')} · Novaris`; return () => { document.title = 'Novaris · AI Training & Publishing'; }; }, [t]);
  useEffect(() => { if (user && !busy) navigate(next, { replace: true }); }, [user, busy, navigate, next]);

  const set = (k) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => {
      const nextForm = { ...f, [k]: value };
      if (k === 'country' && COUNTRY_CURRENCY[value]) nextForm.currency = COUNTRY_CURRENCY[value];
      return nextForm;
    });
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const goNext = (e) => {
    e.preventDefault();
    const check = stepOneSchema.safeParse(form);
    if (!check.success) { setErrors(errorsFrom(check)); return; }
    setErrors({});
    setDir(1);
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, timezone };
    const check = signupSchema.safeParse(payload);
    if (!check.success) {
      const errs = errorsFrom(check);
      setErrors(errs);
      if (errs.fullName || errs.email || errs.password) { setDir(-1); setStep(1); }
      return;
    }
    setBusy(true);
    try {
      const u = await signup(payload);
      const colors = ['#8b5cf6', '#3b82f6', '#f5c76b', '#ffffff'];
      confetti({ particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.6 }, colors, zIndex: 90 });
      setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.4 }, colors, zIndex: 90 }), 250);
      toast(t('auth.welcomeNew', { name: u.firstName }));
      setTimeout(() => navigate(next, { replace: true }), 900);
    } catch (err) {
      const fe = err.fieldErrors || {};
      setErrors(fe);
      if (fe.fullName || fe.email || fe.password) { setDir(-1); setStep(1); }
      toast(isOffline(err) ? t('errors.dbBody') : err.message, 'error');
      setBusy(false);
    }
  };

  const slide = { enter: (d) => ({ opacity: 0, x: d * 40 }), center: { opacity: 1, x: 0 }, exit: (d) => ({ opacity: 0, x: d * -40 }) };

  return (
    <AuthLayout>
      <div className="glass overflow-hidden p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-muted">
            <span>{t('auth.stepOf', { a: step, b: 2 })}</span>
            <span>{step === 1 ? t('auth.step1Label') : t('auth.step2Label')}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={step * 50}>
            <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-gold" animate={{ width: `${step * 50}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
        </div>

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {step === 1 ? (
            <motion.form key="s1" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} onSubmit={goNext} noValidate>
              <p className="eyebrow">{t('auth.signupEyebrow')}</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('auth.signupTitle')}</h1>
              <p className="mt-2 text-muted">{t('auth.signupSub')}</p>
              <div className="mt-7 space-y-4">
                <Field id="su-name" label={t('auth.fullName')} error={errors.fullName}>
                  <div className="relative">
                    <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input {...inputProps('su-name', errors.fullName)} className={`${inputProps('su-name', errors.fullName).className} !pl-11`} autoComplete="name" value={form.fullName} onChange={set('fullName')} placeholder={t('auth.namePlaceholder')} />
                  </div>
                </Field>
                <Field id="su-email" label={t('auth.email')} error={errors.email}>
                  <div className="relative">
                    <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input {...inputProps('su-email', errors.email)} className={`${inputProps('su-email', errors.email).className} !pl-11`} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                  </div>
                </Field>
                <Field id="su-password" label={t('auth.password')} error={errors.password}>
                  <PasswordInput id="su-password" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
                  <StrengthMeter password={form.password} />
                </Field>
                <button className="btn-primary w-full py-4 text-base">{t('auth.continue')} <ArrowRight size={18} /></button>
              </div>
            </motion.form>
          ) : (
            <motion.form key="s2" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} onSubmit={submit} noValidate>
              <p className="eyebrow">{t('auth.step2Eyebrow')}</p>
              <h1 className="mt-2 text-3xl font-bold">{t('auth.step2Title', { name: form.fullName.split(' ')[0] })}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                <Globe2 size={15} className="text-violet-400" /> {t('auth.detectedZone')} <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 font-semibold text-violet-400">{timezone}</span>
              </p>
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="su-country" label={t('auth.country')} error={errors.country}>
                    <select {...inputProps('su-country', errors.country)} value={form.country} onChange={set('country')}>{countries.map((c) => <option key={c}>{c}</option>)}</select>
                  </Field>
                  <Field id="su-currency" label={t('auth.currency')} error={errors.currency}>
                    <select {...inputProps('su-currency', errors.currency)} value={form.currency} onChange={set('currency')}>{currencies.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.symbol.trim()}</option>)}</select>
                  </Field>
                </div>
                <Field id="su-language" label={t('auth.language')} error={errors.language}>
                  <select {...inputProps('su-language', errors.language)} value={form.language} onChange={set('language')}>{courseLanguages.map((l) => <option key={l}>{l}</option>)}</select>
                </Field>
                <div className="space-y-5 rounded-2xl border border-line/15 bg-surface/40 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} className="text-gold" /> {t('auth.goalsTitle')}</p>
                  <Slider id="su-goal-lessons" label={t('auth.goalLessons')} value={form.weeklyGoalLessons} min={1} max={20} step={1} onChange={set('weeklyGoalLessons')} format={(v) => t('auth.lessonsPerWeek', { n: v })} />
                  <Slider id="su-goal-minutes" label={t('auth.goalMinutes')} value={form.weeklyGoalMinutes} min={30} max={600} step={15} onChange={set('weeklyGoalMinutes')} format={(v) => t('auth.minutesPerWeek', { n: v })} />
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button type="button" onClick={() => { setDir(-1); setStep(1); }} className="btn-ghost sm:w-auto" disabled={busy}><ArrowLeft size={18} /> {t('auth.back')}</button>
                  <button className="btn-primary flex-1 py-4 text-base" disabled={busy}>
                    {busy ? <><Loader2 size={18} className="animate-spin" /> {t('auth.creating')}</> : <><Sparkles size={18} /> {t('auth.createButton')}</>}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-muted">
          {t('auth.haveAccount')}{' '}
          <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-violet-400 hover:text-violet-300">{t('auth.loginLink')}</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
