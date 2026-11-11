import { useEffect, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useInView } from 'framer-motion';

export function Counter({ to, duration = 2, suffix = '', format = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to, duration]);
  const n = Math.round(val);
  return <span ref={ref}>{format ? n.toLocaleString() : n}{suffix}</span>;
}

export function ProgressRing({ value, max, size = 120, stroke = 10, colors = ['#8b5cf6', '#3b82f6'], children, id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const gid = `ring-${id}`;
  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colors[0]} />
            <stop offset="1" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-line/10" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: inView ? c * (1 - pct) : c }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 6px ${colors[0]}88)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, sub, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {sub && <p className="mt-2 text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-600/15 text-violet-400"><Icon size={30} /></div>
      <h3 className="text-xl font-semibold">{title}</h3>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {action}
    </motion.div>
  );
}

// Form field with label and inline error message.
export function Field({ id, label, error, children }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p id={`${id}-error`} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export const inputProps = (id, error) => ({
  id,
  'aria-invalid': error ? 'true' : undefined,
  'aria-describedby': error ? `${id}-error` : undefined,
  className: `input ${error ? '!border-rose-500 focus:!ring-rose-500/20' : ''}`,
});

export function validateFields(form, required, t) {
  const errors = {};
  required.forEach((k) => { if (!String(form[k] || '').trim()) errors[k] = t('common.required'); });
  if (form.email !== undefined && !errors.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = t('common.invalidEmail');
  return errors;
}

// Horizontally scrolling (mobile) / wrapping (desktop) row of filter chips.
export function ChipRow({ label, options, value, onChange, icons, allLabel, labels }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[null, ...options].map((opt) => {
          const Icon = opt && icons?.[opt];
          const active = value === opt;
          return (
            <button key={opt || 'all'} onClick={() => onChange(opt)} className={`chip shrink-0 ${active ? 'chip-active' : ''}`} aria-pressed={active}>
              {Icon && <Icon size={14} className={active ? 'text-violet-400' : ''} />}
              {opt ? (labels?.[opt] ?? opt) : allLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};
