import { CatalogView } from '@/components/catalog/CatalogView';
import { bundlesConfig } from '@/components/catalog/catalogConfigs';
import { siteMeta } from '@/lib/seo';

export const metadata = siteMeta({ title: 'Course Bundles', description: 'Save more with curated course bundles on Grow Up More — job-ready skill paths at a bundled price.', path: '/bundles' });

export default function BundlesPage() {
  return <CatalogView config={bundlesConfig} />;
}
