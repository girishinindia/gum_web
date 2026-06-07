/**
 * Thin, typed wrapper around the gum_api REST endpoints.
 * Server-side fetch (Next.js will cache by default per the `next.revalidate`).
 *
 * Used in app/page.tsx and section components that need live data.
 */

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1').replace(/\/+$/, '');

/**
 * Resolve the API base URL for the current call site.
 *
 * Server-side (SSR / RSC) → returns BASE as-is. `localhost` correctly
 * refers to the host running the Next.js process, which is where the API
 * is normally co-deployed in dev.
 *
 * Client-side (browser) → if BASE points at `localhost`/`127.0.0.1` but
 * the page itself was loaded from a different host (LAN IP, another dev's
 * machine, a tunnel), rewrite `localhost` to the page's actual hostname
 * so the browser doesn't try to hit its own loopback address (which would
 * return nothing on a teammate's box).
 *
 * Why this matters: when multiple developers test over the same Wi-Fi
 * with one machine hosting the API and others opening the site over LAN,
 * client-side requests to `http://localhost:5001/...` would silently fail
 * on every non-host machine — producing empty mega-menus, missing
 * language switchers, blank categories, etc.
 */
export function apiBase(): string {
  if (typeof window === 'undefined') return BASE;
  const swapped = BASE.replace(
    /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/i,
    `$1${window.location.hostname}`,
  );
  if (process.env.NODE_ENV !== 'production' && swapped !== BASE) {
    // eslint-disable-next-line no-console
    console.info(`[api] rewriting BASE host → ${window.location.hostname} for client fetches`);
  }
  return swapped;
}

interface ApiResponse<T> {
  success: boolean;
  data?:   T;
  error?:  string;
  pagination?: { total: number; totalPages: number; page: number };
}

async function request<T>(path: string, opts: { revalidate?: number } = {}): Promise<T | null> {
  const revalidate = opts.revalidate ?? 60; // default: re-fetch every 60s
  try {
    // Use `apiBase()` so client-side calls automatically swap localhost
    // for the page hostname when the user is on a different machine than
    // the API host. Server-side calls still use the unmodified BASE.
    const res = await fetch(`${apiBase()}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<T>;
    return json.success ? (json.data ?? null) : null;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`[api] fetch failed for ${path}:`, err);
    }
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

// ─── Home-page section types ────────────────────────────────────────────

export interface Webinar {
  id:                number;
  title:             string;
  code?:             string;
  scheduled_at?:     string | null;
  duration_minutes?: number | null;
  is_free?:          boolean;
  is_active?:        boolean;
  webinar_status?:   string | null;
  thumbnail_url?:    string | null;
  meeting_link?:     string | null;
  instructor_id?:    string | null;
  course_id?:        number | null;
  /** FK join */
  courses?:          { name: string; slug: string } | null;
  /** FK join */
  users?:            { id: string; full_name: string; email: string } | null;
}

export interface Bundle {
  id:                number;
  code?:             string;
  slug:              string;
  name:              string;
  description?:      string | null;
  price?:            number | null;
  original_price?:   number | null;
  discount_percent?: number | null;
  thumbnail_url?:    string | null;
  is_active?:        boolean;
  is_featured?:      boolean;
  instructor_id?:    string | null;
  /** Enriched by controller */
  instructor_name?:  string | null;
  translation_count?: number;
  course_count?:     number | null;
  student_count?:    number | null;
  rating_average?:   number | null;
}

export interface InstructorProfile {
  id:                number;
  user_id:           string;
  instructor_code?:  string | null;
  instructor_type?:  string | null;
  approval_status?:  string | null;
  is_verified?:      boolean;
  is_featured?:      boolean;
  is_active?:        boolean;
  course_count?:     number | null;
  student_count?:    number | null;
  rating_average?:   number | null;
  /** FK join — from public featured endpoint */
  users?:            { id: string; full_name: string; avatar_url?: string | null; email?: string } | null;
}

export interface BlogPost {
  id:                  number;
  title:               string;
  slug:                string;
  excerpt?:            string | null;
  featured_image_url?: string | null;
  status?:             string | null;
  published_at?:       string | null;
  reading_time_min?:   number | null;
  author_id?:          string | null;
  category_id?:        number | null;
  is_featured?:        boolean;
  /** FK join */
  blog_categories?:    { id: number; name: string } | null;
  /** FK join */
  users?:              { id: string; first_name: string; last_name: string; email: string } | null;
}

export interface Podcast {
  id:                number;
  title:             string;
  slug?:             string | null;
  short_summary?:    string | null;
  description?:      string | null;
  thumbnail_url?:    string | null;
  duration?:         number | null;
  episode_number?:   number | null;
  season_number?:    number | null;
  status?:           string | null;
  is_featured?:      boolean;
  published_at?:     string | null;
  posted_by?:        string | null;
  category_id?:      number | null;
  sub_category_id?:  number | null;
  /** FK join */
  users?:            { id: string; first_name: string; last_name: string; email: string; avatar_url?: string | null } | null;
  /** FK join */
  categories?:       { id: number; name: string; slug: string } | null;
  /** FK join */
  sub_categories?:   { id: number; name: string; slug: string; category_id: number } | null;
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
  // Use the shared `apiBase()` helper so this client-side fetch hits the
  // right host even when the page is being loaded from a teammate's
  // machine over the LAN (it auto-rewrites `localhost` → page hostname).
  const url = `${apiBase()}/sub-category-translations?language_id=${encodeURIComponent(languageId)}&is_active=true&limit=200&sort=name&order=asc`;
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
  // Same `apiBase()` helper as the other fetches — keeps multi-machine
  // LAN testing working without needing per-developer env overrides.
  const url = `${apiBase()}/announcements?status=published&limit=50&sort=created_at&order=desc`;
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

  // ─── Home-page section endpoints ────────────────────────────────────────

  /** Active webinars, newest first (for "Upcoming Webinars" section). */
  upcomingWebinars: (limit = 4) =>
    request<Webinar[]>(`/webinars?is_active=true&limit=${limit}&sort=scheduled_at&order=asc`, { revalidate: 300 }),

  /** Featured bundles (for "Bundles & Savings" section). */
  featuredBundles: (limit = 3) =>
    request<Bundle[]>(`/bundles?is_active=true&is_featured=true&limit=${limit}&sort=display_order&order=asc`, { revalidate: 300 }),

  /** Featured, verified instructors — public endpoint (for "Meet the Instructors" section). */
  featuredInstructors: (limit = 6) =>
    request<InstructorProfile[]>(`/instructor-profiles/public?is_featured=true&is_active=true&limit=${limit}`, { revalidate: 300 }),

  /** Published blog posts, newest first (for "Latest from the Blog" section). */
  latestBlogPosts: (limit = 3) =>
    request<BlogPost[]>(`/blog-posts?status=published&is_active=true&limit=${limit}&sort=published_at&order=desc`, { revalidate: 300 }),

  /** Published podcasts, newest first (for "Podcasts" section). */
  latestPodcasts: (limit = 4) =>
    request<Podcast[]>(`/podcasts?status=published&limit=${limit}&sort=published_at&order=desc`, { revalidate: 300 }),

  /** All published podcasts for listing page (with optional category filter). */
  podcastsList: (opts?: { categoryId?: number; limit?: number }) => {
    const limit = opts?.limit ?? 20;
    let qs = `/podcasts?status=published&limit=${limit}&sort=published_at&order=desc`;
    if (opts?.categoryId) qs += `&category_id=${opts.categoryId}`;
    return request<Podcast[]>(qs, { revalidate: 300 });
  },

  /** Single podcast by ID. */
  podcastById: (id: string) =>
    request<Podcast>(`/podcasts/${id}`, { revalidate: 300 }),
};
