import { CatalogView } from '@/components/catalog/CatalogView';
import { liveSessionsConfig } from '@/components/catalog/catalogConfigs';
import { siteMeta } from '@/lib/seo';

export const metadata = siteMeta({ title: 'Live Sessions', description: 'Join upcoming live sessions on Grow Up More — interactive, expert-led learning in real time.', path: '/live-sessions' });

export default function LiveSessionsPage() {
  return <CatalogView config={liveSessionsConfig} />;
}
