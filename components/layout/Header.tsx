import { api, sortSubCategoriesByEnglish } from '@/lib/api';
import { HeaderShell } from './HeaderShell';

/**
 * Server component — fetches sub-categories for the Courses mega-menu and
 * passes them to the client shell.
 *
 * Languages live in the parent <LanguageProvider> (set up in the marketing
 * layout), so the Header no longer needs to fetch them — it just consumes
 * the active language via the `useT()` / `useLanguage()` hooks in the shell.
 */
export async function Header() {
  const liveCats = await api.subCategories();
  return <HeaderShell categories={sortSubCategoriesByEnglish(liveCats ?? [])} />;
}
