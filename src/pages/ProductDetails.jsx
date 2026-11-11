import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Star, Download, CheckCircle2, Copy, Check, Layers, PackageSearch, Tag, FileType, HardDrive, Hash, BarChart3, Shapes, Award, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import useProductActions from '../hooks/useProductActions';
import { EmptyState } from '../components/ui';
import { ErrorState, PageSkeleton } from '../components/states';
import ProductCover from '../components/ProductCover';
import ProductCard, { OwnedBadge, PriceTag, StackedCovers, compact } from '../components/ProductCard';
import ProductAction from '../components/ProductAction';
import CurrencySelector from '../components/CurrencySelector';
import { formatPrice } from '../data/constants';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers / contexts without the async clipboard API.
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

function PreviewCard({ item, index }) {
  const { t, toast } = useApp();
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (await copyText(item.text)) {
      setCopied(true);
      toast(t('products.copied'));
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast(t('products.copyFailed'), 'error');
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="glass flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-600/20 text-xs font-bold text-violet-400">{index + 1}</span>{item.title}</p>
        <button onClick={onCopy} className={`flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${copied ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400' : 'border-line/20 text-muted hover:border-violet-500/50 hover:text-ink'}`} aria-label={`${t('products.copy')}: ${item.title}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(copied)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1.5">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t('products.copied') : t('products.copy')}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <p className="mt-3 rounded-2xl border border-line/10 bg-bg/40 p-4 font-mono text-[13px] leading-relaxed text-ink/90">{item.text}</p>
    </motion.div>
  );
}

function PriceBlock({ product }) {
  const { t, currency } = useApp();
  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
      <PriceTag product={product} className="!text-4xl" />
      {product.original_price_usd && (
        <>
          <span className="pb-1 text-sm text-muted line-through">{formatPrice(product.original_price_usd, currency)}</span>
          <span className="mb-1 rounded-full bg-gradient-to-r from-gold to-amber-400 px-2.5 py-1 text-xs font-bold text-[#2a1a00]">{t('products.save', { n: product.saving_pct })}</span>
        </>
      )}
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const { t, currency } = useApp();
  const { isOwned } = useProductActions();
  const { data, error, reload } = useApi(`/products/${encodeURIComponent(slug)}`);

  // Reserve room under the footer for the fixed mobile buy bar.
  useEffect(() => {
    if (!data) return undefined;
    document.body.classList.add('has-buybar');
    return () => document.body.classList.remove('has-buybar');
  }, [data]);

  if (error && !data) {
    return error.status === 404
      ? <EmptyState icon={PackageSearch} title={t('products.notFound')} action={<Link to="/products" className="btn-primary mt-2">{t('products.back')}</Link>} />
      : <ErrorState error={error} onRetry={reload} />;
  }
  if (!data) return <PageSkeleton />;

  const { product, bundles, related } = data;
  const isBundle = product.product_type === 'Bundle';
  const owned = isOwned(product);
  const items = product.items || [];
  const specs = [
    [Tag, t('products.specs.category'), product.category],
    [Shapes, t('products.specs.type'), t(`productTypes.${product.product_type}`)],
    [FileType, t('products.specs.format'), product.format],
    [HardDrive, t('products.specs.size'), product.file_size],
    [Hash, t('products.specs.items'), product.page_or_item_count],
    [BarChart3, t('products.specs.level'), product.level],
  ];

  return (
    <div>
      <Link to="/products" className="mb-2 inline-flex min-h-[40px] items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> {t('products.back')}</Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="group relative">
          <div className="absolute -inset-4 rounded-[40px] opacity-40 blur-3xl" style={{ background: `linear-gradient(140deg, ${product.cover_gradient[0]}, ${product.cover_gradient[1]})` }} />
          {isBundle ? (
            <div className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl shadow-card" style={{ background: `linear-gradient(140deg, ${product.cover_gradient[0]}, ${product.cover_gradient[1]})` }}>
              <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <div className="scale-150 sm:scale-[1.8]"><StackedCovers items={items} /></div>
              <Layers className="absolute bottom-5 right-5 text-white/40" size={40} />
            </div>
          ) : (
            <ProductCover product={product} size="xl" className="relative aspect-square shadow-card" />
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.is_bestseller && <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-gold to-amber-400 px-3 py-1 text-xs font-bold text-[#2a1a00] shadow-lg"><Award size={13} /> {t('products.bestseller')}</span>}
            {owned && <OwnedBadge />}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">{product.category}</span>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">{t(`productTypes.${product.product_type}`)}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{product.title}</h1>
          <p className="mt-2 text-lg text-muted">{product.subtitle}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5" aria-label={t('products.ratingLabel', { n: product.rating })}>
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} className={i <= Math.round(product.rating) ? 'fill-gold text-gold' : 'text-line/40'} />)}
              <span className="ml-1 font-semibold">{product.rating}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted"><Download size={16} /> {t('products.downloads', { n: compact(product.download_count) })}</span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {specs.map(([Icon, label, value]) => (
              <div key={label} className="rounded-2xl border border-line/10 bg-surface/50 p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted"><Icon size={13} /> {label}</dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 leading-relaxed text-ink/90">{product.description}</p>

          <div className="glass mt-6 hidden space-y-4 p-5 lg:block">
            <PriceBlock product={product} />
            <div>
              <p className="label">{t('products.currency')}</p>
              <CurrencySelector layoutId="cur-product" label={t('products.currency')} />
            </div>
            <ProductAction product={product} className="w-full py-4 text-base" />
          </div>
          <div className="mt-6 lg:hidden">
            <p className="label">{t('products.currency')}</p>
            <CurrencySelector layoutId="cur-product-m" label={t('products.currency')} />
          </div>
        </motion.div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">{isBundle ? t('products.inThisBundle') : t('products.whatsIncluded')}</h2>
        <ul className="glass grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          {product.whats_included.map((item, i) => (
            <motion.li key={item} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 text-sm">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-400" /> {item}
            </motion.li>
          ))}
        </ul>
      </section>

      {isBundle && items.length > 0 && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((p) => (
            <Link key={p.id} to={`/products/${p.slug}`} className="glass group flex items-center gap-3 p-3 transition hover:shadow-glow">
              <ProductCover product={p} size="sm" className="h-16 w-14 shrink-0" />
              <span className="min-w-0"><span className="block truncate text-sm font-semibold">{p.title}</span><span className="text-xs text-muted">{t(`productTypes.${p.product_type}`)} · {formatPrice(p.price_usd, currency)}</span></span>
            </Link>
          ))}
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-bold">{t('products.preview')}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t('products.previewSub')}</p>
        <div className="grid gap-4 lg:grid-cols-3">
          {product.preview_items.map((item, i) => <PreviewCard key={item.title} item={item} index={i} />)}
        </div>
      </section>

      {bundles.map((b) => (
        <section key={b.id} className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">{t('products.partOfBundle')}</h2>
          <Link to={`/products/${b.slug}`} className="group glass relative flex flex-col gap-5 overflow-hidden p-5 transition hover:shadow-glow sm:flex-row sm:items-center sm:p-6">
            <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: `linear-gradient(${b.cover_gradient[0]}, ${b.cover_gradient[1]})` }} />
            <StackedCovers items={b.items} size="xs" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">{b.title}</p>
              <p className="text-sm text-muted">{t('products.bundleSave', { n: b.items.length - 1, price: formatPrice(b.price_usd, currency), pct: b.saving_pct })}</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-violet-400">{t('products.viewBundle')} <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
          </Link>
        </section>
      ))}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">{t('products.related')}</h2>
          <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-4">
            {related.map((p, i) => <div key={p.id} className="w-72 shrink-0"><ProductCard product={p} index={i} /></div>)}
          </div>
        </section>
      )}

      {createPortal(
        <div data-buybar className="fixed inset-x-3 z-30 lg:hidden" style={{ bottom: 'calc(88px + env(safe-area-inset-bottom))' }}>
          <div className="glass flex items-center justify-between gap-3 !rounded-[22px] !bg-surface/90 p-3 pl-5">
            <div className="min-w-0">
              <PriceTag product={product} className="!text-2xl" />
              {product.saving_pct && <p className="text-[11px] font-semibold text-gold">{t('products.save', { n: product.saving_pct })}</p>}
            </div>
            <ProductAction product={product} className="shrink-0" />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
