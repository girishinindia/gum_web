'use client';

import Link from 'next/link';
import { Gift } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import { ReferralView } from '@/components/referral/ReferralView';

export default function MobileReferralsPage() {
  const { signedIn } = useAuth();
  return (
    <div className="pb-6">
      <MobilePageHeader title="Refer & earn" subtitle="Rewards" />
      {!signedIn ? (
        <div className="px-4 pt-6 text-center">
          <Gift className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-base text-slate-800">Sign in to get your referral code</p>
          <Link href="/m/login?next=/m/referrals" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Sign in</Link>
        </div>
      ) : (
        <div className="px-3 pt-3">
          <ReferralView />
        </div>
      )}
    </div>
  );
}
