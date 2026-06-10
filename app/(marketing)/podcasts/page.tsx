import { CatalogView } from '@/components/catalog/CatalogView';
import { podcastsConfig } from '@/components/catalog/catalogConfigs';
import { siteMeta } from '@/lib/seo';

export const metadata = siteMeta({ title: 'Podcasts', description: 'Listen to the Grow Up More podcast — conversations on careers, technology, and learning.', path: '/podcasts' });

export default function PodcastsPage() {
  return <CatalogView config={podcastsConfig} />;
}
