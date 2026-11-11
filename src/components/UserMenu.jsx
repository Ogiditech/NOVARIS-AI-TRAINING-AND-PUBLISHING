import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Library, LogIn, LogOut, User, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';

export function Avatar({ user, size = 40, className = '' }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-display font-bold text-white ring-2 ring-white/15 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(140deg, ${user.avatarColor}, ${user.avatarColor}bb)` }} aria-hidden="true">
      {initials(user.fullName)}
    </span>
  );
}

export default function UserMenu() {
  const { t, toast } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="btn-ghost h-11 !px-3 sm:!px-4"><LogIn size={17} /> <span className="hidden sm:inline">{t('auth.loginButton')}</span></Link>
        <Link to="/signup" className="btn-primary hidden h-11 !px-4 md:inline-flex"><UserPlus size={17} /> {t('auth.signupShort')}</Link>
      </div>
    );
  }

  const doLogout = async () => {
    setOpen(false);
    await logout();
    toast(t('auth.loggedOut'), 'info');
    navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex h-11 items-center gap-2 rounded-full border border-line/15 bg-surface/50 p-1 pr-1 transition hover:border-violet-500/50 sm:pr-3" aria-haspopup="menu" aria-expanded={open} aria-label={t('auth.accountMenu')}>
        <Avatar user={user} size={34} />
        <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:inline">{user.firstName}</span>
        <ChevronDown size={16} className={`hidden text-muted transition sm:block ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} className="glass absolute right-0 top-14 z-50 w-64 overflow-hidden !bg-surface/95 p-1.5">
            <div className="flex items-center gap-3 border-b border-line/10 px-3 pb-3 pt-2">
              <Avatar user={user} size={40} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.fullName}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            {[
              ['/profile', User, t('nav.profile')],
              ['/library', Library, t('library.title')],
            ].map(([to, Icon, label]) => (
              <Link key={to} to={to} role="menuitem" onClick={() => setOpen(false)} className="mt-1 flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm hover:bg-violet-600/15">
                <Icon size={17} className="text-violet-400" /> {label}
              </Link>
            ))}
            <button role="menuitem" onClick={doLogout} className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-rose-400 hover:bg-rose-500/10">
              <LogOut size={17} /> {t('auth.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
