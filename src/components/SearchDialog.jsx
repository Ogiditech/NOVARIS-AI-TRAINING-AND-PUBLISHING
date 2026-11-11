import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, GraduationCap, BookOpen, SearchX, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

export default function SearchDialog() {
  const { t, searchOpen, setSearchOpen } = useApp();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) { setQ(''); setResults(null); setTimeout(() => inputRef.current?.focus(), 50); }
    const onKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  // Debounced search across courses and eBooks.
  useEffect(() => {
    const s = q.trim();
    if (s.length < 2) { setResults(null); setLoading(false); return undefined; }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const qs = encodeURIComponent(s);
        const [c, e] = await Promise.all([api(`/courses?q=${qs}`, { signal: ctrl.signal }), api(`/ebooks?q=${qs}`, { signal: ctrl.signal })]);
        setResults({ courses: c.courses.slice(0, 6), ebooks: e.ebooks.slice(0, 6), error: false });
      } catch (err) {
        if (err.name !== 'AbortError') setResults({ courses: [], ebooks: [], error: true });
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q]);

  const go = (path) => { setSearchOpen(false); navigate(path); };
  const empty = results && !results.error && !results.courses.length && !results.ebooks.length;

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div className="fixed inset-0 z-[55] flex items-start justify-center bg-black/60 px-4 pt-[10vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSearchOpen(false)}>
          <motion.div
            role="dialog" aria-modal="true" aria-label={t('search.placeholder')}
            initial={{ y: -20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, scale: 0.97 }}
            className="glass w-full max-w-xl overflow-hidden !bg-surface/95" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line/10 px-4">
              {loading ? <Loader2 size={20} className="animate-spin text-violet-400" /> : <Search size={20} className="text-violet-400" />}
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search.placeholder')} className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-muted" aria-label={t('search.placeholder')} />
              <button onClick={() => setSearchOpen(false)} className="grid h-10 w-10 place-items-center text-muted hover:text-ink" aria-label={t('common.close')}><X size={20} /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!results && <p className="px-3 py-6 text-center text-sm text-muted">{t('search.hint')}</p>}
              {results?.error && <p className="px-3 py-6 text-center text-sm text-rose-400">{t('search.error')}</p>}
              {empty && (
                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                  <SearchX size={32} className="text-muted" />
                  <p className="text-sm text-muted">{t('search.empty', { q })}</p>
                </div>
              )}
              {results?.courses?.length > 0 && (
                <Section label={t('search.courses')}>
                  {results.courses.map((c) => (
                    <Row key={c.slug} icon={GraduationCap} title={c.title} meta={`${c.category} · ${c.level} · ${c.language}`} onClick={() => go(`/courses/${c.slug}`)} />
                  ))}
                </Section>
              )}
              {results?.ebooks?.length > 0 && (
                <Section label={t('search.ebooks')}>
                  {results.ebooks.map((b) => (
                    <Row key={b.slug} icon={BookOpen} title={b.title} meta={`${b.author_name} · ${b.author_country}`} onClick={() => go(`/ebooks/${b.slug}/read`)} />
                  ))}
                </Section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }) {
  return (
    <div className="py-2">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      {children}
    </div>
  );
}
function Row({ icon: Icon, title, meta, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-violet-600/15">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-600/20 text-violet-400"><Icon size={18} /></span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted">{meta}</span>
      </span>
    </button>
  );
}
