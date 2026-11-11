import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchX, SlidersHorizontal, X, Search, ArrowUpDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { SectionHeader, EmptyState, ChipRow } from '../components/ui';
import { CardGridSkeleton, ErrorState } from '../components/states';
import CourseCard, { categoryIcons } from '../components/CourseCard';
import { categories, courseLanguages, levels } from '../data/constants';

const SORTS = ['popular', 'newest', 'rating', 'priceAsc', 'priceDesc'];

export default function Courses() {
  const { t } = useApp();
  const [category, setCategory] = useState(null);
  const [level, setLevel] = useState(null);
  const [language, setLanguage] = useState(null);
  const [sort, setSort] = useState('popular');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  const path = useMemo(() => {
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (level) qs.set('level', level);
    if (language) qs.set('language', language);
    if (debounced) qs.set('q', debounced);
    qs.set('sort', sort);
    return `/courses?${qs}`;
  }, [category, level, language, debounced, sort]);

  const { data, error, loading, reload } = useApi(path);
  const list = data?.courses || [];
  const anyFilter = category || level || language || query;
  const clear = () => { setCategory(null); setLevel(null); setLanguage(null); setQuery(''); };

  return (
    <div>
      <SectionHeader eyebrow={t('nav.courses')} title={t('courses.title')} sub={t('courses.sub')} />

      <div className="glass mb-6 space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">{t('courses.searchLabel')}</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('courses.search')} className="input !pl-11" />
          </label>
          <label className="relative sm:w-60">
            <span className="sr-only">{t('products.sort')}</span>
            <ArrowUpDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !pl-10" aria-label={t('products.sort')}>
              {SORTS.map((k) => <option key={k} value={k}>{t(`products.sorts.${k}`)}</option>)}
            </select>
          </label>
        </div>
        <ChipRow label={t('courses.category')} options={categories} value={category} onChange={setCategory} icons={categoryIcons} allLabel={t('courses.all')} />
        <div className="grid gap-4 md:grid-cols-2">
          <ChipRow label={t('courses.level')} options={levels} value={level} onChange={setLevel} allLabel={t('courses.all')} />
          <ChipRow label={t('courses.language')} options={courseLanguages} value={language} onChange={setLanguage} allLabel={t('courses.all')} />
        </div>
      </div>

      <div className="mb-4 flex min-h-[40px] items-center justify-between text-sm text-muted">
        <span className="flex items-center gap-2" aria-live="polite"><SlidersHorizontal size={16} /> {data ? t('courses.results', { n: list.length }) : t('common.loading')}</span>
        {anyFilter && <button onClick={clear} className="flex min-h-[40px] items-center gap-1 font-semibold text-violet-400 hover:text-violet-300"><X size={14} /> {t('courses.clear')}</button>}
      </div>

      {error && !data ? <ErrorState error={error} onRetry={reload} /> : !data ? <CardGridSkeleton /> : list.length === 0 ? (
        <EmptyState icon={SearchX} title={t('courses.emptyTitle')} body={t('courses.emptyBody')} action={<button onClick={clear} className="btn-primary mt-2">{t('courses.clear')}</button>} />
      ) : (
        <motion.div layout className={`grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
          <AnimatePresence mode="popLayout">
            {list.map((c, i) => <CourseCard key={c.slug} course={c} index={i} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
