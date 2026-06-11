import { NextResponse, type NextRequest } from 'next/server';

/**
 * Mobile-portal routing (hardened June 2026).
 *
 *  • Mobile UA visiting a desktop URL → redirect to the `/m...` equivalent,
 *    but ONLY when that /m page actually exists — previously EVERY path was
 *    rewritten blindly, so phones 404'd on /dashboard, /wallet, /checkout,
 *    /learn, /instructor/*, /policies, …
 *  • Cookie `view=desktop` overrides UA detection  (user asked for desktop)
 *  • Cookie `view=mobile`  forces mobile           (user/viewport asked for it)
 *  • Viewport-based switching (responsive "mobile mode" with a desktop UA) is
 *    handled client-side by components/layout/ViewportRouter.tsx — keep its
 *    MIRRORED_SEGMENTS list in sync with M_SEGMENTS below.
 *
 * Future migration to `m.domain.com`: replace the redirect target with
 * `https://m.<host>${pathname}` and let DNS point both back to this Next app.
 */
const MOBILE_UA = /(android|iphone|ipad|ipod|mobile|tablet|phone|webos|blackberry|opera mini|iemobile)/i;
const VIEW_COOKIE = 'view';

// First path segments that HAVE a page under app/m/. Keep in sync with
// components/mobile/ViewportSwitch.tsx (M_SEGMENTS) and the app/m directory.
const M_SEGMENTS = new Set([
  '', // root → /m
  'about', 'announcements', 'batches', 'blog', 'bundles', 'cart', 'contact',
  'courses', 'discussion', 'faq', 'forgot-password', 'help', 'instructors',
  'legal', 'live-sessions', 'login', 'my-courses', 'notifications', 'podcasts',
  'profile', 'referrals', 'reset-password', 'reviews', 'search', 'signup',
  'support', 'team', 'verify-email', 'webinars', 'wishlist',
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Already mobile route — let it through
  if (pathname === '/m' || pathname.startsWith('/m/')) return NextResponse.next();

  // Cookie override
  const cookie = req.cookies.get(VIEW_COOKIE)?.value;
  if (cookie === 'desktop') return NextResponse.next();

  const ua = req.headers.get('user-agent') || '';
  const isMobile = cookie === 'mobile' || MOBILE_UA.test(ua);
  if (!isMobile) return NextResponse.next();

  // Only redirect when the /m equivalent exists; otherwise the desktop page
  // is the only implementation — serve it rather than 404.
  const firstSegment = pathname.split('/')[1] ?? '';
  if (!M_SEGMENTS.has(firstSegment)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = pathname === '/' ? '/m' : `/m${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Skip static files, Next internals, the API proxy, and images.
    '/((?!_next/static|_next/image|api/|images/|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
