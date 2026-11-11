import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const icons = { success: CheckCircle2, info: Info, error: AlertTriangle };
const tones = { success: 'text-emerald-400', info: 'text-blue-400', error: 'text-rose-400' };

export default function Toasts() {
  const { t, toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:top-auto sm:items-end" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <motion.div
              key={toast.id} layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.95 }}
              className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4"
            >
              <Icon size={20} className={`mt-0.5 shrink-0 ${tones[toast.type]}`} />
              <p className="flex-1 text-sm">{toast.message}</p>
              <button onClick={() => dismissToast(toast.id)} className="text-muted hover:text-ink" aria-label={t('common.dismiss')}><X size={16} /></button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
