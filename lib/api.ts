/**
 * Thin, typed wrapper around the gum_api REST endpoints.
 * Server-side fetch (Next.js will cache by default per the `next.revalidate`).
 *
 * Used in app/page.tsx and section components that need live data.
 */

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1').replace(/\/+$/, '');

interface ApiResponse<T> {
  success: boolean;
  data?:   T;
  error?:  string;
  pagination?: { total: number; totalPages: number; page: number };
}

async function request<T>(path: string, opts: { revalidate?: number } = {}): Promise<T | null> {
  const revalidate = opts.revalidate ?? 60; // default: re-fetch every 60s
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<T>;
    return json.success ? (json.data ?? null) : null;
  } catch {
    return null;
  }
}

// ─── Types (kept minimal — only fields the home page reads) ─────────────

export interface Course {
  id:               number;
  code:             string;
  slug:             string;
  name:             string;
  short_description?: string | null;
  trailer_thumbnail_url?: string | null;
  price?:           number | null;
  original_price?:  number | null;
  is_free?:         boolean;
  rating_average?:  number | null;
  rating_count?:    number | null;
  total_lessons?:   number | null;
  difficulty_level?: string | null;
  course_status?:   string | null;
  is_featured?:     boolean;
}

export interface SubCategory {
  id:            number;
  slug:          string;
  code?:         string | null;
  /**
   * Display name — gum_api joins it from `sub_category_translations` (English row)
   * and returns it as `english_name`. The base sub_categories table itself
   * carries no name column.
   */
  english_name?: string | null;
  image_url?:    string | null;
  category_id?:  number;
  categories?:   { code?: string; slug?: string } | null;
  display_order?: number;
  is_new?:       boolean;
  course_count?: number;
}

/** Human-readable display name from a SubCategory row, with sane fallbacks. */
export function subCategoryName(c: SubCategory): string {
  return (c.english_name && c.english_name.trim())
      || (c.code && c.code.trim())
      || (c.slug ? c.slug.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ') : '')
      || 'Untitled';
}

/**
 * Sort key — the English display name, lower-cased for case-insensitive sort.
 * Falls back to code → slug so rows without a translation still order sensibly.
 */
export function subCategorySortKey(c: SubCategory): string {
  return (c.english_name || c.code || c.slug || '').toLowerCase();
}

/** Stable alphabetical sort of sub-categories by English name. */
export function sortSubCategoriesByEnglish<T extends SubCategory>(items: T[]): T[] {
  return [...items].sort((a, b) => subCategorySortKey(a).localeCompare(subCategorySortKey(b)));
}

export interface Faq {
  id:       number;
  question: string;
  answer:   string;
  display_order?: number;
}

export interface Language {
  id:           number;
  name:         string;
  iso_code:     string;
  native_name?: string | null;
  is_active:    boolean;
  for_material?: boolean;
}

// ─── Endpoint helpers ────────────────────────────────────────────────────

// ─── Client-side fetcher for the mega-menu language switch ───────────────
//
// gum_api exposes `/sub-category-translations?language_id=X&is_active=true`
// which returns rows shaped as:
//   { id, sub_category_id, language_id, name, description,
//     sub_categories: { code, slug, image, category_id, categories: {...} },
//     languages: { name, native_name, iso_code } }
//
// We flatten those into the `SubCategory` shape the mega-menu already renders.
export async function fetchSubCategoriesForLanguage(languageId: number): Promise<SubCategory[]> {
  const url = `${BASE}/sub-category-translations?language_id=${encodeURIComponent(languageId)}&is_active=true&limit=200&sort=name&order=asc`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as { success: boolean; data?: any[] };
    if (!json.success || !Array.isArray(json.data)) return [];
    return json.data.map((t: any) => ({
      id:            t.sub_category_id,
      slug:          t.sub_categories?.slug || '',
      code:          t.sub_categories?.code  || null,
      english_name:  t.name || null,            // re-use the same display field
      image_url:     t.sub_categories?.image  || null,
      category_id:   t.sub_categories?.category_id,
      categories:    t.sub_categories?.categories || null,
    }));
  } catch {
    return [];
  }
}

// ─── Announcements — recent count for the nav badge ──────────────────────
//
// The gum_api list endpoint doesn't have a `created_after` filter today, so
// we pull the most recent 50 published announcements (sorted desc by
// `created_at`) and count rows that fall inside the requested window.
export interface AnnouncementRow {
  id: number;
  title?: string;
  status?: string;
  created_at?: string;
}

export async function recentAnnouncementsCount(days = 7): Promise<number> {
  const url = `${BASE}/announcements?status=published&limit=50&sort=created_at&order=desc`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return 0;
    const json = (await res.json()) as { success: boolean; data?: AnnouncementRow[] };
    if (!json.success || !Array.isArray(json.data)) return 0;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return json.data.filter((a) => a.created_at && new Date(a.created_at).getTime() >= cutoff).length;
  } catch {
    return 0;
  }
}

export const api = {
  featuredCourses: () =>
    request<Course[]>('/courses?is_featured=true&limit=9&sort=display_order&order=asc'),
  subCategories: () =>
    request<SubCategory[]>('/sub-categories?is_active=true&limit=100&sort=display_order&order=asc'),
  faqs: () =>
    request<Faq[]>('/faqs?is_active=true&limit=12&sort=display_order&order=asc'),
  languages: () =>
    request<Language[]>('/languages?is_active=true&limit=50'),
  /** Languages enabled for material/site UI (header switcher, banners). */
  materialLanguages: () =>
    request<Language[]>('/languages?is_active=true&for_material=true&limit=50'),
};
