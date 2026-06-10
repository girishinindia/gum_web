'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, BookOpen, Heart, FileText,
  ShoppingCart, Receipt, Wallet,
  UserRound, Shield, Bell, MessagesSquare, LifeBuoy, Gift,
  GraduationCap, TrendingUp, Send, Landmark,
  ShieldCheck, KeyRound, Mail, Phone,
  LogOut, ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/cn';

/**
 * Signed-in user pill + grouped dropdown.
 *
 * Sits in HeaderShell's right-side action cluster (and the MobileDrawer)
 * in place of the "Login" button when `useAuth().signedIn === true`.
 *
 * Layout
 *   • Section LEARN    — Dashboard, My Courses, Wishlist, Resume
 *   • Section MONEY    — Cart, Order history, Wallet
 *   • Section YOU      — Edit profile, Security, Notifications, Messages, Support
 *   • Section INSTRUCTOR  (only when `max_role_level >= 60`)
 *                      — Instructor home, Earnings, Payouts, Bank accounts
 *   • Section ADMIN    (only when `max_role_level >= 80`)
 *                      — link to admin portal (separate Next.js app)
 *   • Footer           — destructive "Log out" → POST /auth/logout +
 *                        clears the three gum.auth.* localStorage keys
 *                        + router.replace('/login')
 *
 * Behaviour
 *   • Closes on outside-click, Escape, and any item tap.
 *   • Avatar is the first letter of the user's name (or email local-part).
 *   • Display name is hidden under `sm:` so the avatar alone fills the
 *     space the Login pill used to take on narrow viewports.
 *   • Section headers are tiny uppercase eyebrows matching the rest of
 *     the chrome.
 */
export function UserMenu({ className }: { className?: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape so the menu behaves like a real popover.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const fullName    = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  const displayName = user.display_name || fullName || user.email?.split('@')[0] || 'User';
  const initial     = displayName.charAt(0).toUpperCase();
  // Phase 43.11 — when the user uploads a new profile photo from the
  // /profile editor, `IdentityCard.onAvatarUpdated` mirrors the new URL
  // into AuthProvider via `updateUser({ profile_image_url })`. We pick
  // it up here so the header pill (and the dropdown's identity header)
  // re-render with the actual photo instead of the initial-letter
  // placeholder.
  const avatarUrl = user.profile_image_url ?? null;

  // Role gates — `max_role_level` is populated by `/users/me` (see
  // AuthProvider.enrichWithMe). Roles tier:
  //   guest 0 · student 20 · moderator 40 · faculty 60 · admin 80 · super 100
  const roleLevel    = user.max_role_level ?? 0;
  const isInstructor = roleLevel >= 60;
  const isAdmin      = roleLevel >= 80;

  async function onSignOut() {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
    } finally {
      setBusy(false);
      setOpen(false);
      // Replace (not push) so the back button doesn't bring the user
      // back into a now-unauthed page that'd just bounce to /login.
      router.replace('/login');
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 backdrop-blur-sm pl-1 pr-3 py-1 shadow-sm hover:shadow-md hover:border-brand-200 transition-all',
          open && 'border-brand-300 shadow-md',
        )}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar
          // URLs may be CDN/Bunny.net signed paths that we don't want to
          // proxy through next/image's loader.
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover shadow-btn"
            onError={(e) => {
              // Fall back to the initial-letter pill if the image fails
              // (e.g. CDN cold cache, expired signature). We hide the
              // broken <img> and let the user's next reload swap it
              // back in.
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-sm font-bold flex items-center justify-center shadow-btn">
            {initial}
          </span>
        )}
        <span className="hidden sm:inline text-sm font-semibold text-slate-800 max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-slate-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-md border border-slate-200/70 bg-white shadow-cardHover overflow-hidden z-50 max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
          {/* Identity header — gradient tint so the user sees their name
              + email reinforced. Avoids any "wait, whose dropdown is this?"
              moment. */}
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-brand-50/60 to-white">
            <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
            <div className="text-[11.5px] text-slate-500 truncate">{user.email}</div>
            {/* Role chip — only when the user holds an elevated role.
                Quick visual confirmation of what they can do. */}
            {isInstructor && (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 text-[10px] font-bold">
                <GraduationCap className="h-3 w-3" />
                {isAdmin ? 'Admin' : 'Instructor'}
              </div>
            )}
          </div>

          {/* LEARN */}
          <Section title="Learn">
            <MenuLink href="/dashboard"   icon={LayoutDashboard} label="Dashboard"  onClose={() => setOpen(false)} />
            <MenuLink href="/my-courses"  icon={BookOpen}        label="My Courses" onClose={() => setOpen(false)} />
            <MenuLink href="/wishlist"    icon={Heart}           label="Wishlist"   onClose={() => setOpen(false)} />
            <MenuLink href="/referrals"   icon={Gift}            label="Refer & earn" onClose={() => setOpen(false)} />
            <MenuLink href="/resume"      icon={FileText}        label="Resume"     onClose={() => setOpen(false)} />
          </Section>

          {/* MONEY */}
          <Section title="Money">
            <MenuLink href="/cart"     icon={ShoppingCart} label="Cart"          onClose={() => setOpen(false)} />
            <MenuLink href="/payments" icon={Receipt}      label="Order history" onClose={() => setOpen(false)} />
            <MenuLink href="/wallet"   icon={Wallet}       label="Wallet"        onClose={() => setOpen(false)} />
          </Section>

          {/* YOU */}
          <Section title="You">
            <MenuLink href="/profile"          icon={UserRound}     label="Edit profile"  onClose={() => setOpen(false)} />
            <MenuLink href="/profile/security" icon={Shield}        label="Security"      onClose={() => setOpen(false)} />
            <MenuLink href="/notifications"    icon={Bell}          label="Notifications" onClose={() => setOpen(false)} />
            <MenuLink href="/chat"             icon={MessagesSquare} label="Messages"     onClose={() => setOpen(false)} />
            <MenuLink href="/support"          icon={LifeBuoy}      label="Support"       onClose={() => setOpen(false)} />
          </Section>

          {/* ACCOUNT — deep links to each security flow. The plain
              "Security" item above lands on the overview page; these
              items jump straight to the matching tab so common flows
              are one click away from the menu. */}
          <Section title="Account">
            <MenuLink href="/profile/security?tab=password" icon={KeyRound} label="Reset password" onClose={() => setOpen(false)} />
            <MenuLink href="/profile/security?tab=email"    icon={Mail}     label="Change email"   onClose={() => setOpen(false)} />
            <MenuLink href="/profile/security?tab=mobile"   icon={Phone}    label="Change mobile"  onClose={() => setOpen(false)} />
          </Section>

          {/* INSTRUCTOR — only when role allows. Tinted background so the
              section reads as a distinct "mode" the user has access to. */}
          {isInstructor && (
            <Section title="Instructor" tinted>
              <MenuLink href="/instructor"                icon={GraduationCap} label="Instructor home" onClose={() => setOpen(false)} />
              <MenuLink href="/instructor/earnings"       icon={TrendingUp}    label="Earnings"        onClose={() => setOpen(false)} />
              <MenuLink href="/instructor/payouts"        icon={Send}          label="Payouts"         onClose={() => setOpen(false)} />
              <MenuLink href="/instructor/bank-accounts"  icon={Landmark}      label="Bank accounts"   onClose={() => setOpen(false)} />
            </Section>
          )}

          {/* ADMIN — link out to the separate admin Next.js app. */}
          {isAdmin && (
            <Section title="Admin" tinted>
              <MenuLink
                href={process.env.NEXT_PUBLIC_ADMIN_URL || '/admin'}
                icon={ShieldCheck}
                label="Admin console"
                external
                onClose={() => setOpen(false)}
              />
            </Section>
          )}

          {/* Sign-out — destructive, visually separated. */}
          <div className="border-t border-slate-100">
            <button
              type="button"
              onClick={onSignOut}
              disabled={busy}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-60"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              {busy ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────

function Section({
  title, children, tinted = false,
}: { title: string; children: React.ReactNode; tinted?: boolean }) {
  return (
    <div className={cn('border-t border-slate-100', tinted && 'bg-indigo-50/30')}>
      <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {title}
      </div>
      <ul className="pb-1">{children}</ul>
    </div>
  );
}

function MenuLink({
  href, icon: Icon, label, external = false, onClose,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
  onClose: () => void;
}) {
  const inner = (
    <>
      <Icon className="h-4 w-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
      <span className="flex-1 truncate">{label}</span>
    </>
  );
  const className =
    'group flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors';
  if (external) {
    return (
      <li>
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClose} className={className} role="menuitem">
          {inner}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link href={href} onClick={onClose} className={className} role="menuitem">
        {inner}
      </Link>
    </li>
  );
}
