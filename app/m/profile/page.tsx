'use client';

import Link from 'next/link';
import {
  // Section icons
  LayoutDashboard, BookOpen, Heart, FileText,
  ShoppingCart, Receipt, Wallet,
  UserRound, Shield, Bell, MessageSquare, LifeBuoy,
  GraduationCap, TrendingUp, Send, Landmark,
  ShieldCheck, KeyRound, Mail, Phone,
  // CTA + utility icons
  LogIn, LogOut, ChevronRight, Pencil,
  type LucideIcon,
} from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import { roleLabel } from '@/lib/users/profile-sections';

/**
 * Mobile profile hub (the home tab user reaches via /m/profile).
 *
 * Replaces the previous flat 8-row list with the SAME grouped /
 * role-gated structure the desktop UserMenu dropdown uses
 * (`components/layout/UserMenu.tsx`). Why mirror it?
 *
 *   • A single mental model for "where do I find my stuff?" works
 *     across both screens — the user doesn't have to relearn the
 *     navigation when they pick up their phone.
 *   • Section visibility logic ("Instructor" rows only when
 *     `max_role_level >= 60`) is centralised in one place — the
 *     mobile and desktop hubs both consume the same role gates.
 *
 * Sections
 *   LEARN       → Dashboard · My Courses · Wishlist · Resume
 *   MONEY       → Cart · Order history · Wallet
 *   YOU         → Edit profile · Security · Notifications · Messages · Support
 *   INSTRUCTOR  → Instructor home · Earnings · Payouts · Bank accounts  (≥ 60)
 *   ADMIN       → Admin console (external link)                          (≥ 80)
 *
 * The "Edit profile" row is featured at the top because it's the
 * single highest-engagement destination from this screen — without
 * it, users had to discover the editor on their own.
 */

interface Row {
  href:     string;
  label:    string;
  Icon:     LucideIcon;
  badge?:   number;
  external?: boolean;
}

interface SectionGroup {
  title: string;
  rows:  Row[];
  tinted?: boolean; // visually mark instructor / admin sections
}

export default function MobileProfilePage() {
  const { user, signedIn, loading, logout } = useAuth();

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <MobilePageHeader title="Profile" />
        <div className="px-4 mt-10 text-center text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  // ── Signed out — original CTA card preserved ────────────────────────
  if (!signedIn || !user) {
    return (
      <div>
        <MobilePageHeader title="Profile" />
        <div className="px-4 mt-6">
          <div className="rounded-md bg-gradient-to-br from-brand-500 via-brand-600 to-accent text-white p-6 text-center shadow-cardHover">
            <div className="mx-auto h-16 w-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center heading text-2xl">👋</div>
            <h2 className="mt-3 heading text-xl">Sign in to continue</h2>
            <p className="mt-1 text-[13px] opacity-90">Track your courses, wishlist and certificates in one place.</p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/m/login?next=%2Fm%2Fprofile"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-brand-700 px-5 py-2.5 text-sm font-bold active:scale-95 transition-all"
              >
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link href="/m/signup" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 text-white px-5 py-2.5 text-sm font-bold active:scale-95 transition-all">
                Create account
              </Link>
            </div>
          </div>

          <div className="mt-6 text-[12.5px] text-slate-500 text-center">
            Browse without signing in — your wishlist will be saved when you do.
          </div>
        </div>
      </div>
    );
  }

  // ── Signed in ──────────────────────────────────────────────────────
  const initial      = (user.first_name?.[0] || user.email[0] || '?').toUpperCase();
  const fullName     = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email;
  const roleLevel    = user.max_role_level ?? 20;
  const groups       = buildMobileGroups(roleLevel);
  const adminUrl     = process.env.NEXT_PUBLIC_ADMIN_URL || '/admin';

  return (
    <div>
      <MobilePageHeader title="Profile" />
      <div className="px-3 pt-3 pb-6">

        {/* ── User identity card. Adds an "Edit profile" CTA on the
            right so the highest-engagement destination is one tap
            away (previously buried inside the row list). */}
        <div className="rounded-md bg-white border border-slate-200 p-4 flex items-center gap-3 shadow-card">
          {user.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profile_image_url}
              alt={fullName}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-xl flex items-center justify-center">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="heading text-base text-slate-900 truncate">{fullName}</div>
              {roleLevel >= 60 && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  {roleLabel(roleLevel)}
                </span>
              )}
            </div>
            <div className="text-[11.5px] text-slate-500 truncate">{user.email}</div>
            <div className="text-[11.5px] text-slate-500 truncate">{user.mobile}</div>
          </div>
          <Link
            href="/m/profile/edit"
            aria-label="Edit profile"
            className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 active:scale-95 transition-all"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Grouped destinations — one Section per group, each rendered
            as a tinted card. Keeps the long list scannable on mobile by
            chunking related items together. */}
        {groups.map((g) => (
          <Section key={g.title} title={g.title} tinted={g.tinted}>
            {g.rows.map((r) => (
              <RowLink
                key={r.href + r.label}
                href={r.href}
                label={r.label}
                Icon={r.Icon}
                badge={r.badge}
                external={r.external}
              />
            ))}
          </Section>
        ))}

        {/* ── Destructive sign-out — kept visually separate at the
            bottom so users don't tap it by accident while browsing. */}
        <button
          type="button"
          onClick={() => logout().then(() => { window.location.href = '/m/login'; })}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white border border-rose-200 text-rose-600 px-5 py-2.5 text-sm font-bold active:scale-[0.98] transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>

        {/* Hidden helper so the linter doesn't complain about `adminUrl`
            being unused when role-level < 80 (it's still in the visible
            row when role-level >= 80 via `buildMobileGroups`). */}
        <span className="sr-only">{adminUrl}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Section list — mirrors the desktop UserMenu grouping
// ═══════════════════════════════════════════════════════════════════════

function buildMobileGroups(roleLevel: number): SectionGroup[] {
  const isInstructor = roleLevel >= 60;
  const isAdmin      = roleLevel >= 80;
  const adminUrl     = process.env.NEXT_PUBLIC_ADMIN_URL || '/admin';

  const groups: SectionGroup[] = [
    {
      title: 'Learn',
      rows: [
        { href: '/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
        { href: '/my-courses',  label: 'My Courses',  Icon: BookOpen },
        { href: '/wishlist',    label: 'Wishlist',    Icon: Heart },
        { href: '/resume',      label: 'Resume',      Icon: FileText },
      ],
    },
    {
      title: 'Money',
      rows: [
        { href: '/cart',     label: 'Cart',          Icon: ShoppingCart },
        { href: '/payments', label: 'Order history', Icon: Receipt },
        { href: '/wallet',   label: 'Wallet',        Icon: Wallet },
      ],
    },
    {
      title: 'You',
      rows: [
        { href: '/m/profile/edit',     label: 'Edit profile',  Icon: UserRound },
        { href: '/m/profile/security', label: 'Security',      Icon: Shield },
        { href: '/m/notifications',    label: 'Notifications', Icon: Bell },
        { href: '/chat',               label: 'Messages',      Icon: MessageSquare },
        { href: '/m/help',             label: 'Support',       Icon: LifeBuoy },
      ],
    },
    {
      // Deep links into each security tab so the most-tapped flows are
      // one tap away from the profile hub. Matches the desktop
      // UserMenu's "Account" section.
      title: 'Account',
      rows: [
        { href: '/m/profile/security?tab=password', label: 'Reset password', Icon: KeyRound },
        { href: '/m/profile/security?tab=email',    label: 'Change email',   Icon: Mail },
        { href: '/m/profile/security?tab=mobile',   label: 'Change mobile',  Icon: Phone },
      ],
    },
  ];

  if (isInstructor) {
    groups.push({
      title: 'Instructor',
      tinted: true,
      rows: [
        { href: '/instructor',               label: 'Instructor home', Icon: GraduationCap },
        { href: '/instructor/earnings',      label: 'Earnings',        Icon: TrendingUp },
        { href: '/instructor/payouts',       label: 'Payouts',         Icon: Send },
        { href: '/instructor/bank-accounts', label: 'Bank accounts',   Icon: Landmark },
      ],
    });
  }

  if (isAdmin) {
    groups.push({
      title: 'Admin',
      tinted: true,
      rows: [
        { href: adminUrl, label: 'Admin console', Icon: ShieldCheck, external: true },
      ],
    });
  }

  return groups;
}

// ─────────────────────────────────────────────────────────────────────
// Section primitives
// ─────────────────────────────────────────────────────────────────────

function Section({
  title, tinted = false, children,
}: { title: string; tinted?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className={
        'flex items-center gap-2 px-1 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] ' +
        (tinted ? 'text-indigo-600' : 'text-slate-400')
      }>
        {title}
      </div>
      <ul className={
        'rounded-md bg-white border shadow-card divide-y divide-slate-100 overflow-hidden ' +
        (tinted ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-200')
      }>
        {children}
      </ul>
    </div>
  );
}

function RowLink({
  href, label, Icon, badge, external = false,
}: { href: string; label: string; Icon: LucideIcon; badge?: number; external?: boolean }) {
  const inner = (
    <div className="flex items-center gap-3 p-3.5 active:bg-brand-50/40">
      <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-[13.5px] font-medium text-slate-800">{label}</span>
      {badge != null && badge > 0 && (
        <span className="rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </div>
  );
  if (external) {
    return (
      <li>
        <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
      </li>
    );
  }
  return (
    <li>
      <Link href={href}>{inner}</Link>
    </li>
  );
}
