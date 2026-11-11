import { LogoMark } from './Logo';
import { useApp } from '../context/AppContext';

function Seal({ text }) {
  const points = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 46 : 50;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_6px_14px_rgba(161,98,7,.45)]" aria-hidden="true">
      <defs>
        <radialGradient id="seal-g" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset=".55" stopColor="#f5c76b" />
          <stop offset="1" stopColor="#b7791f" />
        </radialGradient>
        <path id="seal-text" d="M 50,50 m -31,0 a 31,31 0 1,1 62,0 a 31,31 0 1,1 -62,0" />
      </defs>
      <polygon points={points} fill="url(#seal-g)" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#fff7d6" strokeWidth="1.2" strokeDasharray="2 2" />
      <text fontSize="7.2" fontWeight="700" letterSpacing="2.4" fill="#5b3a00" fontFamily="Space Grotesk, sans-serif">
        <textPath href="#seal-text">{text}</textPath>
      </text>
      <path d="M50 34l3.6 9.4 9.4 3.6-9.4 3.6L50 60l-3.6-9.4L37 47l9.4-3.6z" fill="#5b3a00" />
    </svg>
  );
}

// The printable certificate (always on a light "paper" background).
export default function CertificateCard({ cert, verifyUrl }) {
  const { t } = useApp();
  const date = new Date(cert.issued_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  const [a, b] = cert.cover_gradient || ['#7c3aed', '#2563eb'];
  return (
    <div className="print-area relative mx-auto w-full overflow-hidden rounded-[28px] bg-[#fffdf8] text-[#1c1530] shadow-[0_30px_80px_-20px_rgba(0,0,0,.55)] md:aspect-[1.414/1]">
      {/* ornamental frame */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${a}22, transparent 35%, transparent 65%, ${b}22)` }} />
      <div className="pointer-events-none absolute inset-3 rounded-[22px] border-2 border-[#d9b25a]/70 sm:inset-4" />
      <div className="pointer-events-none absolute inset-5 rounded-[18px] border border-[#7c3aed]/25 sm:inset-7" />
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: a }} />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ background: b }} />

      <div className="relative flex h-full flex-col items-center px-6 py-10 text-center sm:px-14 sm:py-12 md:py-[5%]">
        <div className="flex items-center gap-3">
          <LogoMark size={44} />
          <div className="text-left leading-none">
            <p className="font-display text-2xl font-bold" style={{ background: 'linear-gradient(100deg,#6d28d9,#2563eb 60%,#b7791f)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t('brand.name')}</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.25em] text-[#6b6480]">{t('brand.tagline')}</p>
          </div>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[.4em] text-[#a16207] sm:mt-8">{t('certificate.heading')}</p>
        <p className="mt-4 text-sm text-[#6b6480]">{t('certificate.certifies')}</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl" style={{ fontFamily: '"Space Grotesk", Georgia, serif' }}>{cert.learner_name}</h1>
        <div className="mt-3 h-px w-48 bg-gradient-to-r from-transparent via-[#d9b25a] to-transparent sm:w-72" />
        <p className="mt-4 text-sm text-[#6b6480]">{t('certificate.completed')}</p>
        <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold sm:text-3xl" style={{ color: '#4c1d95' }}>{cert.course_title}</h2>
        <p className="mt-2 text-xs text-[#6b6480]">{cert.category} · {cert.level} · {t('certificate.hours', { n: Math.max(1, Math.round(cert.duration_minutes / 60)) })}</p>

        <div className="mt-8 grid w-full max-w-3xl grid-cols-1 items-end gap-6 sm:mt-auto sm:grid-cols-3">
          <div className="text-center">
            <p className="font-display text-lg font-semibold italic text-[#4c1d95]">{cert.instructor_name}</p>
            <div className="mx-auto mt-1 h-px w-40 bg-[#1c1530]/30" />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-[#6b6480]">{t('certificate.instructor')}</p>
          </div>
          <div className="mx-auto h-28 w-28 sm:h-32 sm:w-32"><Seal text={t('certificate.seal')} /></div>
          <div className="text-center">
            <p className="font-display text-lg font-semibold text-[#1c1530]">{date}</p>
            <div className="mx-auto mt-1 h-px w-40 bg-[#1c1530]/30" />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-[#6b6480]">{t('certificate.date')}</p>
          </div>
        </div>

        <p className="mt-6 text-[10px] text-[#6b6480] sm:text-xs">
          {t('certificate.code')}: <span className="font-mono font-semibold text-[#1c1530]">{cert.certificate_code}</span> · {t('certificate.verifyAt')} <span className="font-mono">{verifyUrl.replace(/^https?:\/\//, '')}</span>
        </p>
      </div>
    </div>
  );
}
