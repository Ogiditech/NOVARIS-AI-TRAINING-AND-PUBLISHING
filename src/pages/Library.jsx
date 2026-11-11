import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/ui';
import MyLibrary from '../components/MyLibrary';

export default function Library() {
  const { t } = useApp();
  const [params, setParams] = useSearchParams();
  const initial = params.get('tab') || 'courses';
  return (
    <div>
      <SectionHeader eyebrow={t('store.title')} title={t('library.title')} sub={t('library.sub')} />
      <MyLibrary heading={false} initialTab={initial} onTabChange={(k) => setParams(k === 'courses' ? {} : { tab: k }, { replace: true })} />
    </div>
  );
}
