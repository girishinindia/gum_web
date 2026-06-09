import { CatalogView } from '@/components/catalog/CatalogView';
import { bundlesConfig } from '@/components/catalog/catalogConfigs';

export default function BundlesPage() {
  return <CatalogView config={bundlesConfig} />;
}
