import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, ShieldX, Search, GraduationCap, CalendarDays, Hash, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { ErrorState, Skeleton } from '../components/states';
import { gradient } from '../components/CourseCard';

function Lookup() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) navigate(`/verify/${code.trim().toUpperCase()}`); }} className="mt-6 flex flex-col gap-2 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">{t('verify.codeLabel')}</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="NOV-2026-XXXXXX" className="input !pl-11 font-mono uppercase" />
      </label>
      <button className="btn-primary">{t('verify.check')}</button>
    </form>
  );
}

export default function Verify() {
  const { code } = useParams();
  const { t } = useApp();
  const { data, error, reload } = useApi(`/certificates/${encodeURIComponent(code)}`);

  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  const notFound = data && !data.certificate;

  return (
    <div className="mx-auto max-w-2xl">
      {!data && <Skeleton className="h-96" />}
      {notFound && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 text-center sm:p-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-rose-500/15 text-rose-400"><ShieldX size={40} /></div>
          <h1 className="mt-6 text-3xl font-bold">{t('verify.invalidTitle')}</h1>
          <p className="mt-2 text-muted">{t('verify.invalidBody', { code })}</p>
          <Lookup />
        </motion.div>
      )}
      {data?.certificate && (() => {
        const c = data.certificate;
        const rows = [
          [User, t('verify.learner'), c.learner_name],
          [GraduationCap, t('verify.course'), c.course_title],
          [CalendarDays, t('verify.issued'), new Date(c.issued_at).toLocaleDateString(undefined, { dateStyle: 'long' })],
          [Hash, t('verify.code'), c.certificate_code],
        ];
        return (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden p-8 text-center sm:p-10">
            <div className="absolute inset-x-0 top-0 h-2" style={{ background: gradient(c, 90) }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_0_50px_-6px_rgba(16,185,129,.7)]">
              <BadgeCheck size={52} />
            </motion.div>
            <p className="eyebrow mt-6 !text-emerald-400">{t('verify.eyebrow')}</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('verify.validTitle')}</h1>
            <p className="mt-2 text-muted">{t('verify.validBody')}</p>
            <dl className="mt-8 divide-y divide-line/10 rounded-2xl border border-line/15 text-left">
              {rows.map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-4 px-5 py-4">
                  <Icon size={18} className="shrink-0 text-violet-400" />
                  <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
                  <dd className={`min-w-0 font-semibold ${label === t('verify.code') ? 'font-mono' : ''}`}>{value}</dd>
                </div>
              ))}
            </dl>
            <Link to={`/courses/${c.course_slug}`} className="btn-ghost mt-6">{t('verify.viewCourse')}</Link>
          </motion.div>
        );
      })()}
    </div>
  );
}
