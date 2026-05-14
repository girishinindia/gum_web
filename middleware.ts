import { NextResponse, type NextRequest } from 'next/server';

/**
 * Mobile-portal routing.
 *
 *  • Mobile UA visiting `/` (or any non-/m route)        → redirect to `/m...`
 *  • Cookie `view=desktop` overrides UA detection         (user asked for desktop)
 *  • Cookie `view=mobile`  forces mobile                  (user asked for mobile)
 *  • Anything inside /_next, /api, /images is skipped
 *  • Anything already under `/m/...` is passed through unchanged
 *
 * Future migration to `m.domain.com`: replace the redirect target with
 * `https://m.<host>${pathname}` and let DNS point both back to this Next app.
 */
const MOBILE_UA = /(android|iphone|ipad|ipod|mobile|tablet|phone|webos|blackberry|opera mini|iemobile)/i;
const VIEW_COOKIE = 'view';

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

  // Mobile user on a desktop URL — redirect to /m equivalent
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
