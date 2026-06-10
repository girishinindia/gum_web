import { CatalogView } from '@/components/catalog/CatalogView';
import { instructorsConfig } from '@/components/catalog/catalogConfigs';
import { siteMeta } from '@/lib/seo';

export const metadata = siteMeta({ title: 'Instructors', description: 'Meet the expert instructors teaching on Grow Up More — industry practitioners and mentors.', path: '/instructors' });

export default function InstructorsPage() {
  return <CatalogView config={instructorsConfig} />;
}
