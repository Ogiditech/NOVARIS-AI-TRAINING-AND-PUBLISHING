import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Send, PenTool, Search, Factory, Rocket, Loader2, Copy, Mail, ClipboardCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Field, inputProps } from './ui';
import { api } from '../lib/api';
import { celebrate } from '../lib/celebrate';
import { categories, countries } from '../data/constants';
import { submissionSchema } from '../../shared/schemas.js';

function SuccessScreen({ result, onAgain }) {
  const { t, toast } = useApp();
  const next = t('publish.next');
  const icons = [Mail, ClipboardCheck, Factory, Rocket];
  const copy = async () => {
    try { await navigator.clipboard.writeText(result.reference); toast(t('publish.copied')); } catch { /* clipboard blocked */ }
  };
  return (
    <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8" role="status">
      <div className="flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_0_40px_-6px_rgba(16,185,129,.7)]"><Check size={32} /></motion.div>
        <h3 className="mt-4 text-2xl font-bold">{t('publish.successTitle')}</h3>
        <p className="mt-1 text-sm text-muted">{t('publish.successSub', { title: result.bookTitle })}</p>
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-line/20 bg-surface/70 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t('publish.reference')}</span>
          <span className="font-mono text-lg font-bold text-ink" data-reference>{result.reference}</span>
          <button onClick={copy} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-line/10 hover:text-ink" aria-label={t('publish.copy')}><Copy size={16} /></button>
        </div>
      </div>
      <h4 className="mt-8 font-semibold">{t('publish.nextTitle')}</h4>
      <ol className="mt-3 space-y-3">
        {next.map((step, i) => {
          const Icon = icons[i];
          return (
            <motion.li key={step.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400"><Icon size={17} /></span>
              <span><span className="block text-sm font-semibold">{step.title}</span><span className="text-xs text-muted">{step.body}</span></span>
            </motion.li>
          );
        })}
      </ol>
      <button onClick={onAgain} className="btn-ghost mt-6 w-full">{t('publish.another')}</button>
    </motion.div>
  );
}

// "Publish with Novaris" — saves manuscript submissions to the database.
export default function PublishSection({ standalone = false }) {
  const { t, toast } = useApp();
  const { user } = useAuth();
  const blank = { authorName: user?.fullName || '', email: user?.email || '', country: user?.country || 'Uganda', bookTitle: '', genre: categories[0], summary: '' };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  // Fill in name, email and country once the logged-in user has loaded (only fields still empty).
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, authorName: f.authorName || user.fullName, email: f.email || user.email, country: f.authorName ? f.country : user.country }));
  }, [user]);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined })); };
  const steps = t('ebooks.steps');
  const stepIcons = [Send, Search, Factory, Rocket];

  const submit = async (e) => {
    e.preventDefault();
    const check = submissionSchema.safeParse(form);
    if (!check.success) {
      const found = {};
      for (const issue of check.error.issues) if (!found[issue.path[0]]) found[issue.path[0]] = issue.message;
      setErrors(found);
      toast(t('ebooks.form.error'), 'error');
      document.getElementById(`pf-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const data = await api('/submissions', { method: 'POST', body: form });
      setResult(data);
      celebrate();
      toast(t('ebooks.form.success'));
    } catch (err) {
      setErrors(err.fieldErrors || {});
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="publish" className={`glass relative overflow-hidden p-6 sm:p-10 ${standalone ? '' : 'mt-20'}`}>
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow flex items-center gap-2"><PenTool size={14} /> {t('ebooks.eyebrow')}</p>
          {standalone ? <h1 className="mt-2 text-3xl font-bold sm:text-5xl">{t('ebooks.publishTitle')}</h1> : <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{t('ebooks.publishTitle')}</h2>}
          <p className="mt-3 text-muted">{t('ebooks.publishSub')}</p>
          <ol className="mt-8 space-y-4">
            {steps.map((s, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.li key={s.title} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                  <div className="relative">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white shadow-glow"><Icon size={18} /></div>
                    {i < steps.length - 1 && <div className="absolute left-1/2 top-12 h-5 w-px bg-violet-500/40" />}
                  </div>
                  <div>
                    <p className="font-semibold">{i + 1}. {s.title}</p>
                    <p className="text-sm text-muted">{s.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <SuccessScreen result={result} onAgain={() => { setResult(null); setForm({ ...blank, authorName: form.authorName, email: form.email, country: form.country }); }} />
          ) : (
            <motion.form key="form" onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="pf-authorName" label={t('ebooks.form.name')} error={errors.authorName}><input {...inputProps('pf-authorName', errors.authorName)} value={form.authorName} onChange={set('authorName')} autoComplete="name" /></Field>
                <Field id="pf-email" label={t('ebooks.form.email')} error={errors.email}><input {...inputProps('pf-email', errors.email)} type="email" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
                <Field id="pf-country" label={t('ebooks.form.country')} error={errors.country}>
                  <select {...inputProps('pf-country', errors.country)} value={form.country} onChange={set('country')}>{countries.map((c) => <option key={c}>{c}</option>)}</select>
                </Field>
                <Field id="pf-genre" label={t('ebooks.form.topic')} error={errors.genre}>
                  <select {...inputProps('pf-genre', errors.genre)} value={form.genre} onChange={set('genre')}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
                </Field>
              </div>
              <Field id="pf-bookTitle" label={t('ebooks.form.title')} error={errors.bookTitle}><input {...inputProps('pf-bookTitle', errors.bookTitle)} value={form.bookTitle} onChange={set('bookTitle')} /></Field>
              <Field id="pf-summary" label={t('ebooks.form.summary')} error={errors.summary}><textarea {...inputProps('pf-summary', errors.summary)} rows={4} placeholder={t('ebooks.form.summaryPh')} value={form.summary} onChange={set('summary')} style={{ resize: 'none' }} /></Field>
              <button className="btn-primary w-full py-4" disabled={sending}>
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} {t('ebooks.form.submit')}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
