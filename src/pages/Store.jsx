import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Package, Library } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Ebooks from './Ebooks';
import DigitalProducts from './DigitalProducts';

// "Store": eBooks tab (unchanged eBook store) + Digital Products tab.
export default function Store() {
  const { t } = useApp();
  const { pathname } = useLocation();
  const tab = pathname.startsWith('/products') ? 'products' : 'ebooks';
  const tabs = [['/ebooks', 'ebooks', BookOpen, t('store.ebooksTab')], ['/products', 'products', Package, t('store.productsTab')]];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={t('store.tabsLabel')} className="glass inline-flex max-w-full gap-1 !rounded-2xl p-1">
          {tabs.map(([to, key, Icon, label]) => (
            <NavLink key={key} to={to} aria-current={tab === key ? 'page' : undefined} className={`relative flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-semibold transition sm:px-5 ${tab === key ? 'text-white' : 'text-muted hover:text-ink'}`}>
              {tab === key && <motion.span layoutId="store-tab" className="absolute inset-0 rounded-xl bg-brand shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <Icon size={17} className="relative" /><span className="relative">{label}</span>
            </NavLink>
          ))}
        </nav>
        <Link to={tab === 'products' ? '/library?tab=products' : '/library'} className="btn-ghost !py-2.5"><Library size={16} /> {t('store.myLibrary')}</Link>
      </div>
      {/* Keyed fade-in only (no exit step) so leaving the Store never waits on a nested transition. */}
      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {tab === 'ebooks' ? <Ebooks /> : <DigitalProducts />}
      </motion.div>
    </div>
  );
}
