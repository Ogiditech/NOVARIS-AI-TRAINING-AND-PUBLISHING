import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Check, Gift, Loader2, BookOpen, SearchX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import useRequireLogin from '../hooks/useRequireLogin';
import { api } from '../lib/api';
import { celebrate } from '../lib/celebrate';
import { EmptyState } from '../components/ui';
import { ErrorState, Skeleton } from '../components/states';
import { formatPrice } from '../data/constants';

const THEMES = {
  light: { bg: '#fffefb', ink: '#2a2438', muted: '#6b6480', bar: 'rgba(255,254,251,.92)', line: 'rgba(0,0,0,.08)' },
  sepia: { bg: '#f4ecd8', ink: '#4b3a26', muted: '#7d6a52', bar: 'rgba(244,236,216,.92)', line: 'rgba(75,58,38,.15)' },
  dark: { bg: '#14101f', ink: '#e8e4f5', muted: '#a49cc0', bar: 'rgba(20,16,31,.92)', line: 'rgba(255,255,255,.08)' },
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(`novaris:${key}`)) ?? fallback; } catch { return fallback; }
}

export default function EbookReader() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, toast, currency, acquired, markAcquired, setCheckout } = useApp();
  const requireLogin = useRequireLogin();
  const { data, error, reload } = useApi(`/ebooks/${encodeURIComponent(slug)}`);
  const [size, setSize] = useState(() => load('readerSize', 19));
  const [theme, setTheme] = useState(() => load('readerTheme', 'light'));
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);

  useEffect(() => { try { localStorage.setItem('novaris:readerSize', JSON.stringify(size)); localStorage.setItem('novaris:readerTheme', JSON.stringify(theme)); } catch { /* ignore */ } }, [size, theme]);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') navigate('/ebooks'); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [navigate]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 100);
  };

  if (error && !data) {
    return error.status === 404
      ? <EmptyState icon={SearchX} title={t('reader.notFound')} action={<button onClick={() => navigate('/ebooks')} className="btn-primary mt-2">{t('reader.backToStore')}</button>} />
      : <ErrorState error={error} onRetry={reload} />;
  }

  const book = data?.ebook;
  const owned = book && (book.owned || acquired.ebooks.includes(book.id));
  const c = THEMES[theme];
  const price = book && formatPrice(book.price_usd, currency);

  const buy = () => requireLogin(async () => {
    if (Number(book.price_usd) > 0) { setCheckout({ kind: 'ebook', item: book }); return; }
    setBusy(true);
    try {
      await api('/purchases', { method: 'POST', body: { id: book.id, currency: currency.code } });
      markAcquired('ebooks', [book.id]);
      celebrate();
      toast(t('ebooks.bought', { title: book.title }));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }, { message: t('ebooks.loginToBuy') });

  return createPortal(
    <motion.div className="fixed inset-0 z-[65] flex flex-col" style={{ background: c.bg, color: c.ink }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="dialog" aria-modal="true" aria-label={book?.title || t('reader.title')}>
      {/* toolbar */}
      <div className="relative z-10 border-b backdrop-blur" style={{ background: c.bar, borderColor: c.line }}>
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-3 py-2 sm:px-4">
          <button onClick={() => navigate('/ebooks')} className="flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-sm font-semibold hover:bg-black/5"><X size={18} /> <span className="hidden sm:inline">{t('ebooks.closeReader')}</span></button>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold">{book?.title}</p>
          <div className="flex items-center gap-1" role="group" aria-label={t('reader.themeLabel')}>
            {Object.entries(THEMES).map(([k, v]) => (
              <button key={k} onClick={() => setTheme(k)} aria-pressed={theme === k} aria-label={t(`reader.themes.${k}`)} title={t(`reader.themes.${k}`)}
                className={`grid h-10 w-10 place-items-center rounded-full border-2 transition ${theme === k ? 'scale-110 border-violet-500' : 'border-transparent'}`}>
                <span className="h-6 w-6 rounded-full border" style={{ background: v.bg, borderColor: v.line }} />
              </button>
            ))}
          </div>
          <div className="flex items-center" role="group" aria-label={t('reader.sizeLabel')}>
            <button onClick={() => setSize((s) => Math.max(15, s - 1))} className="grid h-10 w-10 place-items-center rounded-lg text-sm hover:bg-black/5" aria-label={t('common.smallerText')}>A−</button>
            <button onClick={() => setSize((s) => Math.min(26, s + 1))} className="grid h-10 w-10 place-items-center rounded-lg text-lg hover:bg-black/5" aria-label={t('common.largerText')}>A+</button>
          </div>
        </div>
        <div className="h-1 w-full" style={{ background: c.line }} role="progressbar" aria-label={t('reader.progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <div className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-gold transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div ref={scroller} onScroll={onScroll} className="flex-1 overflow-y-auto">
        {!book ? (
          <div className="mx-auto max-w-2xl space-y-4 px-6 py-12"><Skeleton className="h-4 w-40" /><Skeleton className="h-12 w-3/4" />{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4" />)}</div>
        ) : (
          <motion.article initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="reading mx-auto max-w-2xl px-6 py-12" style={{ fontSize: size }}>
            <p className="font-sans text-xs font-semibold uppercase tracking-[.25em] text-[#7c3aed]">{book.author_name} · {book.author_country}</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight">{book.title}</h1>
            <p className="mt-2 font-sans" style={{ color: c.muted }}>{book.subtitle}</p>
            {owned && <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-sans text-xs font-semibold text-emerald-600"><Check size={14} /> {t('reader.owned')}</p>}
            <hr className="my-8" style={{ borderColor: c.line }} />
            {book.sample_text.split(/\n\s*\n/).map((p, i) => (i === 0
              ? <h2 key={i} className="font-display text-2xl font-bold">{p}</h2>
              : <p key={i} className="mt-5 leading-[1.85]">{p}</p>))}
            <div className="mt-12 rounded-2xl border p-6 text-center font-sans" style={{ borderColor: c.line, background: theme === 'dark' ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.6)' }}>
              {owned ? (
                <>
                  <BookOpen className="mx-auto text-violet-500" />
                  <p className="mt-2 text-sm" style={{ color: c.muted }}>{t('reader.ownedEnd')}</p>
                </>
              ) : (
                <>
                  <p className="text-sm" style={{ color: c.muted }}>{t('ebooks.sampleEnd')}</p>
                  <button onClick={buy} disabled={busy} className="btn-primary mt-4">
                    {busy ? <Loader2 size={18} className="animate-spin" /> : price ? <ShoppingBag size={18} /> : <Gift size={18} />}
                    {price ? `${t('ebooks.buy')} · ${price}` : t('ebooks.getFree')}
                  </button>
                </>
              )}
            </div>
          </motion.article>
        )}
      </div>
    </motion.div>,
    document.body,
  );
}
