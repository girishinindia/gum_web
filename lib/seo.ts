import type { Metadata } from 'next';

/** Site-wide SEO constants. */
export const SITE = {
  name: 'Grow Up More',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://growupmore.com').replace(/\/$/, ''),
  /** Default social image used when a page has no specific image. */
  defaultImage: '/images/og-default.jpg',
  twitter: '@growupmore',
};

/** Make a path absolute against the site URL (leaves absolute URLs untouched). */
export function absUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** The SEO + social columns shared by every *_translations table. */
export interface SeoTranslation {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  canonical_url?: string | null;
  robots_directive?: string | null;
  og_site_name?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_type?: string | null;
  og_image?: string | null;
  og_url?: string | null;
  twitter_site?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  twitter_card?: string | null;
}

export interface MetaFallback {
  title: string;
  description?: string | null;
  /** Page path (used for canonical when the translation has none). */
  path: string;
  /** Preferred image (e.g. the item thumbnail) when og_image is empty. */
  image?: string | null;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

/**
 * Build Next `Metadata` from a translation row's SEO/social fields, falling
 * back to sensible defaults. og_image → twitter_image → item image → site default.
 */
export function metaFromTranslation(t: SeoTranslation | null | undefined, fb: MetaFallback): Metadata {
  const title = t?.meta_title || fb.title;
  const description = (t?.meta_description || fb.description || '') || undefined;
  const canonical = t?.canonical_url || absUrl(fb.path);
  const image = absUrl(t?.og_image || fb.image || SITE.defaultImage)!;
  const twitterImage = absUrl(t?.twitter_image) || image;
  const ogType = (t?.og_type as 'website' | 'article' | 'profile') || fb.type || 'website';

  const robots = fb.noIndex
    ? { index: false, follow: true }
    : (t?.robots_directive || undefined);

  return {
    title,
    description,
    keywords: t?.meta_keywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    robots,
    openGraph: {
      title: t?.og_title || title,
      description: t?.og_description || description,
      url: t?.og_url || canonical,
      siteName: t?.og_site_name || SITE.name,
      type: ogType === 'profile' ? 'website' : ogType,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: (t?.twitter_card as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: t?.twitter_title || title,
      description: t?.twitter_description || description,
      images: [twitterImage],
      site: t?.twitter_site || SITE.twitter,
    },
  };
}

/** Convenience for pages that have no translation row (listing/static/home). */
export function siteMeta(fb: MetaFallback): Metadata {
  return metaFromTranslation(null, fb);
}
