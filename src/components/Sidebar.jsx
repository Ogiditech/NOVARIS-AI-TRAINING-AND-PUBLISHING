import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { navItems, isNavActive } from './nav';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UserMenu';

export default function Sidebar() {
  const { t } = useApp();
  const { user } = useAuth();
  const { pathname } = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-line/10 bg-surface/40 p-6 backdrop-blur-xl lg:flex">
      <Logo />
      <nav className="mt-10 flex flex-col gap-1" aria-label={t('common.mainNav')}>
        {navItems.map((item) => {
          const { to, key, icon: Icon, children } = item;
          const isActive = isNavActive(item, pathname, { excludeChildren: true });
          return (
            <div key={to}>
              <Link to={to} aria-current={isActive ? 'page' : undefined} className="relative block">
                <span className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'text-ink' : 'text-muted hover:bg-surface/60 hover:text-ink'}`}>
                  {isActive && (
                    <motion.span layoutId="side-active" className="absolute inset-0 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/25 to-blue-600/10" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                  )}
                  <Icon size={18} className={`relative ${isActive ? 'text-violet-400' : ''}`} />
                  <span className="relative">{t(`nav.${key}`)}</span>
                </span>
              </Link>
              {children?.map((child) => {
                const childActive = isNavActive(child, pathname);
                const ChildIcon = child.icon;
                return (
                  <Link key={child.to} to={child.to} aria-current={childActive ? 'page' : undefined} className="relative ml-6 block border-l border-line/15 pl-3">
                    <span className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${childActive ? 'text-ink' : 'text-muted hover:bg-surface/60 hover:text-ink'}`}>
                      {childActive && <motion.span layoutId="side-active" className="absolute inset-0 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-600/25 to-blue-600/10" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                      <ChildIcon size={16} className={`relative ${childActive ? 'text-violet-400' : ''}`} />
                      <span className="relative">{t(`nav.${child.key}`)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {user ? (
          <>
            <div className="glass relative overflow-hidden p-4">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-orange-500/30 blur-2xl" />
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white">
                  <Flame size={20} />
                </div>
                <div>
                  <p className="font-display text-xl font-bold">{t('common.days', { n: user.streak ?? 0 })}</p>
                  <p className="text-xs text-muted">{t('dashboard.streak')}</p>
                </div>
              </div>
            </div>
            <Link to="/profile" className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-surface/60">
              <Avatar user={user} size={40} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{user.fullName}</span>
                <span className="flex items-center gap-1 text-xs text-muted"><Sparkles size={12} className="text-gold" /> {user.plan} · {user.country}</span>
              </span>
            </Link>
          </>
        ) : (
          <div className="glass relative overflow-hidden p-5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/30 blur-2xl" />
            <p className="relative font-display text-lg font-bold leading-snug">{t('auth.sidebarTitle')}</p>
            <p className="relative mt-1 text-xs text-muted">{t('auth.sidebarSub')}</p>
            <Link to="/signup" className="btn-primary relative mt-4 w-full !py-2.5">{t('auth.signupShort')}</Link>
            <Link to="/login" className="relative mt-2 flex min-h-[40px] items-center justify-center text-sm font-semibold text-violet-400 hover:text-violet-300">{t('auth.loginButton')}</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
