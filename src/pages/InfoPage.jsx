import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function InfoPage({ page }) {
  const { t } = useApp();
  return (
    <article className="glass mx-auto max-w-3xl p-6 sm:p-10">
      <Link to="/" className="mb-6 inline-flex min-h-[40px] items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> {t('info.back')}</Link>
      <h1 className="text-3xl font-bold sm:text-4xl">{t(`info.${page}.title`)}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-ink/90">
        {t(`info.${page}.body`).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </article>
  );
}
