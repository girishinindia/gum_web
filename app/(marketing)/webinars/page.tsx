import { CatalogView } from '@/components/catalog/CatalogView';
import { webinarsConfig } from '@/components/catalog/catalogConfigs';

export default function WebinarsPage() {
  return <CatalogView config={webinarsConfig} />;
}
