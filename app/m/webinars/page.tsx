import { MobileCatalog } from '@/components/mobile/MobileCatalog';
import { webinarsConfig } from '@/components/catalog/catalogConfigs';

export default function MobileWebinarsPage() {
  return <MobileCatalog config={webinarsConfig} />;
}
