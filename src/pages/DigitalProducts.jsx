import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, PackageSearch, Sparkles, Gift, ArrowUpDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChipRow, EmptyState } from '../components/ui';
import { categoryIcons } from '../components/CourseCard';
import ProductCard, { BundleCard } from '../components/ProductCard';
import { categories, levels, productTypes } from '../data/constants';
import useApi from '../hooks/useApi';
import { CardGridSkeleton, ErrorState } from '../components/states';

// Deterministic sparkle positions for the hero background.
const sparkles = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100, top: (i * 53 + 7) % 100, size: 10 + ((i * 7) % 16), delay: (i % 6) * 0.45, dur: 2.4 + (i % 4) * 0.6,
}));

export function ProductsHero() {
  const { t } = useApp();
  const { data } = useApi('/products');
  const total = data?.products.length ?? 0;
  const free = data?.products.filter((p) => Number(p.price_usd) === 0).length ?? 0;
  return (
    <section className="relative mb-6 overflow-hidden rounded-[32px] bg-brand px-6 py-10 text-white shadow-glow sm:px-10 sm:py-14">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
      <div className="absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
      <div className="absolute inset-0" aria-hidden="true">
        {sparkles.map((s, i) => (
          <motion.span key={i} className="absolute text-white" style={{ left: `${s.left}%`, top: `${s.top}%` }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1, 0.4], rotate: [0, 90, 180] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}>
            <Sparkles size={s.size} className={i % 3 === 0 ? 'text-gold' : ''} />
          </motion.span>
        ))}
      </div>
      <div className="relative max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[.22em] text-white/75">{t('products.eyebrow')}</p>
        <h1 className="mt-3 text-4xl font-bold leading-[1.05] sm:text-6xl">
          {t('products.heroTitle1')}<br />
          <span className="bg-gradient-to-r from-white via-amber-100 to-gold bg-clip-text text-transparent">{t('products.heroTitle2')}</span>
        </h1>
        <p className="mt-4 max-w-lg text-white/80">{t('products.heroSub')}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
          <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur"><PackageSearch size={16} /> {t('products.available', { n: total })}</span>
          <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur"><Gift size={16} className="text-gold" /> {t('products.freeCount', { n: free })}</span>
        </div>
      </div>
    </section>
  );
}

// Sort options — the API does the sorting.
const SORTS = ['popular', 'newest', 'rating', 'priceAsc', 'priceDesc'];

export default function DigitalProducts() {
  const { t } = useApp();
  const [params] = useSearchParams();
  const [category, setCategory] = useState(() => (categories.includes(params.get('category')) ? params.get('category') : null));
  const [type, setType] = useState(null);
  const [level, setLevel] = useState(null);
  const [price, setPrice] = useState(() => (['free', 'paid'].includes(params.get('price')) ? params.get('price') : null));
  const [sort, setSort] = useState('popular');
  const [query, setQuery] = useState('');

  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  const path = useMemo(() => {
    const qs = new URLSearchParams({ sort });
    if (category) qs.set('category', category);
    if (type) qs.set('type', type);
    if (level) qs.set('level', level);
    if (price) qs.set('price', price);
    if (debounced) qs.set('q', debounced);
    return `/products?${qs}`;
  }, [category, type, level, price, sort, debounced]);
  const { data, error, loading, reload } = useApi(path);
  const list = data?.products || [];

  const anyFilter = category || type || level || price || query;
  const reset = () => { setCategory(null); setType(null); setLevel(null); setPrice(null); setQuery(''); };
  const typeLabels = Object.fromEntries(productTypes.map((x) => [x, t(`productTypes.${x}`)]));

  return (
    <div>
      <ProductsHero />

      <div className="glass mb-6 space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">{t('products.searchLabel')}</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('products.search')} className="input !pl-11" />
          </label>
          <label className="relative sm:w-60">
            <span className="sr-only">{t('products.sort')}</span>
            <ArrowUpDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !pl-10" aria-label={t('products.sort')}>
              {SORTS.map((k) => <option key={k} value={k}>{t(`products.sorts.${k}`)}</option>)}
            </select>
          </label>
        </div>
        <ChipRow label={t('products.category')} options={categories} value={category} onChange={setCategory} icons={categoryIcons} allLabel={t('products.all')} />
        <ChipRow label={t('products.type')} options={productTypes} value={type} onChange={setType} labels={typeLabels} allLabel={t('products.all')} />
        <div className="grid gap-4 md:grid-cols-2">
          <ChipRow label={t('products.level')} options={levels} value={level} onChange={setLevel} allLabel={t('products.all')} />
          <ChipRow label={t('products.price')} options={['free', 'paid']} value={price} onChange={setPrice} labels={{ free: t('products.free'), paid: t('products.paid') }} allLabel={t('products.all')} />
        </div>
      </div>

      <div className="mb-4 flex min-h-[40px] items-center justify-between text-sm text-muted">
        <span className="flex items-center gap-2"><SlidersHorizontal size={16} /> {t('products.results', { n: list.length })}</span>
        {anyFilter && <button onClick={reset} className="flex min-h-[40px] items-center gap-1 font-semibold text-violet-400 hover:text-violet-300"><X size={14} /> {t('products.reset')}</button>}
      </div>

      {error && !data ? <ErrorState error={error} onRetry={reload} /> : !data ? <CardGridSkeleton cover="h-40" /> : list.length === 0 ? (
        <EmptyState icon={PackageSearch} title={t('products.empty')} action={<button onClick={reset} className="btn-primary mt-2">{t('products.reset')}</button>} />
      ) : (
        <motion.div layout className={`grid grid-flow-row-dense gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (p.product_type === 'Bundle'
              ? <BundleCard key={p.id} product={p} index={i} />
              : <ProductCard key={p.id} product={p} index={i} />))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
