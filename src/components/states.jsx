import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { isOffline } from '../lib/api';

// ---------------------------------------------------------------- skeletons (glass style, fixed sizes → no layout shift)
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-line/10 ${className}`} aria-hidden="true" />;
}

export function CardGridSkeleton({ count = 6, cover = 'h-36', className = 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' }) {
  const { t } = useApp();
  return (
    <div className={className} role="status" aria-label={t('common.loading')}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass overflow-hidden">
          <Skeleton className={`${cover} !rounded-none`} />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between pt-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-5 w-1/6" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  const { t } = useApp();
  return (
    <div className="space-y-6" role="status" aria-label={t('common.loading')}>
      <div className="space-y-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-10 w-2/3 max-w-xl" /><Skeleton className="h-4 w-1/2 max-w-md" /></div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-48 lg:col-span-2" />
        <Skeleton className="h-48" />
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <Skeleton className="h-72 lg:col-span-3" />
        <Skeleton className="h-72 lg:col-span-2" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- errors
export function DatabaseDown({ onRetry, fullPage = false }) {
  const { t } = useApp();
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center justify-center ${fullPage ? 'min-h-[70vh]' : 'py-10'}`} role="alert">
      <div className="glass relative w-full max-w-lg overflow-hidden p-8 text-center sm:p-10">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand text-white shadow-glow">
          <CloudOff size={36} />
        </motion.div>
        <h1 className="relative mt-6 text-2xl font-bold sm:text-3xl">{t('errors.dbTitle')}</h1>
        <p className="relative mt-2 text-muted">{t('errors.dbBody')}</p>
        <button onClick={onRetry} className="btn-primary relative mt-6"><RefreshCw size={18} /> {t('errors.tryAgain')}</button>
      </div>
    </motion.div>
  );
}

export function ErrorState({ error, onRetry }) {
  const { t } = useApp();
  if (isOffline(error)) return <DatabaseDown onRetry={onRetry} />;
  return (
    <div className="glass flex flex-col items-center gap-3 px-6 py-12 text-center" role="alert">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-400"><AlertTriangle size={26} /></div>
      <h2 className="text-xl font-semibold">{t('errors.genericTitle')}</h2>
      <p className="max-w-sm text-sm text-muted">{error?.message || t('errors.genericBody')}</p>
      {onRetry && <button onClick={onRetry} className="btn-ghost mt-1"><RefreshCw size={16} /> {t('errors.tryAgain')}</button>}
    </div>
  );
}

// Renders skeleton while the first load is running, an error with retry, or the content.
export function DataState({ loading, error, data, onRetry, skeleton = <PageSkeleton />, children }) {
  if (error && !data) return <ErrorState error={error} onRetry={onRetry} />;
  if (!data) return loading ? skeleton : skeleton;
  return children(data);
}

// ---------------------------------------------------------------- auth guard
export function RequireAuth({ children }) {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <PageSkeleton />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
}


export function HomeLink() {
  const { t } = useApp();
  return <Link to="/" className="btn-primary mt-2">{t('errors.goHome')}</Link>;
}
