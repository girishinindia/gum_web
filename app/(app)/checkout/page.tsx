'use client';

/**
 * Checkout — order review (Phase 6, June 2026).
 *
 * Previously a static mockup (hardcoded "Anjali Sharma" + fake totals, dead
 * Pay button). Now wired to the real commerce flow used by the cart page:
 * fetchCart/guest-cart → authoritative /checkout/preview totals (inside
 * CartSummary) → CheckoutButton (Razorpay modal → /checkout/verify).
 * Card details are collected by Razorpay's PCI-DSS-compliant modal, so this
 * page intentionally has no billing/payment-method form of its own.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchCart, mergeGuestCart, getGuestCart, type CommerceType } from '@/lib/commerce';
import { CartSummary } from '@/components/commerce/CartSummary';

const inr = (n?: number | null) => `₹${Math.round(Number(n ?? 0)).toLocaleString('en-IN')}`;

interface Row { key: string; item_type: CommerceType; item_id: number; title: string; price: number; original?: number | null; isFree?: boolean; thumbnail?: string | null }

export default function CheckoutPage() {
  const { user, signedIn } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (signedIn && user) {
      mergeGuestCart()
        .then(() => fetchCart(user.id))
        .then((server) => setRows(server.map((r) => ({ key: `srv:${r.id}`, item_type: r.item_type, item_id: r.item_id, title: r.item?.title || `${r.item_type} #${r.item_id}`, price: Number(r.item?.price ?? r.price ?? 0), original: r.item?.original_price, isFree: r.item?.is_free, thumbnail: r.item?.thumbnail_url }))))
        .catch(() => setRows([]));
    } else {
      setRows(getGuestCart().map((x) => ({ key: `${x.item_type}:${x.item_id}`, item_type: x.item_type, item_id: x.item_id, title: x.title || `${x.item_type} #${x.item_id}`, price: Number(x.price ?? 0), original: x.original_price, isFree: x.is_free, thumbnail: x.thumbnail_url })));
    }
  }, [signedIn, user]);

  const items = rows ?? [];
  const subtotal = items.reduce((s, i) => s + (i.isFree ? 0 : i.price), 0);

  return (
    <div className="max-w-6xl mx-auto pt-6 sm:pt-10">
      <h1 className="heading text-3xl text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">
        {rows == null ? 'Loading…' : `${items.length} item${items.length === 1 ? '' : 's'} in your order`}
      </p>

      {rows == null ? (
        <div className="mt-6 space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-md bg-white border border-slate-200 p-10 text-center">
          <ShoppingCart className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-lg text-slate-800">Nothing to check out</p>
          <p className="mt-1 text-sm text-slate-500">Add a course to your cart first.</p>
          <Link href="/courses" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Browse courses</Link>
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-4">
            <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
              <h2 className="heading text-base text-slate-900">Review your order</h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {items.map((i) => (
                  <li key={i.key} className="py-3 flex items-center gap-4">
                    <div className="h-12 w-20 rounded-md bg-gradient-to-br from-brand-700 to-brand-500 shrink-0 overflow-hidden">
                      {i.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={i.thumbnail} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{i.title}</div>
                      <div className="text-[12px] text-slate-500 capitalize">{i.item_type} · lifetime access</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="heading text-sm text-slate-900">{i.isFree ? 'Free' : inr(i.price)}</div>
                      {i.original ? <div className="text-[11px] text-slate-400 line-through">{inr(i.original)}</div> : null}
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/cart" className="mt-3 inline-block text-[12.5px] text-brand-700 font-semibold hover:underline">Edit cart</Link>
            </div>

            {!signedIn && (
              <div className="rounded-md bg-white border border-slate-200 shadow-card p-5 flex items-start gap-3">
                <LogIn className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Sign in to pay</div>
                  <p className="mt-0.5 text-[12.5px] text-slate-500">Your cart is saved — sign in and these items come with you.</p>
                  <Link href="/login?next=/checkout" className="mt-2 inline-flex rounded-full bg-brand-600 text-white px-4 py-2 text-[12.5px] font-semibold">Sign in</Link>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[11.5px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Payments are processed by Razorpay — encrypted &amp; PCI-DSS compliant
            </div>
          </div>

          <div className="space-y-3">
            <CartSummary basePath="" signedIn={signedIn} clientSubtotal={subtotal} />
            <div className="flex items-start gap-2 text-[11.5px] text-slate-600 bg-success/10 text-success rounded-sm px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" /> Lifetime access · 7-day refund · Verified certificate
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
