import { MobileCatalog } from '@/components/mobile/MobileCatalog';
import { liveSessionsConfig } from '@/components/catalog/catalogConfigs';

export default function MobileLiveSessionsPage() {
  return <MobileCatalog config={liveSessionsConfig} />;
}
