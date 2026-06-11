import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

/**
 * Sitemap (Phase 6, June 2026). The middleware always passed /sitemap.xml
 * through but nothing generated it — this fixes that.
 *
 * Pulls slugs straight from the public list endpoints. Self-contained fetch
 * (not lib/api.ts helpers) so a single endpoint hiccup never breaks the whole
 * sitemap — each section degrades to an empty list. Revalidates hourly.
 */

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1').replace(/\/$/, '');
const REVALIDATE = 3600;

interface SlugRow { slug?: string | null; id?: number | null; updated_at?: string | null }

async function fetchRows(path: string): Promise<SlugRow[]> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data;
    return Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
  } catch {
    return [];
  }
}

const lastMod = (r: SlugRow) => (r.updated_at ? new Date(r.updated_at) : undefined);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    '', '/courses', '/bundles', '/batches', '/webinars', '/podcasts', '/blog',
    '/instructors', '/about', '/team', '/careers', '/contact', '/help',
    '/reviews', '/announcements', '/faq', '/policies', '/terms', '/privacy', '/refund',
    '/ideas', '/live-sessions', // June 2026: Idea Showcase + live sessions listing
  ].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: p === '' || p === '/courses' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : p === '/courses' ? 0.9 : 0.6,
  }));

  const [courses, bundles, batches, webinars, blog, instructors, podcasts, ideas, policies] = await Promise.all([
    fetchRows('/courses?limit=500&page=1'),
    fetchRows('/bundles?is_active=true&limit=500&page=1'),
    fetchRows('/course-batches?limit=500&page=1'),
    fetchRows('/webinars?is_active=true&limit=500&page=1'),
    fetchRows('/blog-posts?limit=500&page=1'),
    fetchRows('/instructor-profiles/public?limit=500&page=1'),
    fetchRows('/podcasts?status=published&limit=500&page=1'),
    fetchRows('/ideas/public?limit=500&page=1'),                 // June 2026: public Idea Showcase
    fetchRows('/public-content/policies'),                        // June 2026: legal policy pages
  ]);

  const withSlug = (rows: SlugRow[], prefix: string, priority: number): MetadataRoute.Sitemap =>
    rows
      .filter((r) => typeof r.slug === 'string' && r.slug)
      .map((r) => ({
        url: `${base}${prefix}/${r.slug}`,
        lastModified: lastMod(r),
        changeFrequency: 'weekly' as const,
        priority,
      }));

  const podcastRoutes: MetadataRoute.Sitemap = podcasts
    .filter((r) => r.id != null)
    .map((r) => ({
      url: `${base}/podcasts/${r.id}`,
      lastModified: lastMod(r),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }));

  // Policies expose a `code` (not a slug) -> /legal/<code>
  const policyRoutes: MetadataRoute.Sitemap = (policies as Array<SlugRow & { code?: string | null }>)
    .filter((r) => typeof r.code === 'string' && r.code)
    .map((r) => ({
      url: `${base}/legal/${String(r.code).toLowerCase()}`,
      lastModified: lastMod(r),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    }));

  return [
    ...staticRoutes,
    ...withSlug(courses, '/courses', 0.8),
    ...withSlug(bundles, '/bundles', 0.7),
    ...withSlug(batches, '/batches', 0.6),
    ...withSlug(webinars, '/webinars', 0.5),
    ...withSlug(blog, '/blog', 0.5),
    ...withSlug(instructors, '/instructors', 0.5),
    ...withSlug(ideas, '/ideas', 0.4),
    ...podcastRoutes,
    ...policyRoutes,
  ];
}
