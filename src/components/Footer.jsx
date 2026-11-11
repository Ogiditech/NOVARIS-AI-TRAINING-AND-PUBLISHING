import { Link } from 'react-router-dom';
import { Globe, Phone, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import { offices } from '../data/constants';

export default function Footer() {
  const { t } = useApp();
  const linkCls = 'inline-flex min-h-[40px] items-center text-muted transition hover:text-ink';
  return (
    <footer className="relative z-10 border-t border-line/10 pb-28 lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-10">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted">{t('footer.blurb')}</p>
        </div>
        <div className="space-y-3">
          <p className="label">{t('contact.title')}</p>
          {offices.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted"><span aria-hidden="true">{o.flag}</span> {t(`contact.offices.${o.key}`)}</p>
                <a href={o.tel} className="flex min-h-[36px] items-center gap-1.5 text-sm font-semibold hover:text-violet-400"><Phone size={13} /> {o.phone}</a>
              </div>
              <a href={o.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`${t('contact.whatsapp')} ${t(`contact.offices.${o.key}`)}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366] transition hover:bg-[#25D366]/25">
                <MessageCircle size={17} />
              </a>
            </div>
          ))}
        </div>
        <div className="space-y-4 md:text-right">
          <nav className="flex flex-wrap gap-x-6 gap-y-1 text-sm md:justify-end">
            <Link to="/about" className={linkCls}>{t('footer.about')}</Link>
            <Link to="/products" className={linkCls}>{t('footer.products')}</Link>
            <Link to="/contact" className={linkCls}>{t('footer.contact')}</Link>
            <Link to="/privacy" className={linkCls}>{t('footer.privacy')}</Link>
            <Link to="/terms" className={linkCls}>{t('footer.terms')}</Link>
          </nav>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <Globe size={14} /> {t('footer.worldwide')}
          </p>
          <p className="text-xs text-muted">{t('footer.rights', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
