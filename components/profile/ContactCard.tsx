'use client';

import Link from 'next/link';
import { Mail, Phone, ShieldCheck, ChevronRight } from 'lucide-react';
import type { AuthUser } from '@/lib/auth/session';

/**
 * Contact section — read-only display of the user's verified email +
 * mobile, with a CTA into the existing `/profile/security` page for
 * the OTP-gated change flows. Why not edit inline?
 *
 *   • Both fields are auth identifiers — changing them requires the
 *     existing dual-OTP flow (initiate → verify-email-otp → verify-
 *     mobile-otp → commit) which already lives in /profile/security
 *     via `lib/auth/client.ts:200-236`. Reimplementing here would
 *     duplicate sensitive code paths.
 *   • Mirrors how the admin portal's user-detail page handles it.
 */
export function ContactCard({ user }: { user: AuthUser }) {
  return (
    <div className="space-y-3">
      <Row icon={Mail}  label="Email"  value={user.email}  verifiedHint />
      <Row icon={Phone} label="Mobile" value={user.mobile} verifiedHint />
      <Link
        href="/profile/security"
        className="flex items-center gap-2 mt-3 rounded-md border border-brand-200 bg-brand-50/60 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        <ShieldCheck className="h-4 w-4" />
        <span className="flex-1">Change email, mobile or password</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Row({
  icon: Icon, label, value, verifiedHint = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; verifiedHint?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5">
      <Icon className="h-4 w-4 text-slate-500" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        <div className="text-sm text-slate-900 truncate">{value || '—'}</div>
      </div>
      {verifiedHint && value && (
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
          VERIFIED
        </span>
      )}
    </div>
  );
}
