import { LogoMark } from './Logo';
import { useApp } from '../context/AppContext';

// Generated gradient covers — no images needed.
export default function BookCover({ book, className = '' }) {
  const { t } = useApp();
  const [a, b] = book.cover_gradient || ['#7c3aed', '#2563eb'];
  const seed = book.slug.length;
  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden rounded-2xl shadow-card ${className}`}
      style={{ background: `linear-gradient(145deg, ${a} 0%, ${b} 100%)` }}
    >
      <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at ${20 + (seed % 9) * 7}% ${15 + (seed % 5) * 6}%, rgba(255,255,255,.55), transparent 45%)` }} />
      <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 120 160" preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <circle key={i} cx={60 + (seed % 3) * 18} cy={110} r={14 + i * 12} fill="none" stroke="white" strokeWidth=".6" />
        ))}
      </svg>
      <div className="absolute left-0 top-0 h-full w-2.5 bg-black/20" />
      <div className="relative flex h-full flex-col justify-between p-4 pl-5 text-white">
        <span className="text-[10px] font-semibold uppercase tracking-[.25em] opacity-80">{t('common.publisher')}</span>
        <div>
          <h3 className="font-display text-lg font-bold leading-tight drop-shadow sm:text-xl">{book.title}</h3>
          <p className="mt-1 text-[11px] opacity-85">{book.subtitle}</p>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-[11px] font-medium opacity-90">{book.author_name}</span>
          <LogoMark size={22} />
        </div>
      </div>
    </div>
  );
}
