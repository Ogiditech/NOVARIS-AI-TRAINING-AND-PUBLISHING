import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import useProductActions from '../hooks/useProductActions';
import ProductCover from './ProductCover';
import ProductAction from './ProductAction';
import { OwnedBadge } from './ProductCard';
import { Skeleton } from './states';

// Landing page strip of free digital products with a "Get it free" button each.
export default function FreeResources() {
  const { t } = useApp();
  const { isOwned } = useProductActions();
  const { data } = useApi('/products?price=free&sort=popular');
  const free = data?.products || [];
  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow mb-2 flex items-center gap-2"><Gift size={14} /> {t('products.freeStripEyebrow')}</p>
          <h2 className="text-3xl font-bold sm:text-4xl">{t('products.freeStripTitle')}</h2>
          <p className="mt-2 text-muted">{t('products.freeStripSub')}</p>
        </div>
        <Link to="/products?price=free" className="flex min-h-[40px] items-center gap-1 text-sm font-semibold text-violet-400 hover:text-violet-300">{t('products.seeAll')} <ArrowRight size={16} /></Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
        {!data && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[132px] w-[85%] shrink-0 md:w-auto" />)}
        {free.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="group glass relative flex w-[85%] shrink-0 snap-start items-center gap-4 p-4 transition-shadow hover:shadow-glow md:w-auto"
          >
            <Link to={`/products/${p.slug}`} className="shrink-0" aria-label={p.title}>
              <ProductCover product={p} size="sm" className="h-24 w-20" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div>
                <Link to={`/products/${p.slug}`} className="line-clamp-2 font-semibold leading-snug hover:text-violet-400">{p.title}</Link>
                <p className="mt-0.5 text-xs text-muted">{t(`productTypes.${p.product_type}`)} · {p.format} · {p.page_or_item_count}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ProductAction product={p} size="sm" />
                {isOwned(p) && <OwnedBadge />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
