import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { currencies } from '../data/constants';

// Shared currency picker (used on Pricing and Product Details).
export default function CurrencySelector({ layoutId = 'cur', className = '', label }) {
  const { currency, setCurrencyCode } = useApp();
  return (
    <div role="group" aria-label={label} className={`glass no-scrollbar flex max-w-full gap-1 overflow-x-auto !rounded-2xl p-1 ${className}`}>
      {currencies.map((c) => (
        <button key={c.code} onClick={() => setCurrencyCode(c.code)} aria-pressed={currency.code === c.code} className={`relative shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${currency.code === c.code ? 'text-white' : 'text-muted hover:text-ink'}`}>
          {currency.code === c.code && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-xl bg-brand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className="relative">{c.code}</span>
        </button>
      ))}
    </div>
  );
}
