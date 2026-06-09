import { MobileCatalog } from '@/components/mobile/MobileCatalog';
import { blogConfig } from '@/components/catalog/catalogConfigs';

export default function MobileBlogPage() {
  return <MobileCatalog config={blogConfig} />;
}
