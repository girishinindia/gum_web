'use client';

// BUG-36 (June 2026): real order receipt. Replaces the hardcoded mockup
// ("Thanks, Anjali!" / fake ₹62,538) with the caller's actual order from
// GET /orders/me/:id. GST has been removed platform-wide, so the tax line only
// renders for legacy orders that still carry a non-zero tax_amount.

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { fetchMyOrder, type MyOrder, type MyOrderItem } from '@/lib/commerce';

const inr = (v: number | string | null | undefined) =>
  `₹${Number(v ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const itemLabel = (it: MyOrderItem) => it.item_name || `${titleCase(it.item_type)} #${it.item_id}`;

export default function OrderReceiptPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [order, setOrder] = useState<MyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchMyOrder(id);
        if (!active) return;
        if (res && res.id) setOrder(res);
        else setError("We couldn't find this order.");
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load this order.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden animate-pulse">
          <div className="h-24 bg-slate-100" />
          <div className="p-7 space-y-4">
            <div className="h-4 w-1/3 bg-slate-100 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-5 w-1/2 bg-slate-100 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-md bg-white border border-slate-200 shadow-card p-8 text-center">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <h1 className="heading text-xl text-slate-900 mt-3">Order not found</h1>
          <p className="text-sm text-slate-500 mt-1">{error || "We couldn't find this order."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/payments" variant="outline" className="rounded-full">View all payments</ButtonLink>
            <ButtonLink href="/my-courses" variant="primary" className="rounded-full">Go to my courses</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const paid = order.payment_status === 'paid';
  const items = order.order_items || [];
  const discount = Number(order.discount_amount ?? 0);
  const tax = Number(order.tax_amount ?? 0);
  const code = order.coupon_code || order.promo_code || null;
  const orderRef = order.order_number || `#${order.id}`;
  const placed = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden">
        <div className={`${paid ? 'bg-gradient-to-r from-success via-success to-emerald-600' : 'bg-gradient-to-r from-slate-600 to-slate-700'} text-white p-6 flex items-center gap-4`}>
          {paid ? <CheckCircle2 className="h-10 w-10 shrink-0" /> : <Clock className="h-10 w-10 shrink-0" />}
          <div>
            <div className="text-[11px] uppercase tracking-wider opacity-90">{paid ? 'Payment successful' : `Order ${titleCase(order.payment_status || order.order_status || 'pending')}`}</div>
            <div className="heading text-2xl mt-0.5">{paid ? 'Thank you for your purchase' : 'Order summary'}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[11px] opacity-90">Order</div>
            <div className="font-mono font-bold">{orderRef}</div>
            {placed && <div className="text-[11px] opacity-80 mt-0.5">{placed}</div>}
          </div>
        </div>

        <div className="p-7 space-y-5">
          <div>
            <h2 className="heading text-lg text-slate-900">Items</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {items.length === 0 ? (
                <li className="py-3 text-sm text-slate-500">No items on this order.</li>
              ) : items.map((it) => (
                <li key={it.id} className="py-3 flex justify-between gap-4 text-sm">
                  <span className="text-slate-700">
                    {itemLabel(it)}
                    {it.quantity && it.quantity > 1 ? <span className="text-slate-400"> × {it.quantity}</span> : null}
                  </span>
                  <span className="font-semibold shrink-0">{inr(it.final_price ?? it.original_price)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount{code ? ` (${code})` : ''}</span><span>−{inr(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-slate-500"><span>GST</span><span>{inr(tax)}</span></div>
              )}
              <div className="flex justify-between heading text-lg pt-2 mt-1 border-t border-slate-200">
                <span className="text-slate-900">{paid ? 'Total paid' : 'Total'}</span>
                <span className="text-gradient">{inr(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/payments" variant="outline" className="rounded-full">View all payments</ButtonLink>
        <ButtonLink href="/my-courses" variant="primary" className="rounded-full">Go to my courses</ButtonLink>
      </div>
    </div>
  );
}
