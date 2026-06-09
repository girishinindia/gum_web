'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getGuestCart, fetchCart, CART_ADDED_EVENT } from '@/lib/commerce';
import { usePageBottomBarCount } from './BottomBarContext';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * Global commerce chrome — mounted once in the root layout so it covers the
 * desktop route groups AND the /m mobile tree.
 *
 *  • Toast — a short "Added to cart" confirmation (fired by EnrollButton via
 *    the `gum-cart-added` event). Auto-hides after ~2.6s.
 *  • Bottom strip — appears whenever the cart has ≥1 item, showing the running
 *    total + a Proceed button. Adding no longer navigates; this strip + the
 *    cart icon are the only ways into the cart.
 *
 * Count + total recompute on `gum-cart-changed` / storage / focus — from the
 * server cart when signed in, the guest cart when not. The strip hides on the
 * cart page itself, on auth pages, and while a page already owns a bottom bar
 * (mobile detail pages → MobileDetailBar).
 */
export function CartStrip() {
  const { user, signedIn } = useAuth();
  const pathname = usePathname() || '';
  const pageBars = usePageBottomBarCount();
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [toast, setToast] = useState<{ title: string | null } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMobile = pathname.startsWith('/m');
  const onCartPage = pathname === '/cart' || pathname === '/m/cart';
  const onAuthPage = pathname.includes('/login') || pathname.includes('/signup');
  const cartHref = isMobile ? '/m/cart' : '/cart';

  // ── Count + total ──────────────────────────────────────────────────
  useEffect(() => {
    let off = false;
    async function recompute() {
      if (signedIn && user) {
        try {
          const rows = await fetchCart(user.id);
          if (off) return;
          setCount(rows.length);
          setSubtotal(rows.reduce((s, r) => s + (r.item?.is_free ? 0 : Number(r.item?.price ?? r.price ?? 0)), 0));
        } catch { if (!off) { setCount(0); setSubtotal(0); } }
      } else {
        const g = getGuestCart();
        if (off) return;
        setCount(g.length);
        setSubtotal(g.reduce((s, x) => s + (x.is_free ? 0 : Number(x.price ?? 0)), 0));
      }
    }
    recompute();
    const onChange = () => recompute();
    window.addEventListener('gum-cart-changed', onChange);
    window.addEventListener('storage', onChange);
    window.addEventListener('focus', onChange);
    return () => {
      off = true;
      window.removeEventListener('gum-cart-changed', onChange);
      window.removeEventListener('storage', onChange);
      window.removeEventListener('focus', onChange);
    };
  }, [signedIn, user]);

  // ── Added toast ────────────────────────────────────────────────────
  useEffect(() => {
    const onAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail as { title?: string | null } | undefined;
      setToast({ title: detail?.title ?? null });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2600);
    };
    window.addEventListener(CART_ADDED_EVENT, onAdded);
    return () => { window.removeEventListener(CART_ADDED_EVENT, onAdded); if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showStrip = count > 0 && !onCartPage && !onAuthPage && pageBars === 0;

  return (
    <>
      {toast && (
        <div className={`fixed left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm ${isMobile ? 'top-16' : 'top-20'}`} role="status" aria-live="polite">
          <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 shadow-lg px-3.5 py-2.5">
            <span className="h-7 w-7 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check className="h-4 w-4" /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-tight">Added to cart</p>
              {toast.title && <p className="text-xs text-slate-500 truncate">{toast.title}</p>}
            </div>
            <Link href={cartHref} className="text-[13px] font-semibold text-brand-700 hover:text-brand-800 whitespace-nowrap">View cart</Link>
            <button onClick={() => setToast(null)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {showStrip && (
        <div className={`fixed inset-x-0 z-40 ${isMobile ? 'bottom-14' : 'bottom-0'}`}>
          <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]">
            <div className="mx-auto max-w-6xl flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
              <Link href={cartHref} className="flex items-center gap-2.5 min-w-0 text-slate-700 hover:text-brand-700 transition-colors">
                <span className="relative shrink-0">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold inline-flex items-center justify-center">{count}</span>
                </span>
                <span className="hidden sm:inline text-sm text-slate-600">{count} item{count > 1 ? 's' : ''} in cart</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-900">{inr(subtotal)}</span>
              </Link>
              <Link href={cartHref} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2 text-sm font-bold shadow-btn active:scale-95 transition-all">
                Proceed <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
