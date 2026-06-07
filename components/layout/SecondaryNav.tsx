'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, Radio, Video, Calendar, FileText, MessagesSquare, UserSquare2, Star,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/cn';

/**
 * Maps a secondary-nav href to the corresponding site_section_settings key.
 * Items without a mapping are always visible (e.g. announcements).
 */
const HREF_TO_SECTION: Record<string, string> = {
  '/bundles':       'bundles',
  '/webinars':      'webinars',
  '/live-sessions': 'live_sessions',
  '/batches':       'live_classes',
  '/blog':          'blogs',
  '/discussion':    'discussions',
  '/instructors':   'instructors',
  '/reviews':       'student_reviews',
};

interface Props {
  /** Count of announcements published in the last 7 days — shows as a badge. */
  newAnnouncementsCount?: number;
  /** Section visibility map — hides nav items for disabled sections. */
  sectionVisibility?: Record<string, boolean>;
}

/**
 * Secondary navigation strip — sits directly below the main header on every
 * marketing page. Horizontal scroll on narrow viewports so all items stay
 * reachable without wrapping. Labels swap with the active language.
 *
 * Items whose section is explicitly set to `false` in `sectionVisibility`
 * are filtered out. A missing key defaults to visible.
 */
export function SecondaryNav({ newAnnouncementsCount = 0, sectionVisibility = {} }: Props) {
  const t = useT();
  const pathname = usePathname();

  const ALL_ITEMS: { href: string; label: string; Icon: LucideIcon; badge?: number }[] = [
    { href: '/bundles',        label: t.secondary.bundles,       Icon: BookOpen       },
    { href: '/webinars',       label: t.secondary.webinars,      Icon: Radio          },
    { href: '/live-sessions',  label: t.secondary.liveSessions,  Icon: Video          },
    { href: '/batches',        label: t.secondary.batches,       Icon: Calendar       },
    { href: '/blog',           label: t.secondary.blogs,         Icon: FileText       },
    { href: '/discussion',     label: t.secondary.discussion,    Icon: MessagesSquare },
    { href: '/instructors',    label: t.secondary.instructors,   Icon: UserSquare2    },
    { href: '/reviews',        label: t.secondary.reviews,       Icon: Star           },
    { href: '/announcements',  label: t.secondary.announcements, Icon: Megaphone,     badge: newAnnouncementsCount },
  ];

  // Hide items whose section is explicitly disabled (false). Missing keys default to visible.
  const ITEMS = ALL_ITEMS.filter((it) => {
    const key = HREF_TO_SECTION[it.href];
    return !key || sectionVisibility[key] !== false;
  });

  return (
    // Hidden below `lg` — on mobile and tablet the hamburger drawer carries
    // the same items in its "MORE" grid, so showing the strip here would
    // duplicate them and waste vertical space.
    <div className="hidden lg:block sticky top-[68px] z-40 bg-gradient-to-r from-brand-50 via-white to-indigo-50 border-y border-slate-200/70 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="-mx-2 overflow-x-auto scrollbar-none">
          <ul className="flex items-center gap-1 min-w-max px-2 py-2">
            {ITEMS.map((it) => {
              const active = pathname === it.href || pathname.startsWith(it.href + '/');
              const showBadge = typeof it.badge === 'number' && it.badge > 0;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={cn(
                      'relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors',
                      active
                        ? 'bg-brand-500 text-white shadow-btn'
                        : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50',
                    )}
                  >
                    <it.Icon className="h-3.5 w-3.5" />
                    {it.label}
                    {showBadge && (
                      <span
                        className={cn(
                          'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none',
                          active
                            ? 'bg-white text-brand-700'
                            : 'bg-rose-500 text-white shadow-sm',
                        )}
                        aria-label={`${it.badge} new`}
                      >
                        {it.badge! > 99 ? '99+' : it.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
