'use client';

/**
 * Wallet (June 2026). Previously a static mockup — fake "₹10,701" and invented
 * transactions. Now live via the new self-service endpoints:
 *   GET /wallets/me              → own wallet (auto-created on first visit)
 *   GET /wallets/me/transactions → own history, newest first
 * Earnings (instructors), refunds and referral rewards all land here.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Gift, Wallet, Snowflake, LogIn } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchMyWallet, fetchMyWalletTransactions, type MyWallet, type WalletTxn } from '@/lib/commerce';

const inr = (n?: number | string | null) =>
  `₹${Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SOURCE_LABEL: Record<string, string> = {
  earning: 'Instructor earning',
  referral_reward: 'Referral reward',
  refund: 'Refund',
  order_payment: 'Order payment',
  payout: 'Payout',
  manual_credit: 'Credit by support',
  manual_debit: 'Debit by support',
  welcome: 'Welcome credit',
};

function txnTitle(t: WalletTxn): string {
  if (t.description) return t.description;
  const src = t.source_type ? SOURCE_LABEL[t.source_type] || t.source_type.replace(/_/g, ' ') : null;
  return src || (t.transaction_type === 'credit' ? 'Credit' : 'Debit');
}

function fmtDate(d?: string): string {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function WalletPage() {
  const { signedIn, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<MyWallet | null>(null);
  const [txns, setTxns] = useState<WalletTxn[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    Promise.all([fetchMyWallet(), fetchMyWalletTransactions(1, 50)])
      .then(([w, t]) => { setWallet(w); setTxns(t); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your wallet.'));
  }, [signedIn]);

  if (!authLoading && !signedIn) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mt-10 rounded-md bg-white border border-slate-200 p-10 text-center">
          <LogIn className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-lg text-slate-800">Sign in to see your wallet</p>
          <Link href="/login?next=/wallet" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Eyebrow>Wallet</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Your GUM Wallet</h1>

      {/* Balance card */}
      <div className="mt-6 rounded-md bg-gradient-to-br from-brand-700 via-brand-600 to-accent text-white p-6 shadow-cardHover relative overflow-hidden">
        <div aria-hidden className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="text-[11px] uppercase tracking-wider opacity-90">Available balance</div>
        <div className="mt-2 heading text-5xl">{wallet ? inr(wallet.balance) : '—'}</div>
        {wallet?.is_frozen && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/30 px-3 py-1 text-[12px] font-semibold">
            <Snowflake className="h-3.5 w-3.5" /> Wallet frozen{wallet.frozen_reason ? ` — ${wallet.frozen_reason}` : ''}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[12.5px]">
          {wallet?.total_credited != null && <span className="opacity-90">Total credited: <b>{inr(wallet.total_credited)}</b></span>}
          {wallet?.total_debited != null && <span className="opacity-90">Total debited: <b>{inr(wallet.total_debited)}</b></span>}
          <Link href="/referrals" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-1.5 font-semibold transition-colors">
            <Gift className="h-4 w-4" /> Refer &amp; earn
          </Link>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-8">
        <h2 className="heading text-lg text-slate-900">Transactions</h2>

        {error ? (
          <div className="mt-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4">{error}</div>
        ) : txns == null ? (
          <div className="mt-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
        ) : txns.length === 0 ? (
          <div className="mt-4 rounded-md bg-white border border-slate-200 p-10 text-center">
            <Wallet className="h-8 w-8 mx-auto text-slate-300" />
            <p className="mt-3 heading text-lg text-slate-800">No transactions yet</p>
            <p className="mt-1 text-sm text-slate-500">Earnings, refunds and referral rewards will show up here.</p>
          </div>
        ) : (
          <div className="mt-4 rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100">
            {txns.map((t) => (
              <div key={t.id} className="p-4 flex items-center gap-4">
                <div className={cn(
                  'h-10 w-10 rounded-md flex items-center justify-center shrink-0',
                  t.transaction_type === 'credit' ? 'bg-success/15 text-success' : 'bg-rose-50 text-rose-600',
                )}>
                  {t.transaction_type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{txnTitle(t)}</div>
                  <div className="text-[11.5px] text-slate-500">
                    {fmtDate(t.created_at)}
                    {t.balance_after != null && <> · balance {inr(t.balance_after)}</>}
                  </div>
                </div>
                <div className={cn('font-semibold text-sm shrink-0', t.transaction_type === 'credit' ? 'text-success' : 'text-slate-900')}>
                  {t.transaction_type === 'credit' ? '+ ' : '– '}{inr(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
