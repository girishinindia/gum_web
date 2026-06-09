import { CatalogView } from '@/components/catalog/CatalogView';
import { coursesConfig } from '@/components/catalog/catalogConfigs';

/**
 * The unified catalog. The full filtering/listing UI now lives in the shared
 * <CatalogView/> component (so every content-type page can reuse it); this
 * route just supplies the courses configuration.
 */
export default function CoursesPage() {
  return <CatalogView config={coursesConfig} />;
}
