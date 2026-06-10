'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, X, LogIn, CheckCircle2 } from 'lucide-react';
import { CheckoutButton } from './CheckoutButton';
import { checkoutPreview, type CheckoutPreview } from '@/lib/commerce';

const inr = (n?: number | null) => `₹${Math.round(Number(n ?? 0)).toLocaleString('en-IN')}`;

/**
 * Order-summary panel for the cart. When signed in it drives the totals from
 * the authoritative /checkout/preview (so the displayed total matches what the
 * user actually pays) and exposes a coupon/promo input; the applied code flows
 * into the Razorpay order. Guests see the subtotal + a sign-in CTA.
 *
 * Coupon UX: the input stays editable even after a coupon is applied, so the
 * user can replace it directly (type a new code → Replace). Re-entering the
 * same code is acknowledged, not blocked; invalid/expired codes show a clear
 * message and totals always recompute.
 */
export function CartSummary({ basePath = '', signedIn, clientSubtotal }: { basePath?: '' | '/m'; signedIn: boolean; clientSubtotal: number }) {
  const router = useRouter();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState(false);

  function refresh(coupon?: string | null) {
    if (!signedIn) return;
    setBusy(true);
    checkoutPreview({ coupon_code: coupon === undefined ? applied : coupon })
      .then((p) => {
        setPreview(p);
        if (coupon !== undefined) {
          if (!coupon) {
            // coupon removed
            setApplied(null);
            setMsg(null);
          } else if (p.coupon && p.coupon.valid === false) {
            setApplied(null);
            setMsgOk(false);
            setMsg(p.coupon.message || 'This coupon is not valid for your cart.');
          } else {
            const c = (p.coupon && p.coupon.code) || coupon;
            setApplied(c);
            setCode('');
            setMsgOk(true);
            setMsg(`Coupon ${c} applied.`);
          }
        }
      })
      .catch((e) => {
        if (coupon !== undefined) { setMsgOk(false); setMsg(e instanceof Error ? e.message : 'Could not apply coupon. Please try again.'); }
      })
      .finally(() => setBusy(false));
  }

  function onApply() {
    const c = code.trim();
    if (!c) return;
    if (applied && c.toUpperCase() === applied.toUpperCase()) {
      setMsgOk(true);
      setMsg('This coupon is already applied.');
      return;
    }
    refresh(c); // validates + replaces any existing coupon
  }

  function onRemove() {
    setCode('');
    setMsg(null);
    refresh(null);
  }

  useEffect(() => { if (signedIn) refresh(undefined); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [signedIn]);

  const subtotal = preview?.subtotal ?? clientSubtotal;
  const discount = preview?.discount_amount ?? 0;
  const total = preview?.total ?? clientSubtotal;

  return (
    <aside className="rounded-md bg-white border border-slate-200 shadow-cardHover p-5 lg:sticky lg:top-24 self-start">
      <h2 className="heading text-lg text-slate-900">Order summary</h2>

      {signedIn && (
        <div className="mt-4">
          {applied && (
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-[13px] mb-2">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold"><CheckCircle2 className="h-4 w-4" /> {applied} applied</span>
              <button aria-label="Remove coupon" onClick={onRemove} disabled={busy} className="text-slate-400 hover:text-slate-600 disabled:opacity-50"><X className="h-4 w-4" /></button>
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 focus-within:border-brand-400">
              <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setMsg(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onApply(); } }}
                placeholder={applied ? 'Enter a different code' : 'Coupon / promo code'}
                className="flex-1 py-2 text-[13px] outline-none uppercase placeholder:normal-case placeholder:text-slate-400"
              />
            </div>
            <button onClick={onApply} disabled={busy || !code.trim()} className="rounded-lg bg-slate-900 text-white px-3.5 text-[13px] font-semibold disabled:opacity-50">{busy ? '…' : applied ? 'Replace' : 'Apply'}</button>
          </div>
          {msg && <p className={`mt-1.5 text-[11.5px] ${msgOk ? 'text-emerald-600' : 'text-rose-600'}`}>{msg}</p>}
        </div>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd className="font-semibold">{inr(subtotal)}</dd></div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600"><dt>Discount{applied ? ` (${applied})` : ''}</dt><dd className="font-semibold">− {inr(discount)}</dd></div>
        )}
        <div className="flex justify-between pt-3 border-t border-slate-100 text-base"><dt className="font-semibold text-slate-900">Total</dt><dd className="heading text-slate-900">{inr(total)}</dd></div>
      </dl>

      <div className="mt-5">
        {signedIn ? (
          <CheckoutButton basePath={basePath} couponCode={applied} />
        ) : (
          <>
            <button onClick={() => router.push(`${basePath}/login?next=${encodeURIComponent(`${basePath}/cart`)}`)} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold py-2.5 shadow-btn active:scale-[0.99] transition-all">
              <LogIn className="h-4 w-4" /> Sign in to checkout
            </button>
            <p className="mt-2 text-[11.5px] text-slate-500 text-center">Sign in to apply a coupon &amp; complete payment.</p>
          </>
        )}
      </div>
    </aside>
  );
}
