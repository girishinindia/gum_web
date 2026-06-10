import { SITE, absUrl } from './seo';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: absUrl('/images/GM_Logo_Dark.svg'),
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/courses?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.url) })),
  };
}

export function courseLd(o: { name: string; description?: string | null; url: string; image?: string | null; rating?: number | null; ratingCount?: number | null; price?: number | null; isFree?: boolean }) {
  const ld: any = {
    '@context': 'https://schema.org', '@type': 'Course', name: o.name,
    description: o.description || undefined, url: absUrl(o.url), image: absUrl(o.image),
    provider: { '@type': 'Organization', name: SITE.name, sameAs: SITE.url },
  };
  if (o.rating && o.ratingCount) ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: Number(o.rating), ratingCount: Number(o.ratingCount) };
  if (o.isFree || o.price != null) ld.offers = { '@type': 'Offer', price: o.isFree ? 0 : Number(o.price || 0), priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: absUrl(o.url) };
  return ld;
}

export function productLd(o: { name: string; description?: string | null; url: string; image?: string | null; price?: number | null; rating?: number | null; ratingCount?: number | null }) {
  const ld: any = {
    '@context': 'https://schema.org', '@type': 'Product', name: o.name,
    description: o.description || undefined, url: absUrl(o.url), image: absUrl(o.image),
    brand: { '@type': 'Brand', name: SITE.name },
  };
  if (o.price != null) ld.offers = { '@type': 'Offer', price: Number(o.price || 0), priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: absUrl(o.url) };
  if (o.rating && o.ratingCount) ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: Number(o.rating), ratingCount: Number(o.ratingCount) };
  return ld;
}

export function eventLd(o: { name: string; description?: string | null; url: string; image?: string | null; startDate?: string | null; isFree?: boolean; price?: number | null }) {
  const ld: any = {
    '@context': 'https://schema.org', '@type': 'Event', name: o.name,
    description: o.description || undefined, url: absUrl(o.url), image: absUrl(o.image),
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    organizer: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  };
  if (o.startDate) ld.startDate = o.startDate;
  ld.offers = { '@type': 'Offer', price: o.isFree ? 0 : Number(o.price || 0), priceCurrency: 'INR', url: absUrl(o.url) };
  return ld;
}

export function articleLd(o: { headline: string; description?: string | null; url: string; image?: string | null; datePublished?: string | null; authorName?: string | null }) {
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: o.headline,
    description: o.description || undefined, url: absUrl(o.url), image: absUrl(o.image),
    datePublished: o.datePublished || undefined,
    author: o.authorName ? { '@type': 'Person', name: o.authorName } : { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: absUrl('/images/GM_Logo_Dark.svg') } },
  };
}

export function personLd(o: { name: string; url: string; image?: string | null; jobTitle?: string | null }) {
  return {
    '@context': 'https://schema.org', '@type': 'Person', name: o.name,
    url: absUrl(o.url), image: absUrl(o.image), jobTitle: o.jobTitle || undefined,
    worksFor: { '@type': 'Organization', name: SITE.name },
  };
}

export function faqLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.question, acceptedAnswer: { '@type': 'Answer', text: i.answer } })),
  };
}
