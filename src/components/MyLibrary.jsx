import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, BookOpen, Calendar, GraduationCap, Library, Package, ArrowRight, PlayCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { EmptyState } from './ui';
import { CardGridSkeleton, ErrorState } from './states';
import BookCover from './BookCover';
import ProductCover from './ProductCover';
import ProductAction from './ProductAction';
import { OwnedBadge } from './ProductCard';
import { gradient } from './CourseCard';
import { formatLocal } from '../utils/time';

const TABS = [
  ['courses', GraduationCap], ['ebooks', BookOpen], ['certificates', Award], ['classes', Calendar], ['products', Package],
];

export function LibraryTabs({ tab, onChange, counts }) {
  const { t } = useApp();
  return (
    <div role="tablist" aria-label={t('library.title')} className="glass no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto !rounded-2xl p-1">
      {TABS.map(([key, Icon]) => (
        <button key={key} role="tab" id={`tab-${key}`} aria-selected={tab === key} onClick={() => onChange(key)} className={`relative flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${tab === key ? 'text-white' : 'text-muted hover:text-ink'}`}>
          {tab === key && <motion.span layoutId="library-tab" className="absolute inset-0 rounded-xl bg-brand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <Icon size={16} className="relative" /><span className="relative">{t(`library.tabs.${key}`)}</span>
          {counts && <span className={`relative rounded-full px-1.5 text-[11px] ${tab === key ? 'bg-white/25' : 'bg-line/15'}`}>{counts[key]}</span>}
        </button>
      ))}
    </div>
  );
}

function Courses({ items }) {
  const { t } = useApp();
  if (!items.length) return <EmptyState icon={GraduationCap} title={t('library.empty.courses')} action={<Link to="/courses" className="btn-primary mt-2">{t('library.exploreCourses')} <ArrowRight size={16} /></Link>} />;
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((c, i) => (
        <motion.li key={c.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass flex gap-4 p-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-white shadow-lg" style={{ background: gradient(c) }}><GraduationCap size={30} /></div>
          <div className="min-w-0 flex-1">
            <Link to={`/courses/${c.slug}`} className="block font-semibold leading-snug hover:text-violet-400">{c.title}</Link>
            <p className="text-xs text-muted">{c.instructor_name} · {t('courses.lessons', { n: c.lessons_count })}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/15"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${c.progress_percent}%` }} /></div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted">{c.status === 'completed' ? t('courses.completedBadge') : t('courses.percentDone', { n: c.progress_percent })}</span>
              <Link to={`/learn/${c.slug}`} className="ml-auto flex min-h-[36px] items-center gap-1 rounded-xl bg-violet-600/15 px-3 text-xs font-semibold text-violet-400 hover:bg-violet-600/25"><PlayCircle size={14} /> {c.status === 'completed' ? t('library.review') : t('dashboard.resume')}</Link>
              {c.certificate_code && <Link to={`/certificates/${c.certificate_code}`} className="flex min-h-[36px] items-center gap-1 rounded-xl bg-gold/15 px-3 text-xs font-semibold text-gold hover:bg-gold/25"><Award size={14} /> {t('library.certificate')}</Link>}
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

function Ebooks({ items }) {
  const { t } = useApp();
  if (!items.length) return <EmptyState icon={BookOpen} title={t('library.empty.ebooks')} action={<Link to="/ebooks" className="btn-primary mt-2">{t('library.browseStore')} <ArrowRight size={16} /></Link>} />;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((b) => (
        <div key={b.slug}>
          <Link to={`/ebooks/${b.slug}/read`} className="block transition hover:-translate-y-1"><BookCover book={b} /></Link>
          <p className="mt-2 line-clamp-1 text-sm font-semibold">{b.title}</p>
          <Link to={`/ebooks/${b.slug}/read`} className="mt-1 inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-violet-400"><BookOpen size={14} /> {t('ebooks.read')}</Link>
        </div>
      ))}
    </div>
  );
}

function Certificates({ items }) {
  const { t } = useApp();
  if (!items.length) return <EmptyState icon={Award} title={t('library.empty.certificates')} action={<Link to="/courses" className="btn-primary mt-2">{t('library.exploreCourses')} <ArrowRight size={16} /></Link>} />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <Link key={c.certificate_code} to={`/certificates/${c.certificate_code}`} className="relative block overflow-hidden rounded-3xl border border-gold/25 p-5 shadow-card transition hover:-translate-y-1" style={{ background: `linear-gradient(140deg, ${c.cover_gradient[0]}55, #120c26 75%)` }}>
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[10px] border-gold/15" />
          <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-white/70">{t('profile.certLabel')}</p>
          <p className="mt-3 font-display text-lg font-bold leading-snug text-white">{c.course_title}</p>
          <p className="mt-3 font-mono text-xs text-gold">{c.certificate_code}</p>
          <p className="mt-1 text-xs text-white/60">{t('profile.issued', { date: new Date(c.issued_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) })}</p>
        </Link>
      ))}
    </div>
  );
}

function Classes({ items }) {
  const { t } = useApp();
  if (!items.length) return <EmptyState icon={Calendar} title={t('library.empty.classes')} action={<Link to="/live" className="btn-primary mt-2">{t('library.seeClasses')} <ArrowRight size={16} /></Link>} />;
  const now = Date.now();
  return (
    <ul className="space-y-3">
      {items.map((c) => {
        const past = new Date(c.start_time).getTime() + c.duration_minutes * 60000 < now;
        return (
          <li key={c.id} className={`glass flex flex-wrap items-center gap-4 p-4 ${past ? 'opacity-60' : ''}`}>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-400"><Calendar size={22} /></div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.title}</p>
              <p className="text-xs text-muted">{c.instructor_name} · {c.language} · {formatLocal(new Date(c.start_time), { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
            </div>
            <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${past ? 'bg-line/10 text-muted' : 'bg-emerald-500/15 text-emerald-400'}`}><Clock size={13} /> {past ? t('library.attended') : t('live.booked')}</span>
          </li>
        );
      })}
    </ul>
  );
}

function Products({ items }) {
  const { t } = useApp();
  if (!items.length) return <EmptyState icon={Package} title={t('library.emptyProducts')} action={<Link to="/products" className="btn-primary mt-2">{t('library.goStore')} <ArrowRight size={16} /></Link>} />;
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {items.map((product, i) => (
        <motion.li key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass flex items-center gap-4 p-3 sm:p-4">
          <Link to={`/products/${product.slug}`} className="group shrink-0"><ProductCover product={product} size="sm" className="h-20 w-16" /></Link>
          <div className="min-w-0 flex-1">
            <Link to={`/products/${product.slug}`} className="block font-semibold leading-snug hover:text-violet-400">{product.title}</Link>
            <p className="mt-0.5 text-xs text-muted">{t(`productTypes.${product.product_type}`)} · {product.format} · {product.file_size}</p>
            <OwnedBadge className="mt-2 !px-2 !py-0.5" />
          </div>
          <ProductAction product={{ ...product, owned: true }} size="sm" className="shrink-0" />
        </motion.li>
      ))}
    </ul>
  );
}

const panels = { courses: Courses, ebooks: Ebooks, certificates: Certificates, classes: Classes, products: Products };

// "My Library": My Courses, My eBooks, My Certificates, My Classes and My Digital Products.
export default function MyLibrary({ initialTab = 'courses', onTabChange, heading = true }) {
  const { t } = useApp();
  const [tab, setTab] = useState(panels[initialTab] ? initialTab : 'courses');
  const { data, error, reload } = useApi('/library');
  const change = (k) => { setTab(k); onTabChange?.(k); };
  const Panel = panels[tab];
  const counts = data && Object.fromEntries(Object.keys(panels).map((k) => [k, data[k].length]));

  return (
    <section id="library">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {heading && <h2 className="flex items-center gap-2 text-2xl font-bold"><Library className="text-blue-400" /> {t('library.title')}</h2>}
        <LibraryTabs tab={tab} onChange={change} counts={counts} />
      </div>
      {error && !data ? <ErrorState error={error} onRetry={reload} /> : !data ? <CardGridSkeleton count={4} cover="h-20" className="grid gap-4 md:grid-cols-2" /> : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} role="tabpanel" aria-labelledby={`tab-${tab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <Panel items={data[tab]} />
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
