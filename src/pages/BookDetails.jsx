import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Lock, ShoppingBag, Building2, CalendarDays, Layers, Unlock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BookCover from '../components/BookCover';
import NotifyButtons from '../components/NotifyButtons';
import { EmptyState } from '../components/ui';
import { findOriginal, coverProps } from '../data/originals';
import { formatPrice } from '../data/constants';
import NotFound from './NotFound';

export default function BookDetails() {
  const { slug } = useParams();
  const { t, currency } = useApp();
  const book = findOriginal(slug);
  if (!book) return <NotFound />;
  const soon = book.status === 'coming-soon';
  const price = formatPrice(book.price, currency);

  return (
    <div className="pb-6" data-book={book.slug}>
      <Link to="/ebooks" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> {t('originals.allEbooks')}</Link>
      {book.testBuild && <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400" role="note">{t('originals.testBuild')}</p>}

      <div className="grid gap-8 md:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
        <motion.div initial={{ opacity: 0, y: 20, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} className="relative mx-auto w-full max-w-[260px] md:max-w-none">
          <BookCover book={coverProps(book)} className="shadow-glow" />
          {soon && <span className="absolute -right-2 top-4 rounded-l-full rounded-r-md bg-gold px-3 py-1 text-xs font-bold text-[#2a1a00] shadow-lg">{t('originals.comingSoon')}</span>}
        </motion.div>

        <div className="min-w-0">
          <p className="eyebrow">{t('originals.eyebrow')}</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">{book.title}</h1>
          <p className="mt-2 text-lg text-muted">{book.subtitle}</p>
          <p className="mt-3 font-medium">{t('originals.by', { author: book.author })}</p>
          <p className="mt-5 max-w-[65ch] leading-relaxed text-ink/85">{book.description}</p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
            <span className="chip !cursor-default"><Layers size={13} /> {t('originals.sections', { n: book.sectionCount })}</span>
            <span className="chip !cursor-default"><Unlock size={13} /> {t('originals.freeSections', { n: book.freeCount })}</span>
            <span className="chip !cursor-default"><Clock size={13} /> {t('originals.readTime', { n: book.minutes })}</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to={`/ebooks/${book.slug}/read`} className="btn-primary"><BookOpen size={17} /> {t('originals.readSample')}</Link>
            <span className="relative inline-flex">
              <button type="button" disabled={soon} aria-describedby="buy-note" className="btn-ghost pr-4 disabled:cursor-not-allowed disabled:opacity-80">
                <ShoppingBag size={17} /> {t('originals.buy')}{price && <span className="font-display font-bold">· {price}</span>}
              </button>
              {soon && <span className="pointer-events-none absolute -right-2 -top-2.5 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2a1a00] shadow">{t('originals.comingSoon')}</span>}
            </span>
          </div>
          {soon && <p id="buy-note" className="mt-2 text-xs text-muted">{t('originals.buySoon')}</p>}

          <dl className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2"><Building2 size={16} className="mt-0.5 shrink-0 text-violet-400" /><div><dt className="text-xs text-muted">{t('originals.publisher')}</dt><dd>{book.publisher}</dd></div></div>
            <div className="flex items-start gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-violet-400" /><div><dt className="text-xs text-muted">{t('originals.edition')}</dt><dd>{book.edition}</dd></div></div>
          </dl>
        </div>
      </div>

      <BookContents book={book} />

      {soon && (
        <section className="glass mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Lock size={18} className="text-gold" /> {t('originals.fullSoon')}</h2>
            <p className="mt-1 text-sm text-muted">{t('originals.lockedBody')}</p>
          </div>
          <NotifyButtons book={book} />
        </section>
      )}
    </div>
  );
}

function BookContents({ book }) {
  const { t } = useApp();
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold">{t('originals.contents')}</h2>
      <ol className="glass mt-4 divide-y divide-line/10 overflow-hidden">
        {(book.toc || []).map((s, i) => {
          const inner = (
            <>
              <span className="w-6 shrink-0 text-right font-display text-sm text-muted">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">{s.title}</span>
              {s.free
                ? <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400">{t('originals.free')}</span>
                : <Lock size={15} className="shrink-0 text-muted" aria-label={t('originals.locked')} />}
            </>
          );
          return (
            <li key={s.id}>
              {s.free
                ? <Link to={`/ebooks/${book.slug}/read?s=${s.id}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-violet-500/10">{inner}</Link>
                : <div className="flex items-center gap-3 px-4 py-3 text-muted">{inner}</div>}
            </li>
          );
        })}
      </ol>
      {!book.toc?.length && <EmptyState icon={Layers} title={t('originals.notFound')} />}
    </section>
  );
}
