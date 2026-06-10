import { CatalogView } from '@/components/catalog/CatalogView';
import { batchesConfig } from '@/components/catalog/catalogConfigs';
import { siteMeta } from '@/lib/seo';

export const metadata = siteMeta({ title: 'Live Batches', description: 'Join instructor-led live batches on Grow Up More — scheduled cohorts with mentorship and placement support.', path: '/batches' });

export default function BatchesPage() {
  return <CatalogView config={batchesConfig} />;
}
