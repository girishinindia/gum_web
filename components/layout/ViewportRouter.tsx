'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { VIEW_COOKIE } from '@/lib/device';

/**
 * Mobile breakpoint — matches the Tailwind `lg:` threshold used by the desktop
 * chrome (HeaderShell switches between mobile-drawer and full-nav at `lg`).
 * Anything below this width gets the `/m/*` mobile portal; anything at or
 * above falls back to the desktop site.
 */
const MOBILE_BREAKPOINT = 1024;

/**
 * Client-side viewport watcher.
 *
 * The server-side middleware only sees the `User-Agent` header, which means:
 *   • DevTools "Responsive" / device-emulation mode keeps the desktop UA,
 *     so resizing to an iPhone width never triggers a redirect.
 *   • A user dragging the window between sizes wouldn't swap portals either.
 *
 * This component fills that gap by watching `window.innerWidth` and pushing
 * to the mirror URL whenever the viewport crosses the breakpoint:
 *   • narrow viewport while on `/courses` → push to `/m/courses`
 *   • wide   viewport while on `/m/courses` → push to `/courses`
 *
 * Cookie pin always wins — if the user explicitly chose "View desktop site"
 * or "View mobile site" via the drawer / footer, we respect that pin and
 * never auto-swap until they clear it.
 *
 * Mount this once near the root of the tree (e.g. in `RootLayout`).
 */
export function ViewportRouter() {
  const pathname = usePathname();
  const router   = useRouter();
  const params   = useSearchParams();
  const lastWidthBucket = useRef<'mobile' | 'desktop' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Resolve the user's view-mode pin from the cookie (if any).
    function readPin(): 'desktop' | 'mobile' | null {
      const m = document.cookie.match(new RegExp(`(?:^|; )${VIEW_COOKIE}=(desktop|mobile)`));
      return (m?.[1] as 'desktop' | 'mobile') ?? null;
    }

    function isMobilePath(p: string) {
      return p === '/m' || p.startsWith('/m/');
    }
    function toMobilePath(p: string) {
      if (p === '/') return '/m';
      if (isMobilePath(p)) return p;
      return `/m${p}`;
    }
    function toDesktopPath(p: string) {
      if (p === '/m') return '/';
      if (p.startsWith('/m/')) return p.slice(2);
      return p;
    }

    function evaluate() {
      const pin = readPin();
      if (pin) return; // user explicitly chose a view — never auto-swap

      const w = window.innerWidth;
      const bucket: 'mobile' | 'desktop' = w < MOBILE_BREAKPOINT ? 'mobile' : 'desktop';

      // Skip if we've already evaluated this bucket and the URL already matches.
      const onMobileUrl = isMobilePath(pathname);
      if (bucket === 'mobile' && onMobileUrl) { lastWidthBucket.current = bucket; return; }
      if (bucket === 'desktop' && !onMobileUrl) { lastWidthBucket.current = bucket; return; }

      // Don't redirect routes that have no mobile/desktop mirror (e.g.
      // /dashboard, /wallet, /checkout, /learn, /instructor/*). Those stay
      // where they are regardless of viewport. Synced with the REAL app/m
      // directory + middleware.ts M_SEGMENTS (June 2026 — the old hardcoded
      // list was missing cart/my-courses/profile/podcasts/search/support/
      // wishlist/referrals/notifications/legal, so "mobile mode" never
      // switched on those pages).
      const MIRRORED_SEGMENTS = new Set([
        '', // root
        'about', 'announcements', 'batches', 'blog', 'bundles', 'cart',
        'contact', 'courses', 'discussion', 'faq', 'forgot-password', 'help',
        'instructors', 'legal', 'live-sessions', 'login', 'my-courses',
        'notifications', 'podcasts', 'profile', 'referrals', 'reset-password',
        'reviews', 'search', 'signup', 'support', 'team', 'verify-email',
        'webinars', 'wishlist',
      ]);
      const head = pathname.split('?')[0];
      // First segment of the DESKTOP path (strip the /m prefix when present).
      const desktopHead = isMobilePath(head) ? toDesktopPath(head) : head;
      const firstSegment = desktopHead.split('/')[1] ?? '';
      if (!MIRRORED_SEGMENTS.has(firstSegment)) { lastWidthBucket.current = bucket; return; }

      const qs = params?.toString();
      const suffix = qs ? `?${qs}` : '';
      const target = bucket === 'mobile' ? toMobilePath(pathname) : toDesktopPath(pathname);
      lastWidthBucket.current = bucket;
      router.replace(target + suffix);
    }

    // Initial check — fires after hydration so DevTools opens straight into
    // the correct portal even if middleware sent the desktop HTML.
    evaluate();

    // Debounced resize listener — 150ms is enough to avoid thrash while a
    // user drags the window edge.
    let t: ReturnType<typeof setTimeout> | undefined;
    function onResize() {
      if (t) clearTimeout(t);
      t = setTimeout(evaluate, 150);
    }
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [pathname, router, params]);

  return null;
}
