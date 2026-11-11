import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { navItems, isNavActive } from './nav';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { t } = useApp();
  const { pathname } = useLocation();
  return (
    <nav aria-label={t('common.mainNav')} className="fixed inset-x-3 bottom-3 z-40 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="glass flex items-center justify-around rounded-[26px] px-1 py-1.5">
        {navItems.filter((n) => n.mobile).map((item) => {
          const { to, key, icon: Icon } = item;
          const isActive = isNavActive(item, pathname);
          return (
          <Link key={to} to={to} aria-current={isActive ? 'page' : undefined} className="relative flex-1">
            {(
              <span className={`relative flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold transition ${isActive ? 'text-ink' : 'text-muted'}`}>
                {isActive && <motion.span layoutId="bottom-active" className="absolute inset-0 rounded-2xl bg-violet-600/20" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <Icon size={20} className={`relative ${isActive ? 'text-violet-400' : ''}`} />
                <span className="relative">{t(`nav.${key}`)}</span>
              </span>
            )}
          </Link>
          );
        })}
      </div>
    </nav>
  );
}
