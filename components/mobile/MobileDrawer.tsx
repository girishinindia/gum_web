'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  X, BookOpen, Radio, Video, Calendar, FileText, MessagesSquare, UserSquare2, Star, Megaphone,
  Globe, Info, Users as UsersIcon, MessageCircle, LifeBuoy, FileQuestion, Monitor, LogIn,
  LogOut, ChevronRight, Ticket, Gift, Mic, type LucideIcon,
} from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { setViewMode } from '@/lib/device';
import { cn } from '@/lib/cn';

interface Props {
  open:           boolean;
  onClose:        () => void;
  onOpenLanguage: () => void;
}

interface Row {
  href: string;
  label: string;
  Icon: LucideIcon;
  badge?: number;
}

/**
 * Slide-in drawer from the left.
 *
 *  • Secondary nav block (Bundles, Webinars, Live Sessions, Course Batches,
 *    Blog, Discussion, Instructors, Reviews, Announcements)
 *  • Info / support block (About, Team, Contact, Help, Privacy, Terms)
 *  • Language switcher (inline list)
 *  • "View desktop site" toggle — flips the cookie and reloads
 *  • Sign-in CTA when logged out
 */
export function MobileDrawer({ open, onClose, onOpenLanguage }: Props) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { active } = useLanguage();
  // Auth state drives the footer — Sign-in CTA when logged out, name
  // + Log-out button when logged in. Mirrors the desktop UserMenu but
  // adapted to the drawer's stacked layout.
  const { user, signedIn, loading, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  // Pass current path to /m/login so successful sign-in returns the
  // user to the page they were on.
  const loginHref = pathname && pathname !== '/m/login' && pathname !== '/m/signup'
    ? `/m/login?next=${encodeURIComponent(pathname)}`
    : '/m/login';

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try { await logout(); } finally {
      setSigningOut(false);
      onClose();
      router.replace('/m/login');
    }
  }

  const SECONDARY: Row[] = [
    { href: '/m/bundles',       label: t.secondary.bundles,       Icon: BookOpen       },
    { href: '/m/webinars',      label: t.secondary.webinars,      Icon: Radio          },
    { href: '/m/live-sessions', label: t.secondary.liveSessions,  Icon: Video          },
    { href: '/m/batches',       label: t.secondary.batches,       Icon: Calendar       },
    { href: '/m/blog',          label: t.secondary.blogs,         Icon: FileText       },
    { href: '/m/podcasts',      label: 'Podcasts',                Icon: Mic            },
    { href: '/m/discussion',    label: t.secondary.discussion,    Icon: MessagesSquare },
    { href: '/m/instructors',   label: t.secondary.instructors,   Icon: UserSquare2    },
    { href: '/m/reviews',       label: t.secondary.reviews,       Icon: Star           },
    { href: '/m/announcements', label: t.secondary.announcements, Icon: Megaphone      },
  ];

  const INFO: Row[] = [
    { href: '/m/about',   label: t.nav.about,   Icon: Info            },
    { href: '/m/team',    label: t.nav.team,    Icon: UsersIcon       },
    { href: '/m/contact', label: t.nav.contact, Icon: MessageCircle   },
    { href: '/m/referrals', label: 'Refer & earn', Icon: Gift         },
    { href: '/m/support', label: 'Support tickets', Icon: Ticket      },
    { href: '/m/help',    label: 'Help Centre', Icon: LifeBuoy        },
    { href: '/m/faq',     label: t.nav.faqs,    Icon: FileQuestion    },
    { href: '/m/legal/PRIVACY', label: 'Privacy policy', Icon: FileText },
    { href: '/m/legal/TERMS',   label: 'Terms of service', Icon: FileText },
    { href: '/m/legal/REFUND',  label: 'Refund policy', Icon: FileText },
  ];

  function handleSwitchToDesktop() {
    setViewMode('desktop');
    window.location.href = '/';
  }

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[84%] max-w-[340px] bg-gradient-to-br from-white via-brand-50 to-indigo-50 shadow-2xl flex flex-col',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header strip */}
        <header className="flex items-center justify-between px-4 h-12 border-b border-slate-200/60">
          <div className="text-[11px] uppercase tracking-wider text-brand-700 font-bold">Menu</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-600 hover:bg-white/60 active:scale-95 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Body — scrollable. `pt-[30px]` keeps "Explore" clear of the
            drawer header strip above. `space-y-3` tightens the gap between
            section blocks so the compact menu reads as a single dense list. */}
        <div className="flex-1 overflow-y-auto px-3 pt-[30px] pb-3 space-y-3">
          {/* Secondary nav */}
          <Section title="Explore" rows={SECONDARY} onClose={onClose} />

          {/* Language — single row that opens the dedicated popup picker.
              Replaces the inline pill row so picking a language has its
              own focused surface instead of cluttering the drawer. */}
          <button
            type="button"
            onClick={() => { onClose(); onOpenLanguage(); }}
            className="w-full flex items-center gap-3 rounded-md bg-white/70 border border-slate-200 px-3 py-2.5 text-sm active:scale-[0.98] transition-all"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-700 shrink-0">
              <Globe className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Language</span>
              <span className="block text-[13px] font-semibold text-slate-800">{active?.name ?? 'English'}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          {/* Info */}
          <Section title="Company" rows={INFO} onClose={onClose} />

          {/* View toggle */}
          <button
            type="button"
            onClick={handleSwitchToDesktop}
            className="w-full flex items-center gap-3 rounded-md bg-white/70 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 active:scale-[0.98] transition-all"
          >
            <Monitor className="h-4 w-4 text-brand-600" />
            <span className="flex-1 text-left font-medium">View desktop site</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Footer — auth action.
            Signed out → primary Login pill (existing behaviour).
            Signed in  → user identity row + destructive Log-out button. */}
        <footer className="px-3 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] border-t border-slate-200/60 bg-white/50">
          {signedIn && !loading && user ? (
            <div className="flex items-center gap-2.5">
              {/* User identity chip — avatar + name, takes most of the row */}
              <div className="flex items-center gap-2 flex-1 min-w-0 rounded-md bg-white/80 border border-slate-200 px-2.5 py-2">
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[12.5px] font-semibold text-slate-900 truncate">
                    {`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email}
                  </span>
                  <span className="text-[10.5px] text-slate-500 truncate">{user.email}</span>
                </span>
              </div>
              {/* Destructive log-out — kept compact (icon-only with label
                  on wider phones) so it doesn't compete with the avatar. */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                aria-label="Log out"
                className="h-10 px-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[12px] font-bold shadow-sm active:scale-95 transition-all disabled:opacity-60"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{signingOut ? '…' : 'Log out'}</span>
              </button>
            </div>
          ) : (
            <Link
              href={loginHref}
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-2.5 text-sm font-semibold shadow-btn active:scale-95 transition-all"
            >
              <LogIn className="h-4 w-4" /> {t.common.login}
            </Link>
          )}
        </footer>
      </aside>
    </>
  );
}

function Section({ title, rows, onClose }: { title: string; rows: Row[]; onClose: () => void }) {
  return (
    <div>
      {/* Section header — matches the bottom-nav royal-blue gradient with
          white uppercase label so each group reads as a tinted "chip"
          header rather than plain grey microcopy. */}
      <div
        className="rounded-md px-3 py-1.5 mb-2 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-sm bg-[linear-gradient(to_right,#075985_0%,#0369a1_35%,#0284c7_70%,#0ea5e9_100%)]"
      >
        {title}
      </div>
      {/* Compact row spacing — tighter vertical padding and zero gap between
          rows so the menu fits more entries in less screen real estate. */}
      <ul className="grid grid-cols-1">
        {rows.map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              onClick={onClose}
              // Label sized at `text-[15.6px]` — 20 % larger than the previous
              // 13 px (compact) value. Icon container bumped a notch to keep
              // visual balance with the larger label.
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-sm text-[15.6px] font-medium text-slate-800 active:bg-white/80 transition-all"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/70 border border-slate-200/70 text-brand-700 shrink-0">
                <r.Icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 truncate">{r.label}</span>
              {r.badge != null && r.badge > 0 && (
                <span className="rounded-full bg-rose-500 text-white text-[9.5px] font-bold px-1.5 py-0.5 min-w-[18px] text-center">{r.badge}</span>
              )}
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
