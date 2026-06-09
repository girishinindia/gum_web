import { MobileCatalog } from '@/components/mobile/MobileCatalog';
import { instructorsConfig } from '@/components/catalog/catalogConfigs';

export default function MobileInstructorsPage() {
  return <MobileCatalog config={instructorsConfig} />;
}
