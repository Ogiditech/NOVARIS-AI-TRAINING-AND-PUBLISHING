import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TipOfDay({ className = '' }) {
  const { t } = useApp();
  const aiTips = t('tip.items');
  const dayIndex = Math.floor(Date.now() / 86400000) % aiTips.length;
  const [i, setI] = useState(dayIndex);
  return (
    <div className={`glass relative overflow-hidden p-5 ${className}`}>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <Lightbulb size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="eyebrow !text-gold">{t('tip.title')}</p>
            <button onClick={() => setI((x) => (x + 1) % aiTips.length)} className="-my-2 -mr-2 flex min-h-[40px] min-w-[40px] items-center justify-center gap-1 rounded-xl px-2 text-xs text-muted hover:text-ink" aria-label={t('tip.next')}>
              <RefreshCw size={13} /> <span className="hidden sm:inline">{t('tip.next')}</span>
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-1.5 text-sm leading-relaxed">
              {aiTips[i]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
