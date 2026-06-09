import { MobileCatalog } from '@/components/mobile/MobileCatalog';
import { batchesConfig } from '@/components/catalog/catalogConfigs';

export default function MobileBatchesPage() {
  return <MobileCatalog config={batchesConfig} />;
}
