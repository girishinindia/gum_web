'use client';

/**
 * Payments / order history (June 2026). Was a static mockup with invented
 * orders — now live from the new self-scoped GET /orders/me.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, FileText, LogIn, RotateCcw } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchMyOrders, type MyOrder } from '@/lib/commerce';

const inr = (n?: number | string | null) => `₹${Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const STATUS: Record<string, { label: string; Icon: any; cls: string }> = {
  paid:      { label: 'Paid',      Icon: CheckCircle2, cls: 'bg-success/15 text-success' },
  unpaid:    { label: 'Unpaid',    Icon: Clock,        cls: 'bg-amber-50 text-amber-700' },
  pending:   { label: 'Pending',   Icon: Clock,        cls: 'bg-amber-50 text-amber-700' },
  failed:    { label: 'Failed',    Icon: XCircle,      cls: 'bg-rose-50 text-rose-600' },
  refunded:  { label: 'Refunded',  Icon: RotateCcw,    cls: 'bg-slate-100 text-slate-600' },
  partially_refunded: { label: 'Partial refund', Icon: RotateCcw, cls: 'bg-slate-100 text-slate-600' },
};

export default function PaymentsPage() {
  const { signedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    fetchMyOrders(1, 50)
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your orders.'));
  }, [signedIn]);

  if (!authLoading && !signedIn) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mt-10 rounded-md bg-white border border-slate-200 p-10 text-center">
          <LogIn className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-lg text-slate-800">Sign in to see your payments</p>
          <Link href="/login?next=/payments" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Sign in</Link>
        </div>
      </div>
    );
  }

  const list = orders ?? [];
  const paidOrders = list.filter(o => o.payment_status === 'paid');
  const lifetime = paidOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <Eyebrow>Payment history</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Payments</h1>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Lifetime spent', value: inr(lifetime) },
          { label: 'Orders', value: String(list.length) },
          { label: 'Successful', value: String(paidOrders.length) },
          { label: 'Other status', value: String(list.length - paidOrders.length) },
        ].map((s) => (
          <div key={s.label} className="rounded-md bg-white border border-slate-200 shadow-card p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
            <div className="mt-1 heading text-2xl text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="mt-6 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4">{error}</div>
      ) : orders == null ? (
        <div className="mt-6 space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
      ) : list.length === 0 ? (
        <div className="mt-6 rounded-md bg-white border border-slate-200 p-10 text-center">
          <FileText className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-lg text-slate-800">No orders yet</p>
          <p className="mt-1 text-sm text-slate-500">Your purchases and their payment status will appear here.</p>
          <Link href="/courses" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Browse courses</Link>
        </div>
      ) : (
        <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Items</th>
                <th className="text-left px-5 py-3">Code</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((o) => {
                const s = STATUS[o.payment_status || ''] || STATUS.pending;
                const itemCount = o.order_items?.length || 0;
                return (
                  <tr key={o.id} className="hover:bg-brand-50/20">
                    <td className="px-5 py-3 font-mono text-[12px] text-slate-700">{o.order_number || `#${o.id}`}</td>
                    <td className="px-5 py-3 text-slate-700">{fmtDate(o.created_at)}</td>
                    <td className="px-5 py-3 text-slate-700">{itemCount} item{itemCount === 1 ? '' : 's'}{o.discount_amount && Number(o.discount_amount) > 0 ? <span className="ml-2 text-[11px] text-emerald-600">−{inr(o.discount_amount)}</span> : null}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">{o.coupon_code || o.promo_code || '--'}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900">{inr(o.total_amount)}</td>
                    <td className="px-5 py-3"><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold', s.cls)}><s.Icon className="h-3 w-3" /> {s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
