import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Download, Check, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useProductActions from '../hooks/useProductActions';
import ProductCover from './ProductCover';
import { formatPrice } from '../data/constants';

export const compact = (n) => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export function OwnedBadge({ className = '' }) {
  const { t } = useApp();
  return <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg ${className}`}><Check size={12} strokeWidth={3} /> {t('products.owned')}</span>;
}

export function PriceTag({ product, className = '' }) {
  const { t, currency } = useApp();
  const price = formatPrice(product.price_usd, currency);
  if (!price) return <span className={`inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-400 ${className}`}>{t('products.freeBadge')}</span>;
  return <span className={`font-display text-lg font-bold ${className}`}>{price}</span>;
}

function Ribbon() {
  const { t } = useApp();
  return (
    <div className="pointer-events-none absolute -right-11 top-5 z-10 w-40 rotate-45 bg-gradient-to-r from-gold to-amber-400 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-[#2a1a00] shadow-lg">
      <Award size={11} className="-mt-0.5 mr-1 inline" />{t('products.bestseller')}
    </div>
  );
}

function Meta({ product }) {
  const { t } = useApp();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      <span className="flex items-center gap-1"><Star size={13} className="fill-gold text-gold" /> <span className="font-semibold text-ink">{product.rating}</span></span>
      <span className="flex items-center gap-1"><Download size={13} /> {t('products.downloads', { n: compact(product.download_count) })}</span>
    </div>
  );
}

const ProductCard = forwardRef(function ProductCard({ product, index = 0 }, ref) {
  const { t } = useApp();
  const { isOwned } = useProductActions();
  const owned = isOwned(product);
  return (
    <motion.div
      ref={ref} layout
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.4 }}
      whileHover={{ y: -6 }} className="group"
    >
      <Link to={`/products/${product.slug}`} className="glass relative flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-glow" data-product={product.slug}>
        {product.is_bestseller && <Ribbon />}
        <div className="relative">
          <ProductCover product={product} className="h-40" />
          <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{t(`productTypes.${product.product_type}`)}</span>
          {owned && <OwnedBadge className="absolute left-3 top-3" />}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-400">{product.category}</span>
            <span className="rounded-md border border-line/20 px-2 py-0.5 text-[11px] font-bold tracking-wide text-muted">{product.format}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-snug">{product.title}</h3>
            <p className="mt-1 text-xs text-muted">{product.page_or_item_count} · {product.level}</p>
          </div>
          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <Meta product={product} />
            <PriceTag product={product} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export function StackedCovers({ items, size = 'sm' }) {
  return (
    <div className="flex items-center">
      {items.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: -10, rotate: 0 }} animate={{ opacity: 1, x: 0, rotate: (i - (items.length - 1) / 2) * 5 }}
          transition={{ delay: 0.1 + i * 0.07 }}
          className={`${i ? '-ml-5' : ''} shadow-xl ring-2 ring-white/20 ${size === 'sm' ? 'rounded-xl' : 'rounded-lg'} transition-transform duration-300 group-hover:-translate-y-1`}
          style={{ zIndex: items.length - i }}
        >
          <ProductCover product={p} size={size} className={size === 'sm' ? 'h-20 w-16' : 'h-12 w-10'} />
        </motion.div>
      ))}
    </div>
  );
}

export const BundleCard = forwardRef(function BundleCard({ product, index = 0 }, ref) {
  const { t, currency } = useApp();
  const { isOwned } = useProductActions();
  const items = product.items || [];
  const owned = isOwned(product);
  return (
    <motion.div
      ref={ref} layout
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.4 }}
      whileHover={{ y: -6 }} className="group sm:col-span-2"
    >
      <Link to={`/products/${product.slug}`} className="glass relative flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-glow sm:flex-row" data-product={product.slug}>
        {product.is_bestseller && <Ribbon />}
        <div className="relative flex min-h-[176px] items-center justify-center overflow-hidden p-6 sm:w-[46%]" style={{ background: `linear-gradient(140deg, ${product.cover_gradient[0]}, ${product.cover_gradient[1]})` }}>
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          <StackedCovers items={items} />
          <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{t('products.bundle')}</span>
          {owned && <OwnedBadge className="absolute left-3 top-3" />}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-400">{product.category}</span>
            <span className="rounded-full bg-gradient-to-r from-gold to-amber-400 px-2.5 py-1 text-[11px] font-bold text-[#2a1a00]">{t('products.save', { n: product.saving_pct })}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold leading-snug">{product.title}</h3>
            <p className="mt-1 text-sm text-muted">{product.subtitle}</p>
            <p className="mt-2 text-xs font-semibold text-muted">{t('products.includes', { n: items.length })}</p>
          </div>
          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <Meta product={product} />
            <div className="text-right">
              <span className="block text-xs text-muted line-through">{formatPrice(product.original_price_usd, currency)}</span>
              <PriceTag product={product} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default ProductCard;
