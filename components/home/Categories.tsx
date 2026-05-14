import { api, sortSubCategoriesByEnglish } from '@/lib/api';
import { CategoriesGrid } from './CategoriesGrid';

/**
 * Server wrapper for the home-page "Explore Our Course Categories" section.
 *
 * Fetches the canonical English-ordered list of sub-categories at request
 * time so first paint always ships with tiles already in the HTML. The
 * actual rendering — including the heading copy and the per-language
 * translation overlay — lives in the `CategoriesGrid` client component
 * so the user can switch language without a full page reload.
 *
 * Same pattern the mobile portal uses (`MobileCategoriesGrid`) and the
 * desktop mega-menu (`CoursesMegaMenu`), keeping the language-switch logic
 * consistent across every surface that shows category names.
 */
export async function Categories() {
  const live = await api.subCategories();
  const items = sortSubCategoriesByEnglish(live ?? []).slice(0, 12);
  if (items.length === 0) return null;
  return <CategoriesGrid initialCategories={items} />;
}
