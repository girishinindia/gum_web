import { CatalogView } from '@/components/catalog/CatalogView';
import { instructorsConfig } from '@/components/catalog/catalogConfigs';

export default function InstructorsPage() {
  return <CatalogView config={instructorsConfig} />;
}
