'use client';

import { useEffect, useState, type ElementType } from 'react';
import { Gift, Copy, Share2, Check, Users, Trophy, IndianRupee, Loader2 } from 'lucide-react';
import {
  fetchMyReferral, fetchMyReferralUsages, fetchMyReferralRewards,
  type MyReferral, type ReferralUsage, type ReferralReward,
} from '@/lib/referral';

function Stat({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3 text-center">
      <Icon className="h-4 w-4 mx-auto text-brand-500" />
      <div className="mt-1 heading text-lg text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

/** Refer & earn: my code + share, headline stats, referrals, and rewards. */
export function ReferralView() {
  const [data, setData] = useState<MyReferral | null>(null);
  const [usages, setUsages] = useState<ReferralUsage[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchMyReferral().then(setData).catch((e) => setErr(e instanceof Error ? e.message : 'Could not load your referral')).finally(() => setLoading(false));
    fetchMyReferralUsages().then(setUsages).catch(() => {});
    fetchMyReferralRewards().then(setRewards).catch(() => {});
  }, []);

  const shareUrl = data ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${data.referral_code}` : '';

  async function copy() {
    if (!data) return;
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }
  async function share() {
    if (!data) return;
    const text = `Join Grow Up More with my code ${data.referral_code} and get a discount on your first course!`;
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) await (navigator as Navigator).share({ title: 'Grow Up More', text, url: shareUrl });
      else copy();
    } catch { /* user cancelled */ }
  }

  if (loading) return <div className="py-10 text-center text-slate-400 text-sm inline-flex items-center gap-2 w-full justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  if (err || !data) return <div className="py-10 text-center text-slate-500 text-sm">{err || 'Referral unavailable.'}</div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5">
        <div className="inline-flex items-center gap-2 text-brand-700 font-semibold text-sm"><Gift className="h-4 w-4" /> Refer &amp; earn</div>
        <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">Share your code — your friend gets {data.discount_percentage ?? 10}% off their first order, and you earn a reward when they enroll.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[150px] rounded-lg border border-dashed border-brand-300 bg-white px-3 py-2.5 font-mono text-base tracking-wider text-slate-900">{data.referral_code}</div>
          <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-700 hover:border-brand-300">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy link'}
          </button>
          <button onClick={share} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white px-3 py-2 text-[13px] font-semibold"><Share2 className="h-4 w-4" /> Share</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Users} label="Referrals" value={String(data.stats.total_referrals)} />
        <Stat icon={Trophy} label="Successful" value={String(data.stats.successful_referrals)} />
        <Stat icon={IndianRupee} label="Earned" value={`₹${Math.round(data.stats.total_earnings).toLocaleString('en-IN')}`} />
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-2">Your referrals</h3>
        {usages.length === 0 ? (
          <p className="text-[13px] text-slate-400">No referrals yet — share your code to get started.</p>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
            {usages.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 text-[13px]">
                <span className="text-slate-800">{u.referred_user_name}</span>
                <span className="text-slate-500 capitalize">{(u.usage_status || '').replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {rewards.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Your reward earnings</h3>
          <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
            {rewards.map((r) => {
              const when = r.credited_at || r.created_at;
              return (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 text-[13px]">
                  <div className="min-w-0">
                    <span className="text-emerald-700 font-semibold">+ ₹{Math.round(Number(r.reward_amount)).toLocaleString('en-IN')}</span>
                    <span className="ml-2 text-[11px] text-slate-400 capitalize">{(r.reward_type || '').replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-500 capitalize">{r.status}</span>
                    {when && <div className="text-[10.5px] text-slate-400">{new Date(when).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11.5px] text-slate-500">
            Credited rewards land in your <a href="/wallet" className="text-brand-700 font-semibold hover:underline">GUM Wallet</a>.
          </p>
        </div>
      )}
    </div>
  );
}
