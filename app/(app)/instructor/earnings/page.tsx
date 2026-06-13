'use client';

/**
 * Instructor earnings (June 2026). Was a static FY mockup (₹82.5L etc.) —
 * now live from /instructor-earnings/me + /me/summary. Keeps the
 * RevenueShareTerms panel (current slab, student counts, discount rules).
 */

import { useEffect, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { RevenueShareTerms } from '@/components/app/RevenueShareTerms';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchMyEarnings, fetchMyEarningsSummary, type MyEarning, type MyEarningsSummary } from '@/lib/commerce';
import { cn } from '@/lib/cn';

const inr = (n?: number | string | null) => `₹${Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const STATUS_CLS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  paid: 'bg-emerald-50 text-emerald-700',
  reversed: 'bg-rose-50 text-rose-600',
};

export default function EarningsPage() {
  const { signedIn } = useAuth();
  const [summary, setSummary] = useState<MyEarningsSummary | null>(null);
  const [rows, setRows] = useState<MyEarning[] | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!signedIn) return;
    fetchMyEarningsSummary().then(setSummary).catch(() => setSummary(null));
  }, [signedIn]);

  useEffect(() => {
    if (!signedIn) return;
    setRows(null);
    fetchMyEarnings(1, 50, status || undefined).then(setRows).catch(() => setRows([]));
  }, [signedIn, status]);

  const cards = [
    { label: 'Gross sales', value: summary ? inr(summary.gross_sales) : '—' },
    { label: 'Your share (total)', value: summary ? inr(summary.total_earnings) : '—' },
    { label: 'Confirmed (payable)', value: summary ? inr(summary.confirmed_earnings) : '—' },
    { label: 'Paid out', value: summary ? inr(summary.paid_earnings) : '—' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <Eyebrow>Earnings</Eyebrow>
        <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Your earnings</h1>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((s) => (
          <div key={s.label} className="rounded-md bg-white border border-slate-200 shadow-card p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
            <div className="mt-1 heading text-2xl text-gradient">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Live revenue-share terms */}
      <RevenueShareTerms />

      {/* By content item */}
      <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        <header className="px-5 py-4 border-b border-slate-200">
          <h2 className="heading text-lg text-slate-900">By content</h2>
        </header>
        {summary == null ? (
          <div className="p-5"><div className="h-20 rounded-md bg-slate-100 animate-pulse" /></div>
        ) : summary.by_item.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No sales yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-5 py-3">Item</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-right px-5 py-3">Sales</th>
                <th className="text-right px-5 py-3">Gross</th>
                <th className="text-right px-5 py-3">Your earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.by_item.map((i) => (
                <tr key={`${i.item_type}:${i.item_id}`} className="hover:bg-brand-50/20">
                  <td className="px-5 py-3 font-semibold text-slate-900">{i.name || `#${i.item_id}`}</td>
                  <td className="px-5 py-3 capitalize text-slate-600">{i.item_type}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{i.sales}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{inr(i.gross)}</td>
                  <td className="px-5 py-3 text-right font-bold text-brand-700">{inr(i.earning)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Earning records */}
      <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        <header className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <h2 className="heading text-lg text-slate-900">Earning records</h2>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
            <option value="reversed">Reversed</option>
          </select>
        </header>
        {rows == null ? (
          <div className="p-5 space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-md bg-slate-100 animate-pulse" />)}</div>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No earnings{status ? ` with status "${status}"` : ' yet'} — they appear automatically when your content sells.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Full amount</th>
                <th className="text-right px-5 py-3">Share</th>
                <th className="text-right px-5 py-3">Earning</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-brand-50/20">
                  <td className="px-5 py-3 font-mono text-[12px] text-slate-700">{r.orders?.order_number || `#${r.order_id}`}</td>
                  <td className="px-5 py-3 text-slate-700">{r.student ? (r.student.full_name || [r.student.first_name, r.student.last_name].filter(Boolean).join(' ') || '—') : '—'}</td>
                  <td className="px-5 py-3 text-slate-700">{fmtDate(r.created_at)}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{inr(r.order_amount)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{Number(r.instructor_share) || 0}%</td>
                  <td className="px-5 py-3 text-right font-bold text-brand-700">{inr(r.earning_amount)}</td>
                  <td className="px-5 py-3"><span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-bold capitalize', STATUS_CLS[r.earning_status || ''] || 'bg-slate-100 text-slate-600')}>{r.earning_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
