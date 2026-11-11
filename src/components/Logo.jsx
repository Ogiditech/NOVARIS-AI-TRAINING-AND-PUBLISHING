import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="nv-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="0.65" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#f5c76b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#140d2b" />
      <rect x="1" y="1" width="62" height="62" rx="17" fill="none" stroke="url(#nv-g)" strokeOpacity=".5" />
      <path d="M10 46c7-4 14-4 22 0V20c-8-4-15-4-22 0z" fill="url(#nv-g)" opacity=".95" />
      <path d="M54 46c-7-4-14-4-22 0V20c8-4 15-4 22 0z" fill="url(#nv-g)" opacity=".6" />
      <path d="M32 3l3.2 8.3L43.5 14l-8.3 3.2L32 25.5l-3.2-8.3L20.5 14l8.3-2.7z" fill="#f5c76b" />
    </svg>
  );
}

export default function Logo({ compact = false }) {
  const { t } = useApp();
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label={t('common.homeLink')}>
      <span className="transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
        <LogoMark size={compact ? 34 : 42} />
      </span>
      <span className="leading-none">
        <span className="block font-display text-2xl font-bold tracking-tight text-brand">{t('brand.name')}</span>
        {!compact && <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.22em] text-muted">{t('brand.tagline')}</span>}
      </span>
    </Link>
  );
}
