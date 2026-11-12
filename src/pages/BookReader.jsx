import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, List, X, Minus, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import NotifyButtons from '../components/NotifyButtons';
import { ErrorState, Skeleton } from '../components/states';
import { findOriginal, loadOriginal } from '../data/originals';
import NotFound from './NotFound';

const SIZES = { min: 15, max: 24, initial: 18 };

// localStorage can be blocked (private mode, disabled cookies) — reading and writing must never break the reader.
function readStore(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

const isExternal = (href = '') => /^https?:\/\//i.test(href);
const mdComponents = {
  table: ({ node, ...props }) => <div className="book-table" tabIndex={0}><table {...props} /></div>,
  a: ({ node, href, ...props }) => <a href={href} {...props} {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})} />,
};

function Contents({ book, current, onPick }) {
  const { t } = useApp();
  return (
    <nav aria-label={t('originals.contents')}>
      <p className="label px-3">{t('originals.contents')}</p>
      <ol className="space-y-0.5">
        {book.sections.map((s, i) => {
          const active = s.id === current;
          return (
            <li key={s.id}>
              <button
                type="button" onClick={() => onPick(s.id)} aria-current={active ? 'true' : undefined}
                className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${active ? 'bg-violet-600/15 font-semibold text-ink' : 'text-muted hover:bg-surface/70 hover:text-ink'}`}
              >
                <span className="mt-px w-5 shrink-0 text-right font-display text-xs opacity-70">{i + 1}</span>
                <span className="min-w-0 flex-1">{s.title}</span>
                {!s.free && <Lock size={13} className="mt-1 shrink-0 opacity-70" aria-label={t('originals.locked')} />}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function BookReader() {
  const { slug } = useParams();
  const meta = findOriginal(slug);
  return meta ? <Reader meta={meta} /> : <NotFound />;
}

function Reader({ meta }) {
  const { t, toast } = useApp();
  const [params, setParams] = useSearchParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [size, setSize] = useState(() => Math.min(SIZES.max, Math.max(SIZES.min, Number(readStore('novaris:bookSize', SIZES.initial)) || SIZES.initial)));
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const storeKey = `novaris:book:${meta.slug}`;
  const restored = useRef(false);

  useEffect(() => {
    let alive = true;
    setError(null);
    loadOriginal(meta.slug).then((b) => alive && setBook(b)).catch((e) => alive && setError(e));
    return () => { alive = false; };
  }, [meta.slug, attempt]);

  const ids = useMemo(() => book?.sections.map((s) => s.id) || [], [book]);
  const requested = params.get('s');
  const currentId = ids.includes(requested) ? requested : ids[0];
  const index = ids.indexOf(currentId);
  const section = book?.sections[index];

  // First open without ?s=: continue from the saved section and scroll position.
  useEffect(() => {
    if (!book || restored.current) return;
    restored.current = true;
    const saved = readStore(storeKey, null);
    if (!requested && saved?.s && ids.includes(saved.s)) {
      setParams({ s: saved.s }, { replace: true });
      if (saved.s !== ids[0] || saved.y > 0.02) toast(t('originals.resumed'), 'info');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.max(0, (saved.y || 0) * max) });
      }));
    }
  }, [book, ids, requested, setParams, storeKey, t, toast]);

  // Track scroll position: progress bar + remembered position.
  useEffect(() => {
    if (!section) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      setScrolled(y);
      writeStore(storeKey, { s: section.id, y: Math.round(y * 1000) / 1000 });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [section, storeKey]);

  useEffect(() => { writeStore('novaris:bookSize', size); }, [size]);

  // Drawer: close on Escape, lock page scroll while open.
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setDrawer(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [drawer]);

  const go = useCallback((id) => {
    setDrawer(false);
    setParams({ s: id });
    writeStore(storeKey, { s: id, y: 0 });
    window.scrollTo({ top: 0 });
  }, [setParams, storeKey]);

  if (error) return <ErrorState error={error} onRetry={() => setAttempt((n) => n + 1)} />;
  if (!book) {
    return (
      <div className="mx-auto max-w-[70ch] space-y-4 pt-6">
        <Skeleton className="h-8 w-2/3" />
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
      </div>
    );
  }

  const total = book.sections.length;
  const overall = Math.round(((index + scrolled) / total) * 100);
  const prev = book.sections[index - 1];
  const next = book.sections[index + 1];

  return (
    <div className="pb-8" data-reader={book.slug}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link to={`/ebooks/${book.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> {t('originals.backToBook')}</Link>
        <p className="min-w-0 truncate text-sm font-medium">{book.title} <span className="text-muted">· {book.author}</span></p>
      </div>
      {book.testBuild && <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400" role="note">{t('originals.testBuild')}</p>}

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="glass sticky top-[96px] max-h-[calc(100vh-120px)] overflow-y-auto p-3">
            <Contents book={book} current={currentId} onPick={go} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar + progress — stays under the app header while reading. */}
          <div className="sticky top-[72px] z-20 -mx-4 mb-6 border-b border-line/10 bg-bg/85 px-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
            <div className="flex items-center gap-2 py-2">
              <button type="button" onClick={() => setDrawer(true)} className="btn-ghost !px-3 !py-2 text-sm lg:hidden" aria-haspopup="dialog" aria-expanded={drawer}>
                <List size={16} /> {t('originals.openContents')}
              </button>
              <p className="min-w-0 flex-1 truncate text-xs text-muted sm:text-sm">{t('originals.sectionOf', { n: index + 1, total })}</p>
              <div className="flex items-center gap-1" role="group" aria-label={t('reader.sizeLabel')}>
                <button type="button" onClick={() => setSize((s) => Math.max(SIZES.min, s - 1))} disabled={size <= SIZES.min} className="btn-ghost h-9 w-10 !p-0 text-sm" aria-label={t('originals.smaller')}>A<Minus size={11} /></button>
                <span className="w-8 text-center text-xs tabular-nums text-muted" aria-live="polite">{size}</span>
                <button type="button" onClick={() => setSize((s) => Math.min(SIZES.max, s + 1))} disabled={size >= SIZES.max} className="btn-ghost h-9 w-10 !p-0 text-base" aria-label={t('originals.larger')}>A<Plus size={11} /></button>
              </div>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-line/10 sm:mb-2" role="progressbar" aria-label={t('originals.progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall}>
              <div className="h-full rounded-full bg-brand transition-[width] duration-150" style={{ width: `${overall}%` }} />
            </div>
          </div>

          <article key={section.id} className="book-prose mx-auto" style={{ fontSize: `${size}px` }} data-section={section.id} data-locked={!section.free || undefined}>
            <p className="!mb-1 text-[0.7em] font-semibold uppercase tracking-[.2em] text-violet-400">{t('originals.sectionOf', { n: index + 1, total })} · {t('originals.readTime', { n: section.minutes })}</p>
            <h1>{section.title}</h1>
            {section.free ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{section.content}</ReactMarkdown>
            ) : (
              <>
                <p className="book-teaser">{section.teaser}</p>
                <div className="not-prose relative mt-6 overflow-hidden rounded-2xl border border-line/15 bg-surface/60 p-6 text-[16px] sm:p-8">
                  <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
                  <div className="relative">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold"><Lock size={22} /></div>
                    <h2 className="mt-4 font-display text-xl font-semibold text-ink">{t('originals.fullSoon')}</h2>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">{t('originals.lockedBody')}</p>
                    <NotifyButtons book={book} className="mt-5" />
                  </div>
                </div>
              </>
            )}
          </article>

          <nav className="mx-auto mt-12 grid max-w-[70ch] gap-3 sm:grid-cols-2" aria-label={t('originals.contents')}>
            {prev ? (
              <button type="button" onClick={() => go(prev.id)} className="glass flex min-w-0 items-center gap-3 p-4 text-left transition hover:-translate-y-0.5" data-nav="prev">
                <ChevronLeft size={20} className="shrink-0 text-violet-400" />
                <span className="min-w-0"><span className="block text-xs text-muted">{t('originals.previous')}</span><span className="block truncate font-medium">{prev.title}</span></span>
              </button>
            ) : <span className="hidden sm:block" />}
            {next ? (
              <button type="button" onClick={() => go(next.id)} className="glass flex min-w-0 items-center justify-end gap-3 p-4 text-right transition hover:-translate-y-0.5" data-nav="next">
                <span className="min-w-0"><span className="block text-xs text-muted">{t('originals.next')}</span><span className="flex min-w-0 items-center justify-end gap-1.5 font-medium">{!next.free && <Lock size={13} className="shrink-0 text-muted" />}<span className="truncate">{next.title}</span></span></span>
                <ChevronRight size={20} className="shrink-0 text-violet-400" />
              </button>
            ) : (
              <p className="glass flex items-center gap-2 p-4 text-sm text-muted"><Sparkles size={16} className="text-gold" /> {t('originals.sampleEnd')}</p>
            )}
          </nav>
        </div>
      </div>

      {/* Portal: the page-transition wrapper would otherwise trap the drawer under the mobile bottom bar. */}
      {createPortal(<AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawer(false)} aria-label={t('originals.closeContents')} tabIndex={-1} />
            <motion.div
              role="dialog" aria-modal="true" aria-label={t('originals.contents')}
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="absolute inset-y-0 left-0 flex w-80 max-w-[86vw] flex-col border-r border-line/15 bg-surface shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line/10 px-4 py-3">
                <p className="truncate font-display font-semibold">{book.title}</p>
                <button type="button" onClick={() => setDrawer(false)} className="btn-ghost h-9 w-9 !p-0" aria-label={t('originals.closeContents')} autoFocus><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3"><Contents book={book} current={currentId} onPick={go} /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}
