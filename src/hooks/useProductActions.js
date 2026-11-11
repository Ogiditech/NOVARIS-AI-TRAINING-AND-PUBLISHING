import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import useRequireLogin from './useRequireLogin';
import { api } from '../lib/api';
import { celebrate } from '../lib/celebrate';

function saveTextFile(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Shared get / buy / download behaviour for digital products.
export default function useProductActions() {
  const { t, toast, acquired, markAcquired, setCheckout, currency } = useApp();
  const requireLogin = useRequireLogin();

  const isOwned = useCallback((product) => Boolean(product.owned) || acquired.products.includes(Number(product.id)), [acquired.products]);

  // Free → saved instantly. Paid → demo checkout modal. Logged out → login, then back here.
  const getProduct = useCallback((product) => requireLogin(async () => {
    if (isOwned(product)) return;
    if (Number(product.price_usd) > 0) {
      setCheckout({ kind: 'product', item: product });
      return;
    }
    try {
      const data = await api('/products/purchase', { method: 'POST', body: { id: product.id, currency: currency.code } });
      markAcquired('products', data.productIds);
      celebrate();
      toast(t('products.added'));
    } catch (err) {
      toast(err.message, 'error');
    }
  }, { message: t('products.loginToGet') }), [requireLogin, isOwned, setCheckout, currency.code, markAcquired, toast, t]);

  const download = useCallback(async (product) => {
    try {
      const full = product.whats_included ? product : (await api(`/products/${product.slug}`)).product;
      // NOTE: real product files will be connected here later (e.g. a signed download URL from the API).
      // For now a small Markdown file is generated so the Download button works end to end.
      const lines = [
        `# ${full.title}`, `_${full.subtitle}_`, '',
        t('products.file.meta', { type: t(`productTypes.${full.product_type}`), format: full.format, items: full.page_or_item_count, category: full.category }), '',
        full.description, '',
        `## ${full.product_type === 'Bundle' ? t('products.file.bundleContents') : t('products.file.included')}`,
        ...full.whats_included.map((x) => `- ${x}`), '',
        `## ${t('products.file.preview')}`,
        ...full.preview_items.flatMap((p, i) => [`### ${i + 1}. ${p.title}`, p.text, '']),
        '---', t('products.file.footer'), '',
      ];
      saveTextFile(`${full.slug}.md`, lines.join('\n'));
      toast(t('products.downloading', { title: full.title }), 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  }, [t, toast]);

  return { isOwned, getProduct, download };
}
