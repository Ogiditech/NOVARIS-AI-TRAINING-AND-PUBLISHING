import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Sun, Moon, Globe, Check, Gem } from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import { languages } from '../i18n/translations';
import UserMenu from './UserMenu';

function LanguageSwitcher() {
  const { t, lang, toast } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="btn-ghost h-11 px-3" aria-label={t('nav.language')} aria-expanded={open}>
        <Globe size={18} /> <span className="hidden text-xs uppercase sm:inline">{lang}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="glass absolute right-0 top-14 z-50 w-52 overflow-hidden p-1.5"
          >
            {languages.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => { setOpen(false); if (!l.ready) toast(t('toast.comingSoon', { lang: l.label }), 'info'); }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-violet-600/15"
                >
                  <span>{l.native} <span className="text-xs text-muted">· {l.label}</span></span>
                  {l.code === lang ? <Check size={16} className="text-violet-400" /> : <span className="text-[10px] uppercase text-muted">{t('common.soon')}</span>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Topbar() {
  const { t, theme, toggleTheme, setSearchOpen } = useApp();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-line/10 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-10">
        <div className="lg:hidden"><Logo compact /></div>
        <button
          onClick={() => setSearchOpen(true)}
          className="ml-auto flex h-11 items-center gap-3 rounded-2xl border border-line/15 bg-surface/50 px-3 text-sm text-muted transition hover:border-violet-500/50 sm:px-4 lg:ml-0 lg:w-full lg:max-w-md"
          aria-label={t('search.placeholder')}
        >
          <Search size={18} />
          <span className="hidden sm:inline">{t('search.placeholder')}</span>
          <kbd className="ml-auto hidden rounded-md border border-line/20 px-1.5 py-0.5 text-[10px] lg:inline">{t('common.shortcut')}</kbd>
        </button>
        <div className="flex items-center gap-2 lg:ml-auto">
          <Link to="/pricing" className="btn-ghost hidden h-11 px-3 sm:inline-flex lg:hidden" aria-label={t('nav.pricing')}><Gem size={18} className="text-gold" /></Link>
          <LanguageSwitcher />
          <button onClick={toggleTheme} className="btn-ghost h-11 w-11 px-0" aria-label={t('nav.toggleTheme')}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
