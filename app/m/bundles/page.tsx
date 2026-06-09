import { MobileCatalog } from '@/components/mobile/MobileCatalog';
import { bundlesConfig } from '@/components/catalog/catalogConfigs';

export default function MobileBundlesPage() {
  return <MobileCatalog config={bundlesConfig} />;
}
