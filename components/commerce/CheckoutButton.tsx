'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { checkoutConfig, checkoutInitiate, checkoutVerify, invalidateEnrollments } from '@/lib/commerce';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { Razorpay?: any } }

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Razorpay checkout: initiate an order from the cart, open the modal, verify
 *  the signature on success, then land on My Courses. */
export function CheckoutButton({ basePath = '', label = 'Proceed to checkout', disabled }: { basePath?: '' | '/m'; label?: string; disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function pay() {
    if (busy) return;
    setBusy(true); setErr(null);
    try {
      const [cfg, order, ok] = await Promise.all([checkoutConfig(), checkoutInitiate(), loadRazorpay()]);
      if (!ok || !window.Razorpay) throw new Error('Could not load the payment gateway.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = order as any;
      const orderId = o?.razorpay_order_id ?? o?.order?.razorpay_order_id ?? o?.order_id ?? o?.id;
      if (!orderId) throw new Error('Could not create the order.');
      const rzp = new window.Razorpay({
        key: cfg.keyId,
        currency: cfg.currency || 'INR',
        order_id: orderId,
        name: 'GrowUpMore',
        description: 'Course enrollment',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (resp: any) => {
          try {
            await checkoutVerify({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            invalidateEnrollments();
            router.push(`${basePath}/my-courses`);
          } catch {
            setErr('Payment received but verification failed — please contact support.');
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Checkout failed.');
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={pay}
        disabled={busy || disabled}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold py-2.5 shadow-btn active:scale-[0.99] transition-all disabled:opacity-70"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {busy ? 'Processing…' : label}
      </button>
      {err && <p className="mt-2 text-[12px] text-rose-600">{err}</p>}
      <div className="mt-3 flex items-start gap-2 text-[11.5px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Secure payments — PCI compliant via Razorpay.</div>
    </div>
  );
}
