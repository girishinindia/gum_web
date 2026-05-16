'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  GraduationCap, Menu, X, ArrowRight, UserRound,
  BookOpen, Radio, Video, Calendar, FileText, MessagesSquare, UserSquare2, Star, Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CoursesMegaMenu } from './CoursesMegaMenu';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/components/auth/AuthProvider';
import { useT } from '@/lib/i18n/useT';
import type { SubCategory } from '@/lib/api';
import { cn } from '@/lib/cn';

interface Props {
  categories: SubCategory[];
}

/**
 * Secondary-nav items mirrored inside the mobile drawer so the same set of
 * destinations is reachable from a narrow viewport (where the horizontal
 * strip below the header is partially hidden).
 */
function SECONDARY_ITEMS(t: ReturnType<typeof useT>): { href: string; label: string; Icon: LucideIcon }[] {
  return [
    { href: '/bundles',       label: t.secondary.bundles,       Icon: BookOpen       },
    { href: '/webinars',      label: t.secondary.webinars,      Icon: Radio          },
    { href: '/live-sessions', label: t.secondary.liveSessions,  Icon: Video          },
    { href: '/batches',       label: t.secondary.batches,       Icon: Calendar       },
    { href: '/blog',          label: t.secondary.blogs,         Icon: FileText       },
    { href: '/discussion',    label: t.secondary.discussion,    Icon: MessagesSquare },
    { href: '/instructors',   label: t.secondary.instructors,   Icon: UserSquare2    },
    { href: '/reviews',       label: t.secondary.reviews,       Icon: Star           },
    { href: '/announcements', label: t.secondary.announcements, Icon: Megaphone      },
  ];
}

export function HeaderShell({ categories }: Props) {
  const t = useT();
  // Auth-aware right-side action — Login pill when signed-out, user
  // avatar + dropdown menu when signed-in. `loading` covers the brief
  // hydration window where we don't yet know which state to render;
  // we keep the Login pill during loading so the chrome never flickers
  // an empty slot.
  const { signedIn, loading } = useAuth();
  // `?next=<current-path>` — so a successful login bounces the user back
  // to the page they were on (instead of always landing on /dashboard).
  // Direct visits to /login still default to /dashboard (handled by the
  // login page itself). `||` covers the rare case where pathname is null.
  const pathname = usePathname();
  const loginHref = pathname && pathname !== '/login' && pathname !== '/signup'
    ? `/login?next=${encodeURIComponent(pathname)}`
    : '/login';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigation built from the translation dictionary so labels swap when the
  // user changes language. `/courses` is rendered as a mega-menu — the rest
  // are plain links.
  const NAV_ITEMS = [
    { href: '/about',   label: t.nav.about   },
    { href: '/team',    label: t.nav.team    },
    { href: '/faq',     label: t.nav.faqs    },
    { href: '/careers', label: t.nav.careers },
    { href: '/contact', label: t.nav.contact },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 inset-x-0 z-50 transition-all duration-300 ease-out',
        scrolled ? 'glass shadow-glass py-1.5 sm:py-2' : 'bg-white/30 backdrop-blur-sm py-2 sm:py-3',
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand — same logo as the existing PHP site (tagline is baked into the SVG itself) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
          <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center shadow-btn group-hover:scale-105 transition-transform">
            <GraduationCap className="h-[18px] w-[18px] sm:h-5 sm:w-5 text-white" />
          </span>
          <Image
            src="/images/GM_Logo_Dark.svg"
            alt={`Grow Up More — ${t.common.tagline}`}
            width={210}
            height={50}
            priority
            className="h-9 sm:h-11 w-auto"
          />
        </Link>

        {/* Center links — desktop. Courses is rendered as a mega-menu; the rest stay as plain links. */}
        <ul className="hidden lg:flex items-center gap-1">
          <li>
            <CoursesMegaMenu initialCategories={categories} />
          </li>
          {NAV_ITEMS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-3 py-2 rounded-sm text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden md:block" />
          {signedIn && !loading ? (
            <UserMenu className="hidden sm:block" />
          ) : (
            <ButtonLink href={loginHref} variant="primary" size="md" className="hidden sm:inline-flex rounded-full">
              <UserRound className="h-4 w-4" /> {t.common.login} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          )}
          <button
            type="button"
            aria-label={t.common.menu}
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-sm hover:bg-brand-50 text-slate-700"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer — full menu including secondary nav items, language switcher and login */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 mx-3 glass rounded-md p-3 shadow-glass max-h-[calc(100vh-6rem)] overflow-y-auto">
          {/* Primary nav */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1 pb-1.5">Main</div>
          <ul className="flex flex-col gap-0.5">
            <li>
              <Link
                href="/courses"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-sm text-sm font-medium text-slate-800 hover:text-brand-700 hover:bg-brand-50"
              >
                {t.nav.courses}
              </Link>
            </li>
            {NAV_ITEMS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-sm text-sm font-medium text-slate-800 hover:text-brand-700 hover:bg-brand-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Secondary nav — mirror of the desktop strip so mobile users can reach everything */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 pb-1.5">More</div>
          <ul className="grid grid-cols-2 gap-0.5">
            {SECONDARY_ITEMS(t).map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm text-[13px] font-medium text-slate-700 hover:text-brand-700 hover:bg-brand-50"
                >
                  <it.Icon className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                  <span className="truncate">{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Language switcher + auth action */}
          <div className="pt-3 mt-3 border-t border-slate-200/70 flex flex-col gap-2.5">
            <LanguageSwitcher />
            {signedIn && !loading ? (
              <UserMenu className="w-full" />
            ) : (
              <ButtonLink href={loginHref} variant="primary" size="md" className="w-full rounded-full">
                <UserRound className="h-4 w-4" /> {t.common.login}
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
