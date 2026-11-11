import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotFound() {
  const { t } = useApp();
  return (
    <div className="flex min-h-[65vh] items-center justify-center py-10">
      <div className="glass relative w-full max-w-xl overflow-hidden p-8 text-center sm:p-12">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
        <p className="relative font-display text-8xl font-bold text-brand sm:text-9xl" aria-hidden="true">404</p>
        <motion.div className="relative mx-auto -mt-4 grid h-20 w-20 place-items-center rounded-3xl bg-brand text-white shadow-glow"
          animate={{ rotate: [0, 25, -40, 15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <Compass size={38} />
        </motion.div>
        <h1 className="relative mt-6 text-3xl font-bold sm:text-4xl">{t('errors.notFoundTitle')}</h1>
        <p className="relative mt-3 text-muted">{t('errors.notFoundBody')}</p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary"><Home size={18} /> {t('errors.goHome')}</Link>
          <Link to="/courses" className="btn-ghost"><GraduationCap size={18} /> {t('nav.courses')}</Link>
        </div>
      </div>
    </div>
  );
}
