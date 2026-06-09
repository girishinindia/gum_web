import { MobileCatalog } from '@/components/mobile/MobileCatalog';
import { coursesConfig } from '@/components/catalog/catalogConfigs';

export default function MobileCoursesPage() {
  return <MobileCatalog config={coursesConfig} />;
}
