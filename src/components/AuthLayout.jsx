import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Quote, Star, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogoMark } from './Logo';

const sparkles = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 41 + 9) % 100, top: (i * 67 + 13) % 100, size: 8 + ((i * 5) % 16), delay: (i % 7) * 0.4, dur: 2.6 + (i % 5) * 0.5,
}));

function SparkleField() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {sparkles.map((s, i) => (
        <motion.span key={i} className="absolute" style={{ left: `${s.left}%`, top: `${s.top}%` }}
          animate={{ opacity: [0, 0.95, 0], scale: [0.3, 1, 0.3], y: [0, -14, 0], rotate: [0, 90, 180] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}>
          <Sparkles size={s.size} className={i % 3 === 0 ? 'text-gold' : 'text-white'} />
        </motion.span>
      ))}
    </div>
  );
}

function Testimonials({ compact = false }) {
  const { t } = useApp();
  const list = t('auth.testimonials');
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % list.length), 6000);
    return () => clearInterval(id);
  }, [list.length]);
  const item = list[i];
  return (
    <div className={compact ? '' : 'rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md'}>
      <AnimatePresence mode="wait">
        <motion.figure key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }}>
          {!compact && (
            <div className="mb-3 flex items-center gap-1 text-gold">
              {[0, 1, 2, 3, 4].map((s) => <Star key={s} size={14} className="fill-gold" />)}
            </div>
          )}
          <blockquote className={compact ? 'line-clamp-2 text-sm text-white/90' : 'text-lg leading-relaxed text-white'}>
            {!compact && <Quote size={22} className="mb-2 text-white/50" />}
            {item.quote}
          </blockquote>
          <figcaption className={`flex items-center gap-3 ${compact ? 'mt-2' : 'mt-5'}`}>
            {!compact && <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 font-display font-bold text-white">{item.name.split(' ').map((n) => n[0]).join('')}</span>}
            <span className="text-sm text-white/80"><span className="font-semibold text-white">{item.name}</span> · {item.role}, {item.country}</span>
          </figcaption>
        </motion.figure>
      </AnimatePresence>
      {!compact && (
        <div className="mt-5 flex gap-1.5">
          {list.map((_, d) => <button key={d} onClick={() => setI(d)} aria-label={t('auth.showTestimonial', { n: d + 1 })} className={`h-1.5 rounded-full transition-all ${d === i ? 'w-8 bg-white' : 'w-3 bg-white/40'}`} />)}
        </div>
      )}
    </div>
  );
}

// Split-screen glass layout for login and sign up. On mobile the gradient becomes a short header.
export default function AuthLayout({ children }) {
  const { t } = useApp();
  return (
    <div className="aurora relative min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Gradient side (desktop) / header (mobile) */}
      <section className="relative overflow-hidden bg-brand text-white lg:sticky lg:top-0 lg:h-screen">
        <motion.div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-fuchsia-400/40 blur-3xl" animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity }} />
        <motion.div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-gold/30 blur-3xl" animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 16, repeat: Infinity }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <SparkleField />

        <div className="relative flex h-full flex-col px-5 pb-6 pt-5 sm:px-8 lg:px-12 lg:py-12">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3" aria-label={t('common.homeLink')}>
              <LogoMark size={42} />
              <span className="leading-none">
                <span className="block font-display text-2xl font-bold">{t('brand.name')}</span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.22em] text-white/75">{t('brand.tagline')}</span>
              </span>
            </Link>
            <Link to="/" className="flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-sm text-white/80 hover:bg-white/10 hover:text-white"><ArrowLeft size={16} /> <span className="hidden sm:inline">{t('auth.backHome')}</span></Link>
          </div>

          <div className="mt-5 lg:hidden"><Testimonials compact /></div>

          <div className="mt-auto hidden lg:block">
            <h2 className="max-w-md text-4xl font-bold leading-tight xl:text-5xl">{t('auth.sideTitle')}</h2>
            <p className="mt-3 max-w-md text-white/80">{t('auth.sideSub')}</p>
            <div className="mt-8 max-w-md"><Testimonials /></div>
          </div>
        </div>
      </section>

      {/* Form side */}
      <section className="relative z-10 flex items-start justify-center px-4 py-8 sm:px-8 lg:items-center lg:py-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-lg">
          {children}
        </motion.div>
      </section>
    </div>
  );
}
