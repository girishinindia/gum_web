import { CatalogView } from '@/components/catalog/CatalogView';
import { podcastsConfig } from '@/components/catalog/catalogConfigs';

export default function PodcastsPage() {
  return <CatalogView config={podcastsConfig} />;
}
