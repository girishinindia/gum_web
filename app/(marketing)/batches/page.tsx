import { CatalogView } from '@/components/catalog/CatalogView';
import { batchesConfig } from '@/components/catalog/catalogConfigs';

export default function BatchesPage() {
  return <CatalogView config={batchesConfig} />;
}
