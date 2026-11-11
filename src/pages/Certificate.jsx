import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Linkedin, Link2, ShieldCheck, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { EmptyState } from '../components/ui';
import { ErrorState, Skeleton } from '../components/states';
import CertificateCard from '../components/CertificateCard';

export default function Certificate() {
  const { code } = useParams();
  const { t, toast } = useApp();
  const { data, error, reload } = useApi(`/certificates/${encodeURIComponent(code)}`);

  if (error && !data) return <ErrorState error={error} onRetry={reload} />;
  if (data && !data.certificate) return <EmptyState icon={Award} title={t('certificate.notFound')} action={<Link to="/library?tab=certificates" className="btn-primary mt-2">{t('library.title')}</Link>} />;
  if (!data) return <Skeleton className="mx-auto aspect-[1.414/1] w-full !rounded-[28px]" />;

  const cert = data.certificate;
  const verifyUrl = `${window.location.origin}/verify/${cert.certificate_code}`;
  const issued = new Date(cert.issued_at);
  const linkedIn = `https://www.linkedin.com/profile/add?${new URLSearchParams({
    startTask: 'CERTIFICATION_NAME', name: cert.course_title, organizationName: 'Novaris AI Training & Publishing',
    issueYear: String(issued.getFullYear()), issueMonth: String(issued.getMonth() + 1), certUrl: verifyUrl, certId: cert.certificate_code,
  })}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      toast(t('certificate.linkCopied'));
    } catch {
      toast(verifyUrl, 'info');
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link to="/library?tab=certificates" className="inline-flex min-h-[40px] items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> {t('library.title')}</Link>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="btn-primary !py-2.5"><Download size={17} /> {t('certificate.download')}</button>
          <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="btn !py-2.5 bg-[#0a66c2] text-white hover:-translate-y-0.5 hover:brightness-110"><Linkedin size={17} /> {t('certificate.linkedin')}</a>
          <button onClick={copy} className="btn-ghost !py-2.5"><Link2 size={17} /> {t('certificate.copyLink')}</button>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 24, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ perspective: 1200 }}>
        <CertificateCard cert={cert} verifyUrl={verifyUrl} />
      </motion.div>
      <p className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-muted">
        <ShieldCheck size={16} className="text-emerald-400" /> {t('certificate.publicNote')} <Link to={`/verify/${cert.certificate_code}`} className="font-semibold text-violet-400 hover:text-violet-300">/verify/{cert.certificate_code}</Link>
      </p>
    </div>
  );
}
