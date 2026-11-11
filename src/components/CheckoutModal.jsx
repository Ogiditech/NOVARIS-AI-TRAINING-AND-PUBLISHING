import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShieldCheck, Loader2, Sparkles, Gem, GraduationCap, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ProductCover from './ProductCover';
import { gradient } from './CourseCard';
import { api } from '../lib/api';
import { celebrate } from '../lib/celebrate';
import { formatPrice, plans } from '../data/constants';

// Demo checkout for digital products, eBooks, paid courses and plans. No payment provider, no card fields.
export default function CheckoutModal() {
  const { t, toast, currency, checkout, setCheckout, markAcquired } = useApp();
  const { updateUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const item = checkout?.item;
  const kind = checkout?.kind;

  const close = () => { if (!processing) setCheckout(null); };

  useEffect(() => {
    if (!checkout) return undefined;
    setProcessing(false);
    const onKey = (e) => { if (e.key === 'Escape') setCheckout(null); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [checkout, setCheckout]);

  const priceUsd = !item ? 0 : kind === 'plan' ? plans.find((p) => p.id === item.id).priceUSD : Number(item.price_usd);
  const original = kind === 'product' && item?.original_price_usd ? item.original_price_usd : null;

  const confirm = async () => {
    setProcessing(true);
    try {
      let result;
      if (kind === 'product') {
        result = await api('/products/purchase', { method: 'POST', body: { id: item.id, currency: currency.code } });
        markAcquired('products', result.productIds);
        toast(t('products.added'));
      } else if (kind === 'ebook') {
        result = await api('/purchases', { method: 'POST', body: { id: item.id, currency: currency.code } });
        markAcquired('ebooks', [item.id]);
        toast(t('ebooks.bought', { title: item.title }));
      } else if (kind === 'course') {
        result = await api(`/courses/${item.slug}/enroll`, { method: 'POST' });
        markAcquired('courses', [item.id]);
        toast(t('courseDetails.enrolledToast', { title: item.title }));
      } else if (kind === 'plan') {
        result = await api('/profile', { method: 'PATCH', body: { plan: item.id } });
        updateUser({ plan: result.user.plan });
        toast(t('pricing.chosen', { plan: item.id }));
      }
      celebrate();
      const done = checkout.onDone;
      setCheckout(null);
      done?.(result);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const title = !item ? '' : kind === 'plan' ? t('checkout.planTitle', { plan: item.id }) : item.title;
  const meta = !item ? '' : {
    product: `${t(`productTypes.${item.product_type}`)} · ${item.format} · ${item.page_or_item_count}`,
    ebook: `${item.author_name} · ${t('ebooks.pages', { n: item.page_count })}`,
    course: `${item.level} · ${t('courses.lessons', { n: item.lessons_count })}`,
    plan: t('checkout.planMeta'),
  }[kind];

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="checkout-title"
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative max-h-[92vh] w-full max-w-md overflow-y-auto !rounded-b-none !bg-surface/95 p-6 sm:!rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 id="checkout-title" className="text-xl font-bold">{t('checkout.heading')}</h2>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{t('checkout.title')}</p>
              </div>
              <button onClick={close} className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface hover:text-ink" aria-label={t('checkout.close')}><X size={20} /></button>
            </div>

            <div className="mt-5 flex gap-4 rounded-2xl border border-line/15 bg-surface/60 p-3">
              {kind === 'product' && <ProductCover product={item} size="sm" className="h-20 w-16 shrink-0" />}
              {kind === 'ebook' && <div className="grid h-20 w-16 shrink-0 place-items-center rounded-xl text-white shadow-lg" style={{ background: gradient(item, 145) }}><BookOpen size={26} /></div>}
              {kind === 'course' && <div className="grid h-20 w-16 shrink-0 place-items-center rounded-xl text-white" style={{ background: gradient(item) }}><GraduationCap size={26} /></div>}
              {kind === 'plan' && <div className="grid h-20 w-16 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-glow"><Gem size={26} /></div>}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{t(`checkout.kinds.${kind}`)}</p>
                <p className="font-semibold leading-snug">{title}</p>
                <p className="text-xs text-muted">{meta}</p>
              </div>
            </div>

            {kind === 'product' && item.items?.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm">
                {item.items.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 text-muted">
                    <span className="flex min-w-0 items-center gap-2"><Sparkles size={13} className="shrink-0 text-violet-400" /><span className="truncate">{p.title}</span></span>
                    <span className="shrink-0 tabular-nums">{formatPrice(p.price_usd, currency)}</span>
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-5 space-y-2 border-t border-line/10 pt-4 text-sm">
              {original && (
                <>
                  <div className="flex justify-between text-muted"><dt>{t('checkout.original')}</dt><dd className="line-through tabular-nums">{formatPrice(original, currency)}</dd></div>
                  <div className="flex justify-between text-emerald-400"><dt>{t('checkout.discount')}</dt><dd className="tabular-nums">−{formatPrice(Math.round((original - priceUsd) * 100) / 100, currency)}</dd></div>
                </>
              )}
              <div className="flex items-baseline justify-between">
                <dt className="font-semibold">{t('checkout.total')}</dt>
                <dd className="font-display text-2xl font-bold tabular-nums">{formatPrice(priceUsd, currency) || t('courses.free')}{kind === 'plan' && <span className="text-sm font-normal text-muted">{t('pricing.perMonth')}</span>}</dd>
              </div>
            </dl>

            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-blue-500/10 p-3 text-xs text-blue-400"><ShieldCheck size={16} className="shrink-0" /> {t('checkout.note')}</p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
              <button onClick={close} disabled={processing} className="btn-ghost flex-1">{t('checkout.cancel')}</button>
              <button onClick={confirm} disabled={processing} className="btn-primary flex-[1.6]">
                {processing ? <><Loader2 size={18} className="animate-spin" /> {t('checkout.processing')}</> : t('checkout.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
