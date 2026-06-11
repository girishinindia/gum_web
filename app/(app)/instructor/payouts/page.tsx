'use client';

/**
 * Instructor payouts (June 2026). Was a static mockup — now live:
 *   available balance  = confirmed earnings − already-requested amounts
 *   request form       → POST /payout-requests/me (server re-validates the cap)
 *   request history    → GET /payout-requests/me
 *   settlements        → GET /payout-settlements/me
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, Wallet, ArrowRight, Banknote } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  fetchMyEarningsSummary, fetchMyPayoutRequests, fetchMyPayoutSettlements,
  fetchMyBankAccounts, createMyPayoutRequest,
  type MyPayoutRequest, type MyPayoutSettlement, type MyBankAccount,
} from '@/lib/commerce';

const inr = (n?: number | string | null) => `₹${Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const REQ_CLS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-blue-50 text-blue-700',
  processing: 'bg-violet-50 text-violet-700',
  completed: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-600',
  failed: 'bg-rose-50 text-rose-600',
};

export default function PayoutsPage() {
  const { signedIn } = useAuth();
  const [confirmed, setConfirmed] = useState<number | null>(null);
  const [requests, setRequests] = useState<MyPayoutRequest[] | null>(null);
  const [settlements, setSettlements] = useState<MyPayoutSettlement[] | null>(null);
  const [accounts, setAccounts] = useState<MyBankAccount[]>([]);
  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    fetchMyEarningsSummary().then(s => setConfirmed(s.confirmed_earnings)).catch(() => setConfirmed(0));
    fetchMyPayoutRequests().then(setRequests).catch(() => setRequests([]));
    fetchMyPayoutSettlements().then(setSettlements).catch(() => setSettlements([]));
    fetchMyBankAccounts().then(a => { setAccounts(a); const p = a.find(x => x.is_primary); if (p) setBankId(String(p.id)); }).catch(() => setAccounts([]));
  }, []);

  useEffect(() => { if (signedIn) load(); }, [signedIn, load]);

  const reserved = (requests || [])
    .filter(r => !['rejected', 'cancelled', 'failed'].includes(String(r.request_status)))
    .reduce((s, r) => s + (Number(r.requested_amount) || 0), 0);
  const available = confirmed != null ? Math.max(Math.round((confirmed - reserved) * 100) / 100, 0) : null;

  async function submit() {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setMsg({ ok: false, text: 'Enter a valid amount.' }); return; }
    setBusy(true); setMsg(null);
    try {
      await createMyPayoutRequest({ requested_amount: amt, payment_method: 'bank_transfer', bank_account_id: bankId ? Number(bankId) : null });
      setMsg({ ok: true, text: 'Payout request submitted — you can track it below.' });
      setAmount('');
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not submit the request.' });
    }
    setBusy(false);
  }

  return (
    <div className="max-w-6xl">
      <Eyebrow>Payouts</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Payouts</h1>

      <div className="mt-6 grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Request card */}
        <div className="rounded-md bg-gradient-to-br from-brand-700 via-brand-600 to-accent text-white p-6 shadow-cardHover relative overflow-hidden">
          <div aria-hidden className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="text-[11px] uppercase tracking-wider opacity-90 inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Available to withdraw</div>
          <div className="mt-2 heading text-4xl">{available != null ? inr(available) : '—'}</div>
          <div className="mt-1 text-[11.5px] text-white/80">confirmed earnings {confirmed != null ? inr(confirmed) : '—'} − requested {inr(reserved)}</div>

          <div className="mt-4 space-y-2.5">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="Amount (₹)"
              className="w-full rounded-lg bg-white/15 border border-white/30 placeholder-white/60 text-white px-3.5 py-2.5 text-sm outline-none focus:border-white/60"
            />
            {accounts.length > 0 ? (
              <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="w-full rounded-lg bg-white/15 border border-white/30 text-white px-3 py-2.5 text-sm outline-none [&>option]:text-slate-900">
                <option value="">No bank account (decide later)</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.bank_name || 'Bank'} ····{String(a.account_number || '').slice(-4)}{a.is_primary ? ' · primary' : ''}</option>)}
              </select>
            ) : (
              <Link href="/instructor/bank-accounts" className="block text-[12px] text-white/90 underline">Add a bank account first →</Link>
            )}
            <button onClick={submit} disabled={busy || !available} className="w-full rounded-full bg-white text-brand-700 font-semibold py-2.5 text-sm disabled:opacity-60">
              {busy ? 'Submitting…' : 'Request payout'}
            </button>
            {msg && <p className={`text-[12px] ${msg.ok ? 'text-emerald-200' : 'text-rose-200'}`}>{msg.text}</p>}
          </div>
        </div>

        {/* Requests history */}
        <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
          <header className="px-5 py-4 border-b border-slate-200"><h2 className="heading text-lg text-slate-900">Payout requests</h2></header>
          {requests == null ? (
            <div className="p-5 space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-md bg-slate-100 animate-pulse" />)}</div>
          ) : requests.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No payout requests yet — request one once you have confirmed earnings.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <tr><th className="text-left px-5 py-3">Request</th><th className="text-left px-5 py-3">Date</th><th className="text-right px-5 py-3">Amount</th><th className="text-left px-5 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-brand-50/20">
                    <td className="px-5 py-3 font-mono text-[12px] text-slate-700">{r.request_number || `#${r.id}`}</td>
                    <td className="px-5 py-3 text-slate-700">{fmtDate(r.created_at)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900">{inr(r.requested_amount)}</td>
                    <td className="px-5 py-3">
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-bold capitalize', REQ_CLS[String(r.request_status)] || 'bg-slate-100 text-slate-600')}>{r.request_status}</span>
                      {r.review_notes && <div className="mt-0.5 text-[11px] text-slate-400">{r.review_notes}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Settlements */}
      <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        <header className="px-5 py-4 border-b border-slate-200 flex items-center gap-2"><Banknote className="h-4 w-4 text-emerald-600" /><h2 className="heading text-lg text-slate-900">Settlements</h2></header>
        {settlements == null ? (
          <div className="p-5"><div className="h-10 rounded-md bg-slate-100 animate-pulse" /></div>
        ) : settlements.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No settlements yet — approved payouts appear here with their transaction reference.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr><th className="text-left px-5 py-3">For request</th><th className="text-left px-5 py-3">Date</th><th className="text-right px-5 py-3">Amount</th><th className="text-left px-5 py-3">Reference</th><th className="text-left px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map(s => (
                <tr key={s.id} className="hover:bg-brand-50/20">
                  <td className="px-5 py-3 font-mono text-[12px] text-slate-700">{s.payout_requests?.request_number || '—'}</td>
                  <td className="px-5 py-3 text-slate-700">{fmtDate(s.created_at)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">{inr(s.settlement_amount)}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-slate-500">{s.transaction_reference || '—'}</td>
                  <td className="px-5 py-3"><span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-bold capitalize', REQ_CLS[String(s.settlement_status)] || 'bg-slate-100 text-slate-600')}>{s.settlement_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-[12px] text-slate-500 inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" /> Earnings confirm after the cooling period, then become available here. See your share terms on the
        <Link href="/instructor/earnings" className="text-brand-700 font-semibold hover:underline inline-flex items-center gap-0.5">earnings page <ArrowRight className="h-3 w-3" /></Link>
      </p>
      {/* keep icon imports referenced */}
      <span className="hidden"><CheckCircle2 /><XCircle /></span>
    </div>
  );
}
