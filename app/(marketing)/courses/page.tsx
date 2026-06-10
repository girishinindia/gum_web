import { CatalogView } from '@/components/catalog/CatalogView';
import { coursesConfig } from '@/components/catalog/catalogConfigs';
import { siteMeta } from '@/lib/seo';

export const metadata = siteMeta({ title: 'Courses', description: 'Browse job-oriented, multilingual IT courses on Grow Up More — with placement assistance and verified certificates.', path: '/courses' });

/**
 * The unified catalog. The full filtering/listing UI now lives in the shared
 * <CatalogView/> component (so every content-type page can reuse it); this
 * route just supplies the courses configuration.
 */
export default function CoursesPage() {
  return <CatalogView config={coursesConfig} />;
}
