import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Users, Rocket, Coins } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice, plans } from '../data/constants';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import CurrencySelector from '../components/CurrencySelector';

const planIcons = { Free: Zap, Pro: Rocket, Teams: Users };

export default function Pricing() {
  const { t, currency, toast, setCheckout } = useApp();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const plan = user?.plan;

  // Logged out → sign up first. Free → switch straight away. Paid → demo checkout.
  const choose = async (p) => {
    if (!user) { navigate('/signup?next=/pricing'); return; }
    if (p.priceUSD > 0) { setCheckout({ kind: 'plan', item: p }); return; }
    try {
      const data = await api('/profile', { method: 'PATCH', body: { plan: p.id } });
      updateUser({ plan: data.user.plan });
      toast(t('pricing.chosen', { plan: p.id }));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{t('nav.pricing')}</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{t('pricing.title')}</h1>
        <p className="mt-3 text-muted">{t('pricing.sub')}</p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="label flex items-center gap-1"><Coins size={13} /> {t('pricing.currency')}</p>
        <CurrencySelector label={t('pricing.currency')} />
      </div>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
        {plans.map((p, i) => {
          const Icon = planIcons[p.id];
          const price = formatPrice(p.priceUSD, currency) || `${currency.symbol}0`;
          const isCurrent = plan === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -8 }}
              className={`relative ${p.popular ? 'lg:-mt-4' : ''}`}
            >
              {p.popular && <div className="absolute -inset-px rounded-[26px] bg-gradient-to-b from-violet-500 via-blue-500 to-gold opacity-80 blur-[2px]" />}
              <div className={`glass relative flex h-full flex-col p-7 ${p.popular ? '!bg-surface/95 lg:pb-11 lg:pt-11' : ''} ${isCurrent ? 'ring-2 ring-emerald-500/70' : ''}`} data-plan={p.id}>
                {isCurrent && <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white"><Check size={12} /> {t('pricing.yourPlan')}</span>}
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-gold to-amber-400 px-4 py-1.5 text-xs font-bold text-[#2a1a00] shadow-lg">
                    <Sparkles size={13} /> {t('pricing.popular')}
                  </span>
                )}
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${p.popular ? 'bg-brand text-white shadow-glow' : 'bg-violet-600/15 text-violet-400'}`}><Icon size={22} /></div>
                <h2 className="mt-5 text-2xl font-bold">{p.id}</h2>
                <p className="mt-1 text-sm text-muted">{t(`plans.${p.id}.desc`)}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <motion.span key={price} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold sm:text-5xl">{price}</motion.span>
                  <span className="text-sm text-muted">{t('pricing.perMonth')}{p.perSeat ? t('pricing.perSeat') : ''}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {t(`plans.${p.id}.features`).map((f) => (
                    <li key={f} className="flex items-start gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><Check size={13} /></span>{f}</li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  onClick={() => choose(p)}
                  className={`mt-8 w-full py-4 ${p.popular ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {isCurrent ? t('pricing.current') : t('pricing.choose', { plan: p.id })}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-8 text-center text-xs text-muted">{t('pricing.note')}</p>
    </div>
  );
}
