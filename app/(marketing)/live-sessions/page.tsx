import { CatalogView } from '@/components/catalog/CatalogView';
import { liveSessionsConfig } from '@/components/catalog/catalogConfigs';

export default function LiveSessionsPage() {
  return <CatalogView config={liveSessionsConfig} />;
}
