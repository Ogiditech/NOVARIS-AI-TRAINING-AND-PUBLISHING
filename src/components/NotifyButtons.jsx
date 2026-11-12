import { Bell, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { notifyLinks, NOTIFY } from '../data/originals';

// "Notify me" opens WhatsApp with a prefilled message; the email link is the fallback.
export default function NotifyButtons({ book, className = '' }) {
  const { t } = useApp();
  const links = notifyLinks(book);
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-[#05301a] hover:brightness-105 hover:-translate-y-0.5" data-notify="whatsapp">
        <Bell size={16} /> {t('originals.notify')}
      </a>
      <a href={links.email} className="btn-ghost" data-notify="email" title={NOTIFY.email}>
        <Mail size={16} /> {t('originals.notifyEmail')}
      </a>
    </div>
  );
}
