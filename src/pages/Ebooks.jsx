import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingBag, Check, FileText, PenTool, Search, SearchX, Loader2, Award, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import useRequireLogin from '../hooks/useRequireLogin';
import { api } from '../lib/api';
import { celebrate } from '../lib/celebrate';
import { SectionHeader, EmptyState } from '../components/ui';
import { CardGridSkeleton, ErrorState } from '../components/states';
import BookCover from '../components/BookCover';
import PublishSection from '../components/PublishSection';
import { categories, formatPrice } from '../data/constants';

function BookCard({ book, index }) {
  const { t, toast, currency, acquired, markAcquired, setCheckout } = useApp();
  const requireLogin = useRequireLogin();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const owned = book.owned || acquired.ebooks.includes(book.id);
  const price = formatPrice(book.price_usd, currency);

  const buy = () => requireLogin(async () => {
    if (Number(book.price_usd) > 0) {
      setCheckout({ kind: 'ebook', item: book });
      return;
    }
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 4) * 0.06 }} className="group flex flex-col" data-ebook={book.slug}>
      <motion.div whileHover={{ y: -8, rotate: -1.5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="relative">
        <Link to={`/ebooks/${book.slug}/read`} aria-label={`${t('ebooks.sample')}: ${book.title}`}>
          <BookCover book={book} className="transition-shadow duration-300 group-hover:shadow-glow" />
        </Link>
        {owned && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg"><Check size={12} /> {t('ebooks.owned')}</span>}
        {book.is_bestseller && !owned && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gold px-2 py-1 text-[10px] font-bold text-[#2a1a00] shadow-lg"><Award size={12} /> {t('products.bestseller')}</span>}
      </motion.div>
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="font-semibold leading-snug">{book.title}</h3>
        <p className="mt-0.5 text-xs text-muted">{book.author_name} · {book.author_country}</p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><FileText size={12} /> {t('ebooks.pages', { n: book.page_count })}</span>
          <span className="truncate">{book.category}</span>
        </div>
        <p className={`mt-2 font-display text-lg font-bold ${price ? '' : 'text-emerald-400'}`}>{price || t('courses.free')}</p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          {owned ? (
            <button onClick={() => navigate(`/ebooks/${book.slug}/read`)} className="btn col-span-2 border border-emerald-500/40 bg-emerald-500/15 !px-2 !py-2.5 text-xs text-emerald-400 hover:bg-emerald-500/25"><BookOpen size={15} /> {t('ebooks.read')}</button>
          ) : (
            <>
              <Link to={`/ebooks/${book.slug}/read`} className="btn-ghost !px-2 !py-2.5 text-xs"><BookOpen size={15} /> {t('ebooks.sample')}</Link>
              <button onClick={buy} disabled={busy} className="btn-primary !px-2 !py-2.5 text-xs">
                {busy ? <Loader2 size={15} className="animate-spin" /> : price ? <ShoppingBag size={15} /> : <Gift size={15} />}
                {price ? t('ebooks.buy') : t('ebooks.getFree')}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Ebooks() {
  const { t } = useApp();
  const [params, setParams] = useSearchParams();
  const [cat, setCat] = useState(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  // Old links (/ebooks?book=slug) open the reader.
  const navigate = useNavigate();
  useEffect(() => {
    const slug = params.get('book');
    if (slug) { setParams({}, { replace: true }); navigate(`/ebooks/${slug}/read`); }
  }, [params, setParams, navigate]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  const path = useMemo(() => {
    const qs = new URLSearchParams();
    if (cat) qs.set('category', cat);
    if (debounced) qs.set('q', debounced);
    return `/ebooks${qs.toString() ? `?${qs}` : ''}`;
  }, [cat, debounced]);
  const { data, error, loading, reload } = useApi(path);
  const list = data?.ebooks || [];

  return (
    <div>
      <SectionHeader
        eyebrow={t('store.ebooksTab')} title={t('ebooks.title')} sub={t('ebooks.sub')}
        action={<a href="#publish" className="btn-ghost"><PenTool size={16} /> {t('ebooks.publishTitle')}</a>}
      />
      <div className="mb-8 space-y-4">
        <label className="relative block max-w-md">
          <span className="sr-only">{t('ebooks.searchLabel')}</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('ebooks.search')} className="input !pl-11" />
        </label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {[null, ...categories].map((c) => (
            <button key={c || 'all'} onClick={() => setCat(c)} aria-pressed={cat === c} className={`chip shrink-0 ${cat === c ? 'chip-active' : ''}`}>{c || t('courses.all')}</button>
          ))}
        </div>
      </div>
      {error && !data ? <ErrorState error={error} onRetry={reload} /> : !data ? (
        <CardGridSkeleton count={10} cover="aspect-[3/4] h-auto" className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" />
      ) : list.length === 0 ? (
        <EmptyState icon={SearchX} title={t('ebooks.empty')} action={<button onClick={() => { setCat(null); setQuery(''); }} className="btn-primary mt-2">{t('courses.clear')}</button>} />
      ) : (
        <div className={`grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${loading ? 'opacity-60' : ''}`}>
          {list.map((b, i) => <BookCard key={b.slug} book={b} index={i} />)}
        </div>
      )}
      <PublishSection />
    </div>
  );
}
