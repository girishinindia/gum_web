import { CatalogView } from '@/components/catalog/CatalogView';
import { blogConfig } from '@/components/catalog/catalogConfigs';
import { siteMeta } from '@/lib/seo';

export const metadata = siteMeta({ title: 'Blog', description: 'Career advice, tutorials, and IT industry insights from the Grow Up More team.', path: '/blog' });

export default function BlogPage() {
  return <CatalogView config={blogConfig} />;
}
