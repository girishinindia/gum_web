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
  total_assignments?: number | null;
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
  translated_title?: string | null;
  translated_description?: string | null;
  translated_thumbnail?: string | null;
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

  // ─── Section visibility (public, no auth) ──────────────────────────────

  /** Visibility map: { courses: true, blogs: false, … }
   *  Short revalidation (30s) so admin toggles reflect quickly on the frontend. */
  sectionVisibility: () =>
    request<Record<string, boolean>>('/site-settings/sections', { revalidate: 30 }),

  // ─── Filter-page helpers (categories, languages for dropdowns) ────────

  /** Active categories for filter dropdowns. */
  categories: () =>
    request<Category[]>('/categories?is_active=true&limit=100&sort=display_order&order=asc', { revalidate: 300 }),

  /** Active languages for filter dropdowns. */
  allLanguages: () =>
    request<Language[]>('/languages?is_active=true&limit=50&sort=name&order=asc', { revalidate: 300 }),

  /** S9: Languages that have at least one published course (for course filter dropdown). */
  courseLanguages: () =>
    request<Language[]>('/courses/languages', { revalidate: 300 }),
};

// ─── Paginated response type ──────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
}

/**
 * Client-side fetch that returns data + pagination (no ISR cache).
 * Used by "use client" filter pages that need dynamic data.
 */
async function clientFetch<T>(path: string): Promise<PaginatedResult<T>> {
  const empty: PaginatedResult<T> = { data: [], total: 0, totalPages: 0, page: 1 };
  try {
    const res = await fetch(`${apiBase()}${path}`);
    if (!res.ok) return empty;
    const json = (await res.json()) as ApiResponse<T[]>;
    if (!json.success) return empty;
    return {
      data: json.data ?? [],
      total: json.pagination?.total ?? 0,
      totalPages: json.pagination?.totalPages ?? 0,
      page: json.pagination?.page ?? 1,
    };
  } catch {
    return empty;
  }
}

// ─── Course filter params ──────────────────────────────────────────────────

export interface CourseFilterParams {
  search?: string;
  /** Single value or comma-separated list (e.g. "beginner,intermediate") */
  difficulty_level?: string;
  is_free?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new?: boolean;
  has_certificate?: boolean;
  /** Single ID or comma-separated list (e.g. "1,3,5") — S9 multi-value support */
  course_language_id?: number | string;
  instructor_id?: number;
  /** Single ID or comma-separated list (e.g. "3,7,12") */
  category_id?: number | string;
  /** Single ID or comma-separated list (e.g. "5,9") */
  sub_category_id?: number | string;
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  /** Language ID for translated title + description enrichment */
  language_id?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/** Enriched course row returned by the list endpoint. */
export interface CourseListItem extends Course {
  english_title?: string | null;
  translated_title?: string | null;
  translated_description?: string | null;
  translated_thumbnail?: string | null;
  instructor_name?: string | null;
  language_name?: string | null;
  category_name?: string | null;
  sub_category_name?: string | null;
  category_id?: number | null;
  sub_category_id?: number | null;
  is_bestseller?: boolean;
  is_new?: boolean;
  has_certificate?: boolean;
}

export interface Category {
  id: number;
  /** Direct column on the categories table (may be null). */
  name?: string | null;
  slug: string;
  code?: string | null;
  /** Enriched by the API from category_translations (English row). */
  english_name?: string | null;
  image?: string | null;
  is_active?: boolean;
  display_order?: number;
  course_count?: number;
}

/** Human-readable display name for a Category row, with sane fallbacks. */
export function categoryName(c: Category): string {
  return (c.english_name && c.english_name.trim())
      || (c.name && c.name.trim())
      || (c.code && c.code.trim())
      || (c.slug ? c.slug.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ') : '')
      || 'Untitled';
}

/**
 * Fetch courses with filters + pagination (client-side, no ISR).
 * Used by the /courses filter page.
 */
export function fetchCoursesList(params: CourseFilterParams = {}): Promise<PaginatedResult<CourseListItem>> {
  const p = new URLSearchParams();
  // Always show only active, published, non-deleted courses on the public page
  p.set('is_active', 'true');
  p.set('course_status', 'published');
  if (params.search)           p.set('search', params.search);
  if (params.difficulty_level) p.set('difficulty_level', params.difficulty_level);
  if (params.is_free)          p.set('is_free', 'true');
  if (params.is_featured)      p.set('is_featured', 'true');
  if (params.is_bestseller)    p.set('is_bestseller', 'true');
  if (params.is_new)           p.set('is_new', 'true');
  if (params.has_certificate)  p.set('has_certificate', 'true');
  if (params.course_language_id) p.set('course_language_id', String(params.course_language_id));
  if (params.instructor_id)   p.set('instructor_id', String(params.instructor_id));
  if (params.category_id)     p.set('category_id', String(params.category_id));
  if (params.sub_category_id) p.set('sub_category_id', String(params.sub_category_id));
  if (params.price_min != null) p.set('price_min', String(params.price_min));
  if (params.price_max != null) p.set('price_max', String(params.price_max));
  if (params.rating_min != null) p.set('rating_min', String(params.rating_min));
  if (params.language_id)       p.set('language_id', String(params.language_id));
  p.set('sort', params.sort || 'id');
  p.set('order', params.order || 'desc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 12));
  return clientFetch<CourseListItem>(`/courses?${p.toString()}`);
}

// ─── Bundle filter params ─────────────────────────────────────────────────

export interface BundleFilterParams {
  search?: string;
  is_featured?: boolean;
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  is_free?: boolean;
  /** Language ID for translated title + description enrichment */
  language_id?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/** Enriched bundle row returned by the list endpoint. */
export interface BundleListItem extends Bundle {
  translated_title?: string | null;
  translated_description?: string | null;
  translated_thumbnail?: string | null;
}

/**
 * Fetch bundles with filters + pagination (client-side, no ISR).
 * Used by the /bundles filter page.
 */
export function fetchBundlesList(params: BundleFilterParams = {}): Promise<PaginatedResult<BundleListItem>> {
  const p = new URLSearchParams();
  p.set('is_active', 'true');
  if (params.search)       p.set('search', params.search);
  if (params.is_featured)  p.set('is_featured', 'true');
  if (params.is_free)      p.set('is_free', 'true');
  if (params.price_min != null) p.set('price_min', String(params.price_min));
  if (params.price_max != null) p.set('price_max', String(params.price_max));
  if (params.rating_min != null) p.set('rating_min', String(params.rating_min));
  if (params.language_id)       p.set('language_id', String(params.language_id));
  p.set('sort', params.sort || 'id');
  p.set('order', params.order || 'desc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 12));
  return clientFetch<BundleListItem>(`/bundles?${p.toString()}`);
}

// ─── Instructor filter params ─────────────────────────────────────────────

export interface InstructorFilterParams {
  search?: string;
  instructor_type?: string;
  is_featured?: boolean;
  is_verified?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Fetch public instructors with filters + pagination (client-side, no ISR).
 * Used by the /instructors filter page.
 */
export function fetchInstructorsList(params: InstructorFilterParams = {}): Promise<PaginatedResult<InstructorProfile>> {
  const p = new URLSearchParams();
  if (params.search)          p.set('search', params.search);
  if (params.instructor_type) p.set('instructor_type', params.instructor_type);
  if (params.is_featured)     p.set('is_featured', 'true');
  if (params.is_verified)     p.set('is_verified', 'true');
  p.set('sort', params.sort || 'created_at');
  p.set('order', params.order || 'desc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 18));
  return clientFetch<InstructorProfile>(`/instructor-profiles/public?${p.toString()}`);
}

// ─── Blog filter params ───────────────────────────────────────────────────

export interface BlogCategory {
  id: number;
  name: string;
  slug?: string;
  is_active?: boolean;
}

export interface BlogFilterParams {
  search?: string;
  category_id?: number;
  is_featured?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Fetch published blog posts with filters + pagination (client-side).
 * Used by the /blog filter page.
 */
export function fetchBlogList(params: BlogFilterParams = {}): Promise<PaginatedResult<BlogPost>> {
  const p = new URLSearchParams();
  p.set('status', 'published');
  p.set('is_active', 'true');
  if (params.search)       p.set('search', params.search);
  if (params.category_id)  p.set('category_id', String(params.category_id));
  if (params.is_featured)  p.set('is_featured', 'true');
  p.set('sort', params.sort || 'published_at');
  p.set('order', params.order || 'desc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 12));
  return clientFetch<BlogPost>(`/blog-posts?${p.toString()}`);
}

/** Blog categories for filter dropdowns. */
export function fetchBlogCategories(): Promise<BlogCategory[] | null> {
  return request<BlogCategory[]>('/blog-categories?is_active=true&limit=100&sort=name&order=asc', { revalidate: 300 });
}

// ─── Podcast filter params ────────────────────────────────────────────────

export interface PodcastFilterParams {
  search?: string;
  category_id?: number;
  is_featured?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Fetch published podcasts with filters + pagination (client-side).
 * Used by the /podcasts filter page.
 */
export function fetchPodcastList(params: PodcastFilterParams = {}): Promise<PaginatedResult<Podcast>> {
  const p = new URLSearchParams();
  // Public endpoint already filters to published + coming_soon
  if (params.search)       p.set('search', params.search);
  if (params.category_id)  p.set('category_id', String(params.category_id));
  if (params.is_featured)  p.set('is_featured', 'true');
  p.set('sort', params.sort || 'published_at');
  p.set('order', params.order || 'desc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 12));
  return clientFetch<Podcast>(`/podcasts?${p.toString()}`);
}

// ─── Course-batch types + fetch ─────────────────────────────────────────

export interface CourseBatch {
  id:                  number;
  title?:              string | null;
  code?:               string | null;
  batch_status?:       string | null;
  batch_owner?:        string | null;
  course_id?:          number | null;
  instructor_id?:      number | null;
  price?:              number | null;
  is_free?:            boolean;
  is_active?:          boolean;
  max_students?:       number | null;
  enrolled_count?:     number | null;
  start_date?:         string | null;
  end_date?:           string | null;
  schedule?:           any;
  rating_average?:     number | null;
  translated_title?: string | null;
  translated_description?: string | null;
  translated_thumbnail?: string | null;
  /** FK join */
  courses?:            { id: number; name: string; slug: string; code?: string; course_status?: string; difficulty_level?: string; price?: number; original_price?: number; is_free?: boolean; trailer_thumbnail_url?: string | null } | null;
  /** FK join */
  users?:              { id: string; full_name: string; email: string } | null;
}

export interface BatchFilterParams {
  search?: string;
  course_id?: number;
  batch_status?: string;
  instructor_id?: number;
  is_active?: boolean;
  is_free?: boolean;
  /** Language ID for translated title + description enrichment */
  language_id?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Fetch course batches with filters + pagination (client-side).
 * Used by the /courses multi-content-type grid.
 */
export function fetchBatchesList(params: BatchFilterParams = {}): Promise<PaginatedResult<CourseBatch>> {
  const p = new URLSearchParams();
  if (params.search)         p.set('search', params.search);
  if (params.course_id)      p.set('course_id', String(params.course_id));
  if (params.batch_status)   p.set('batch_status', params.batch_status);
  if (params.instructor_id)  p.set('instructor_id', String(params.instructor_id));
  if (params.is_active !== undefined) p.set('is_active', String(params.is_active));
  if (params.is_free !== undefined)   p.set('is_free', String(params.is_free));
  if (params.language_id)            p.set('language_id', String(params.language_id));
  p.set('sort', params.sort || 'display_order');
  p.set('order', params.order || 'asc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 12));
  return clientFetch<CourseBatch>(`/course-batches?${p.toString()}`);
}

// ─── Live‑session types + fetch ──────────────────────────────────────────

export interface LiveSession {
  id:                number;
  title:             string;
  description?:      string | null;
  item_type?:        string | null;
  item_id?:          number | null;
  instructor_id?:    number | null;
  session_status?:   string | null;
  scheduled_at?:     string | null;
  duration_minutes?: number | null;
  meeting_link?:     string | null;
  meeting_platform?: string | null;
  is_recurring?:     boolean;
  thumbnail_url?:    string | null;
  created_at?:       string;
  /** FK join */
  users?:            { id: number; first_name: string; last_name: string; email: string } | null;
}

export interface LiveSessionFilterParams {
  search?: string;
  session_status?: string;
  meeting_platform?: string;
  is_recurring?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Fetch live sessions with filters + pagination (client-side).
 * Used by the /live-sessions filter page.
 */
export function fetchLiveSessionsList(params: LiveSessionFilterParams = {}): Promise<PaginatedResult<LiveSession>> {
  const p = new URLSearchParams();
  if (params.search)           p.set('search', params.search);
  if (params.session_status)   p.set('session_status', params.session_status);
  if (params.meeting_platform) p.set('meeting_platform', params.meeting_platform);
  if (params.is_recurring !== undefined) p.set('is_recurring', String(params.is_recurring));
  p.set('sort', params.sort || 'created_at');
  p.set('order', params.order || 'desc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 12));
  return clientFetch<LiveSession>(`/live-sessions?${p.toString()}`);
}

// ─── Webinar filter params + fetch ───────────────────────────────────────

export interface WebinarFilterParams {
  search?: string;
  webinar_status?: string;
  is_free?: boolean;
  is_active?: boolean;
  /** Language ID for translated title + description enrichment */
  language_id?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Fetch webinars with filters + pagination (client-side).
 * Used by the /webinars filter page.
 */
export function fetchWebinarsList(params: WebinarFilterParams = {}): Promise<PaginatedResult<Webinar>> {
  const p = new URLSearchParams();
  if (params.search)         p.set('search', params.search);
  if (params.webinar_status) p.set('webinar_status', params.webinar_status);
  if (params.is_free !== undefined) p.set('is_free', String(params.is_free));
  if (params.is_active !== undefined) p.set('is_active', String(params.is_active));
  if (params.language_id)            p.set('language_id', String(params.language_id));
  p.set('sort', params.sort || 'scheduled_at');
  p.set('order', params.order || 'desc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 12));
  return clientFetch<Webinar>(`/webinars?${p.toString()}`);
}

// ─── Discussion thread types + fetch ─────────────────────────────────────

export interface DiscussionThread {
  id:             number;
  title:          string;
  body?:          string | null;
  item_type?:     string | null;
  item_id?:       number | null;
  author_id?:     number | null;
  thread_status?: string | null;
  is_pinned?:     boolean;
  is_answered?:   boolean;
  reply_count?:   number;
  view_count?:    number;
  created_at?:    string;
  /** FK join */
  users?:         { id: number; first_name: string; last_name: string; email: string } | null;
}

export interface DiscussionFilterParams {
  search?: string;
  thread_status?: string;
  is_pinned?: boolean;
  is_answered?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Fetch discussion threads with filters + pagination (client-side).
 * Used by the /discussions filter page.
 */
export function fetchDiscussionsList(params: DiscussionFilterParams = {}): Promise<PaginatedResult<DiscussionThread>> {
  const p = new URLSearchParams();
  if (params.search)        p.set('search', params.search);
  if (params.thread_status) p.set('thread_status', params.thread_status);
  if (params.is_pinned !== undefined) p.set('is_pinned', String(params.is_pinned));
  if (params.is_answered !== undefined) p.set('is_answered', String(params.is_answered));
  p.set('sort', params.sort || 'created_at');
  p.set('order', params.order || 'desc');
  p.set('page', String(params.page || 1));
  p.set('limit', String(params.limit || 12));
  return clientFetch<DiscussionThread>(`/discussion-threads?${p.toString()}`);
}
