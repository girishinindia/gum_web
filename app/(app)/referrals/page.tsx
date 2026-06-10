import { ReferralView } from '@/components/referral/ReferralView';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function ReferralsPage() {
  return (
    <div className="max-w-3xl mx-auto pt-6 sm:pt-10">
      <Eyebrow>Rewards</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Refer &amp; earn</h1>
      <p className="mt-1 text-sm text-slate-500">Invite friends to Grow Up More and earn rewards on every successful referral.</p>
      <div className="mt-6">
        <ReferralView />
      </div>
    </div>
  );
}
