import { CatalogView } from '@/components/catalog/CatalogView';
import { webinarsConfig } from '@/components/catalog/catalogConfigs';
import { siteMeta } from '@/lib/seo';

export const metadata = siteMeta({ title: 'Webinars', description: 'Register for free and premium webinars on Grow Up More — learn in-demand IT skills live from experts.', path: '/webinars' });

export default function WebinarsPage() {
  return <CatalogView config={webinarsConfig} />;
}
