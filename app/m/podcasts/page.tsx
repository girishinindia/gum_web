import { MobileCatalog } from '@/components/mobile/MobileCatalog';
import { podcastsConfig } from '@/components/catalog/catalogConfigs';

export default function MobilePodcastsPage() {
  return <MobileCatalog config={podcastsConfig} />;
}
