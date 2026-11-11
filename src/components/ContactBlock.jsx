import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Send, Loader2, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { countries, offices } from '../data/constants';
import { Field, inputProps, validateFields } from './ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export function OfficeCards() {
  const { t } = useApp();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {offices.map((o, i) => (
        <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }} className="glass p-5">
          <p className="flex items-center gap-2 text-sm font-semibold"><span className="text-lg" aria-hidden="true">{o.flag}</span> {t(`contact.offices.${o.key}`)}</p>
          <a href={o.tel} className="mt-2 block font-display text-2xl font-bold tracking-tight hover:text-violet-400">{o.phone}</a>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={o.tel} className="btn-ghost !py-2.5 text-xs"><Phone size={15} /> {t('contact.call')}</a>
            <a href={o.whatsapp} target="_blank" rel="noopener noreferrer" className="btn !py-2.5 text-xs bg-[#25D366] text-[#05301a] hover:-translate-y-0.5 hover:brightness-105">
              <MessageCircle size={15} /> {t('contact.whatsapp')}
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ContactForm() {
  const { t, toast } = useApp();
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({ name: user?.fullName || '', email: user?.email || '', country: user?.country || 'Uganda', message: '' }));
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  // Fill in name, email and country once the logged-in user has loaded (only fields still empty).
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, name: f.name || user.fullName, email: f.email || user.email, country: f.name ? f.country : user.country }));
  }, [user]);
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validateFields(form, ['name', 'email', 'message'], t);
    setErrors(found);
    if (Object.keys(found).length) {
      toast(t('contact.form.error'), 'error');
      document.getElementById(`cf-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSending(true);
    try {
      await api('/contact', { method: 'POST', body: form });
      setForm((f) => ({ ...f, message: '' }));
      toast(t('contact.form.success'));
    } catch (err) {
      setErrors(err.fieldErrors || {});
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="glass space-y-4 p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold"><Mail size={18} className="text-violet-400" /> {t('contact.form.title')}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="cf-name" label={t('contact.form.name')} error={errors.name}>
          <input {...inputProps('cf-name', errors.name)} value={form.name} onChange={set('name')} autoComplete="name" />
        </Field>
        <Field id="cf-email" label={t('contact.form.email')} error={errors.email}>
          <input {...inputProps('cf-email', errors.email)} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
      </div>
      <Field id="cf-country" label={t('contact.form.country')}>
        <select {...inputProps('cf-country')} value={form.country} onChange={set('country')}>{countries.map((c) => <option key={c}>{c}</option>)}</select>
      </Field>
      <Field id="cf-message" label={t('contact.form.message')} error={errors.message}>
        <textarea {...inputProps('cf-message', errors.message)} rows={4} placeholder={t('contact.form.messagePh')} value={form.message} onChange={set('message')} style={{ resize: 'none' }} />
      </Field>
      <button className="btn-primary w-full py-4" disabled={sending}>
        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} {t('contact.form.submit')}
      </button>
    </form>
  );
}

export default function ContactBlock({ heading = 'h2' }) {
  const { t } = useApp();
  const H = heading;
  return (
    <section id="contact" className="relative">
      <div className="mb-6 max-w-2xl">
        <p className="eyebrow mb-2">{t('contact.eyebrow')}</p>
        <H className="text-3xl font-bold sm:text-4xl">{t('contact.title')}</H>
        <p className="mt-2 text-muted">{t('contact.sub')}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <OfficeCards />
        <ContactForm />
      </div>
    </section>
  );
}
