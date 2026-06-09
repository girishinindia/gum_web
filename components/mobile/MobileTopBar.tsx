'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, Search, Bell, Globe, GraduationCap } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/cn';
import { CartBadge } from '@/components/commerce/CartBadge';

interface Props {
  unreadCount?:    number;
  onOpenDrawer:    () => void;
  onOpenLanguage:  () => void;
  className?:      string;
}

/**
 * Floating mobile top bar — small brand mark on the left, search + bell + lang
 * pill on the right. Drawer trigger replaces the hamburger position.
 *
 * IMPLEMENTATION NOTE — POSITION: FIXED + PORTAL TO <body>
 * Same bulletproof pattern the bottom-tabs bar uses. Why fixed instead of
 * sticky:
 *   • `position: sticky` only pins when the element's natural position has
 *     scrolled to the threshold. With an ancestor that has any `transform`,
 *     `filter`, `perspective`, `will-change`, or `contain` applied, sticky
 *     silently degrades to static — and Tailwind utilities used elsewhere on
 *     the page can promote ancestors into containing blocks.
 *   • `position: fixed` is anchored to the viewport regardless of scroll
 *     position. Rendering through a portal to <body> further insulates the
 *     bar from any ancestor styling that could try to hijack the anchor.
 *
 * The result is a top bar that behaves exactly like the bottom tabs:
 * permanently 10 px from the top of the viewport, never scrolls away.
 */
export function MobileTopBar({ unreadCount = 0, onOpenDrawer, onOpenLanguage, className }: Props) {
  const t = useT();
  const { active } = useLanguage();
  const iso = (active?.iso_code || 'en').toUpperCase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const bar = (
    <header
      style={{
        position:  'fixed',
        top:       0,       // anchor to the very top of the viewport…
        left:      0,
        right:     0,
        // …and use inner padding-top to recreate the 10 px gap. The bar's
        // white background now covers the full top strip of the viewport,
        // so scrolled content underneath cannot peek through the gap.
        paddingTop: '10px',
        zIndex:    50,
        transform: 'translateZ(0)', // own composite layer — anti-jitter on iOS
      }}
      className={cn(
        'bg-white/95 backdrop-blur-xl',
        // Clear visual separator from the scrolling content beneath — a crisp
        // slate hairline plus a soft drop shadow so it reads as a floating
        // app-bar, not as part of the page body.
        'border-b border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_12px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      {/* `min-w-0` on the row + the brand link lets the brand shrink before
          the right-side actions get clipped — guarantees the hamburger is
          always visible on narrow Android viewports (~360 – 380 px). */}
      <div className="px-3 h-12 flex items-center justify-between gap-2 min-w-0">
        {/* Brand — same icon-before-logo treatment as the desktop HeaderShell.
            Logo image is allowed to shrink (no shrink-0 on the image) so the
            right-side actions never get pushed off-screen. */}
        <Link href="/m" className="flex items-center gap-1.5 shrink min-w-0 overflow-hidden">
          <span className="h-9 w-9 rounded-md bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center shadow-btn shrink-0">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <Image
            src="/images/GM_Logo_Dark.svg"
            alt="Grow Up More"
            width={154}
            height={35}
            priority
            className="h-[1.95rem] w-auto max-w-[140px] sm:max-w-none shrink"
          />
        </Link>

        {/* Right actions — `shrink-0` so they're never clipped */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/m/search"
            aria-label={t.common.search}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-700 hover:bg-brand-50 active:scale-95 transition-all"
          >
            <Search className="h-5 w-5" />
          </Link>
          <CartBadge href="/m/cart" className="h-9 w-9 rounded-full hover:bg-brand-50 text-slate-700" />
          <Link
            href="/m/notifications"
            aria-label="Notifications"
            className="relative h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-700 hover:bg-brand-50 active:scale-95 transition-all"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          {/* Language pill — icon-only on narrow phones, icon + ISO label on
              tablets / wider phones. Opens the dedicated bottom-sheet popup
              instead of the drawer for a focused single-tap flow. */}
          <button
            type="button"
            onClick={onOpenLanguage}
            aria-label={`Language: ${iso}`}
            className="inline-flex items-center gap-1 h-9 px-2 sm:px-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-brand-50 active:scale-95 transition-all"
          >
            <Globe className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">{iso}</span>
          </button>
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label={t.common.menu}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-700 hover:bg-brand-50 active:scale-95 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );

  // SSR fallback — render in-tree so the markup ships with the document.
  // After hydration we relocate to <body> so no ancestor can hijack the
  // viewport anchor (mirrors the MobileBottomTabs pattern).
  if (!mounted) return bar;
  if (typeof document === 'undefined') return bar;
  return createPortal(bar, document.body);
}
