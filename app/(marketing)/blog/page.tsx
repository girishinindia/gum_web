import { CatalogView } from '@/components/catalog/CatalogView';
import { blogConfig } from '@/components/catalog/catalogConfigs';

export default function BlogPage() {
  return <CatalogView config={blogConfig} />;
}
