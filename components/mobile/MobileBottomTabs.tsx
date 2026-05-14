'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Search, Heart, UserRound, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Tab {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Center "FAB" style — bigger, gradient circle */
  center?: boolean;
}

const TABS: Tab[] = [
  { href: '/m',          label: 'Home',     Icon: Home       },
  { href: '/m/courses',  label: 'Courses',  Icon: BookOpen   },
  { href: '/m/search',   label: 'Search',   Icon: Search, center: true },
  { href: '/m/wishlist', label: 'Wishlist', Icon: Heart      },
  { href: '/m/profile',  label: 'Profile',  Icon: UserRound  },
];

/**
 * Sticky dark-theme bottom navigation — 5 destinations, with a brand-gradient
 * FAB in the middle (Search). Active tab in bright brand sky, system
 * safe-area padding for notch/home-bar devices.
 *
 * IMPLEMENTATION NOTES
 *
 *   1. RENDERED VIA PORTAL TO <body>
 *      `position: fixed` becomes "absolute relative to a parent" when any
 *      ancestor has a `transform`, `filter`, `perspective`, `will-change`,
 *      or `contain` property set. Tailwind utilities deeper in the tree can
 *      promote those ancestors into containing blocks, which would make the
 *      tab bar scroll with the page. The portal pulls the bar out of the
 *      React tree's DOM position so no ancestor can hijack it.
 *
 *   2. INLINE STYLES OVER UTILITY CLASSES
 *      `position`, `bottom`, `left`, `right` are set inline so they win
 *      against any global rule. `transform: translateZ(0)` promotes the bar
 *      to its own composite layer — keeps iOS Safari from un-pinning it
 *      during momentum scroll.
 */
export function MobileBottomTabs() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function isActive(href: string) {
    if (href === '/m') return pathname === '/m';
    return pathname === href || pathname.startsWith(href + '/');
  }

  const bar = (
    <nav
      aria-label="Primary"
      style={{
        position:      'fixed',
        left:          0,
        right:         0,
        bottom:        0,
        zIndex:        60,
        transform:     'translateZ(0)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        // Big, smooth curve along the top edge — gives the bar a friendly
        // slide-up sheet feel rather than a hard rectangular cap.
        borderTopLeftRadius:  '28px',
        borderTopRightRadius: '28px',
        overflow:             'hidden',
      }}
      // Brand-theme gradient — horizontal sweep from deep ocean blue on the
      // left into bright sky cyan on the right (matches the gradient swatch
      // the user supplied). Stops mirror the brand-* palette so it ties
      // directly to the rest of the theme.
      className="bg-[linear-gradient(to_right,#075985_0%,#0369a1_35%,#0284c7_70%,#0ea5e9_100%)] backdrop-blur-xl shadow-[0_-12px_28px_rgba(14,165,233,0.28)]"
    >
      {/* Glossy top-edge highlight to read as a curved sheet */}
      <span
        aria-hidden
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
      <ul className="grid grid-cols-5 items-end h-14 relative">
        {TABS.map((t) => {
          const active = isActive(t.href);
          if (t.center) {
            return (
              <li key={t.href} className="flex justify-center">
                <Link
                  href={t.href}
                  aria-label={t.label}
                  // Smaller FAB — 40 px circle with an 18 px glyph reads as a
                  // refined accent rather than a chunky cap on the bar.
                  className={cn(
                    'relative -translate-y-2.5 h-10 w-10 rounded-full flex items-center justify-center shadow-[0_6px_16px_rgba(30,64,175,0.55)] active:scale-95 transition-all',
                    active
                      ? 'bg-gradient-to-br from-white to-brand-100 text-blue-800 ring-4 ring-white/20'
                      : 'bg-gradient-to-br from-brand-300 to-accent text-white',
                  )}
                >
                  {/* Bolder stroke on the icon glyph to match the bolder
                      label weight used on the surrounding tabs. */}
                  <t.Icon className="h-[18px] w-[18px]" strokeWidth={2.6} />
                </Link>
              </li>
            );
          }
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-label={t.label}
                aria-current={active ? 'page' : undefined}
                // Bumped from `font-semibold` (600) to `font-bold` (700) per
                // request. Slightly tighter tracking keeps short words like
                // "Home" / "Search" from looking heavy.
                className={cn(
                  'h-14 flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-bold tracking-tight transition-colors',
                  active ? 'text-white' : 'text-brand-50 active:text-white',
                )}
              >
                <t.Icon
                  // Lucide icons accept a `strokeWidth` prop — 2.5 gives a
                  // distinctly bolder render than the default 2 without
                  // looking distorted at small sizes.
                  strokeWidth={2.5}
                  className={cn(
                    'h-5 w-5',
                    active && 'drop-shadow-[0_0_8px_rgba(255,255,255,0.65)]',
                  )}
                />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  // First render is SSR — fall back to in-tree rendering so the markup ships
  // with the document. After hydration we relocate the node to <body> so it
  // escapes any transform/filter ancestor.
  if (!mounted) return bar;
  if (typeof document === 'undefined') return bar;
  return createPortal(bar, document.body);
}
