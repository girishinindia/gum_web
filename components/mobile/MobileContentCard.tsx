'use client';

import { extractCardData, UnifiedCard, type UnifiedItem } from '@/components/ui/ContentCard';

/** Build the mobile (/m) detail href per type, using the param each mobile
 *  detail route + API expects (slug for course/bundle, id for the rest). */
function mobileHref(item: UnifiedItem, fallback?: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = item.data as any;
  switch (item.type) {
    case 'courses':       return d.slug ? `/m/courses/${d.slug}` : fallback;
    case 'bundles':       return d.slug ? `/m/bundles/${d.slug}` : fallback;
    case 'batches':       return d.courses?.slug ? `/m/courses/${d.courses.slug}` : fallback;
    case 'webinars':      return `/m/webinars/${item.id}`;
    case 'live_sessions': return `/m/live-sessions/${item.id}`;
    case 'podcasts':      return `/m/podcasts/${item.id}`;
    case 'blogs':         return `/m/blog/${item.id}`;
    case 'instructors':   return `/m/instructors/${d.user_id ?? item.id}`;
    default:              return fallback;
  }
}

/**
 * Mobile catalog card — renders the exact same card as the desktop web
 * (`UnifiedCard`) but points the link at the mobile (/m) detail route.
 */
export function MobileContentCard({ item, index = 0 }: { item: UnifiedItem; index?: number }) {
  const d = extractCardData(item);
  if (!d) return null;
  return <UnifiedCard d={{ ...d, href: mobileHref(item, d.href) }} index={index} basePath="/m" />;
}
