import { Download, Gift, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useProductActions from '../hooks/useProductActions';

// The single main button for a product: Get it free / Buy now / Download.
export default function ProductAction({ product, className = '', size = 'md' }) {
  const { t } = useApp();
  const { isOwned, getProduct, download } = useProductActions();
  const owned = isOwned(product);
  const pad = size === 'sm' ? '!px-3 !py-2.5 text-xs' : '';
  const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };

  if (owned) {
    return (
      <button onClick={stop(() => download(product))} className={`btn border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:-translate-y-0.5 hover:bg-emerald-500/25 ${pad} ${className}`}>
        <Download size={size === 'sm' ? 15 : 18} /> {t('products.download')}
      </button>
    );
  }
  const free = product.price_usd === 0;
  return (
    <button onClick={stop(() => getProduct(product))} className={`btn-primary ${pad} ${className}`}>
      {free ? <Gift size={size === 'sm' ? 15 : 18} /> : <ShoppingBag size={size === 'sm' ? 15 : 18} />}
      {free ? t('products.getFree') : t('products.buyNow')}
    </button>
  );
}
