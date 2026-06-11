import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Authenticated/app surfaces have no SEO value and shouldn't be crawled.
        disallow: [
          '/dashboard', '/my-courses', '/learn/', '/cart', '/checkout', '/order/',
          '/profile', '/wishlist', '/referrals', '/support', '/notifications',
          '/chat', '/wallet', '/payments', '/resume', '/instructor/',
          '/my-ideas', '/submit-idea', '/auth/', // June 2026 (public /ideas showcase stays crawlable)
          '/m/dashboard', '/m/my-courses', '/m/learn/', '/m/cart', '/m/checkout',
          '/m/profile', '/m/wishlist',
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
