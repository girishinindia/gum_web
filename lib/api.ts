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
  id:           number;
  name:         string;
  slug:         string;
  icon?:        string | null;
  course_count?: number;
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
