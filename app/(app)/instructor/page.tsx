'use client';

/**
 * Instructor home (June 2026). KPIs and panels were a hardcoded mockup
 * ("Hi Aniket — ₹12.4L") — now live: earnings summary from
 * /instructor-earnings/me/summary, student counts from
 * /revenue-share-tiers/my-rates, and a real top-content list.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IndianRupee, Users, ArrowRight, BookOpen, Wallet, TrendingUp, Percent } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchMyEarningsSummary, type MyEarningsSummary } from '@/lib/commerce';
import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

const inr = (n?: number | null) => `₹${Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const QUICKS = [
  { href: '/instructor/earnings', label: 'Earnings', Icon: TrendingUp, desc: 'Item-wise breakdown, statuses, revenue share' },
  { href: '/instructor/payouts', label: 'Payouts', Icon: Wallet, desc: 'Request payout, view history' },
  { href: '/instructor/bank-accounts', label: 'Bank accounts', Icon: IndianRupee, desc: 'Add / manage bank details' },
];

export default function InstructorDashboard() {
  const { user, signedIn } = useAuth();
  const [summary, setSummary] = useState<MyEarningsSummary | null>(null);
  const [students, setStudents] = useState<number | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    fetchMyEarningsSummary().then(setSummary).catch(() => setSummary(null));
    const tok = getAccessToken();
    fetch(`${apiBase()}/revenue-share-tiers/my-rates`, { headers: tok ? { Authorization: `Bearer ${tok}` } : undefined, cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const total = (j?.data?.types || []).reduce((s: number, t: any) => s + (Number(t.students) || 0), 0);
        setStudents(total);
      })
      .catch(() => setStudents(null));
  }, [signedIn]);

  const firstName = (user as { first_name?: string } | null)?.first_name || 'there';
  const kpi = [
    { label: 'Total earnings', value: summary ? inr(summary.total_earnings) : '—', Icon: IndianRupee, accent: 'from-brand-500 to-brand-700' },
    { label: 'Students', value: students != null ? students.toLocaleString('en-IN') : '—', Icon: Users, accent: 'from-emerald-500 to-brand-500' },
    { label: 'Gross sales', value: summary ? inr(summary.gross_sales) : '—', Icon: TrendingUp, accent: 'from-amber-500 to-rose-500' },
    { label: 'Items selling', value: summary ? String(summary.by_item.length) : '—', Icon: BookOpen, accent: 'from-violet-500 to-brand-500' },
  ];

  return (
    <div className="max-w-7xl">
      <Eyebrow>Instructor</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Hi {firstName} — here&apos;s your snapshot</h1>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpi.map((s) => (
          <div key={s.label} className="rounded-md bg-white border border-slate-200 shadow-card p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${s.accent} text-white shadow-btn`}><s.Icon className="h-4 w-4" /></div>
            <div className="mt-3 heading text-2xl text-slate-900">{s.value}</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-5">
        {QUICKS.map((q) => (
          <Link key={q.href} href={q.href} className="group rounded-md bg-white border border-slate-200 shadow-card p-5 hover:-translate-y-1 hover:shadow-cardHover transition-all">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700"><q.Icon className="h-5 w-5" /></div>
            <h3 className="mt-4 heading text-lg text-slate-900 group-hover:text-brand-700 transition-colors">{q.label}</h3>
            <p className="mt-1 text-[12.5px] text-slate-600">{q.desc}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700">Open <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" /></div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6 items-start">
        {/* Top content by earnings — live */}
        <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
          <h2 className="heading text-lg text-slate-900">Top content by earnings</h2>
          {summary == null ? (
            <div className="mt-4 h-32 rounded-md bg-slate-100 animate-pulse" />
          ) : summary.by_item.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No sales yet — your earnings per course/bundle/batch/webinar will appear here.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {summary.by_item.slice(0, 5).map((i) => (
                <li key={`${i.item_type}:${i.item_id}`} className="py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{i.name || `${i.item_type} #${i.item_id}`}</div>
                    <div className="text-[11px] text-slate-500 capitalize">{i.item_type} · {i.sales} sale{i.sales === 1 ? '' : 's'}</div>
                  </div>
                  <div className="text-sm font-bold text-brand-700 shrink-0">{inr(i.earning)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Status breakdown — live */}
        <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
          <h2 className="heading text-lg text-slate-900 inline-flex items-center gap-2"><Percent className="h-4 w-4 text-brand-600" /> Earnings by status</h2>
          {summary == null ? (
            <div className="mt-4 h-32 rounded-md bg-slate-100 animate-pulse" />
          ) : (
            <ul className="mt-3 space-y-2.5 text-sm">
              {[
                { label: 'Pending (cooling period)', value: summary.pending_earnings, cls: 'text-amber-700 bg-amber-50' },
                { label: 'Confirmed (payable)', value: summary.confirmed_earnings, cls: 'text-blue-700 bg-blue-50' },
                { label: 'Paid out', value: summary.paid_earnings, cls: 'text-emerald-700 bg-emerald-50' },
                { label: 'Reversed (refunds)', value: summary.reversed_earnings, cls: 'text-rose-700 bg-rose-50' },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="font-bold text-slate-900">{inr(row.value)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/instructor/payouts" className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-700 hover:underline">Request a payout <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </div>
    </div>
  );
}
