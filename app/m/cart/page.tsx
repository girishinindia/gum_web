'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingCart, LogIn } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchCart, removeCart, mergeGuestCart, getGuestCart, removeGuestCart, type CommerceType } from '@/lib/commerce';
import { CheckoutButton } from '@/components/commerce/CheckoutButton';

const inr = (n?: number | null) => `₹${Math.round(Number(n ?? 0)).toLocaleString('en-IN')}`;

interface Row { key: string; serverId?: number; item_type: CommerceType; item_id: number; title: string; price: number; isFree?: boolean; thumbnail?: string | null }

export default function MobileCartPage() {
  const { user, signedIn } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function loadGuest() {
    setRows(getGuestCart().map((x) => ({ key: `${x.item_type}:${x.item_id}`, item_type: x.item_type, item_id: x.item_id, title: x.title || `${x.item_type} #${x.item_id}`, price: Number(x.price ?? 0), isFree: x.is_free, thumbnail: x.thumbnail_url })));
  }

  useEffect(() => {
    if (signedIn && user) {
      mergeGuestCart()
        .then(() => fetchCart(user.id))
        .then((server) => setRows(server.map((r) => ({ key: `srv:${r.id}`, serverId: r.id, item_type: r.item_type, item_id: r.item_id, title: r.item?.title || `${r.item_type} #${r.item_id}`, price: Number(r.item?.price ?? r.price ?? 0), isFree: r.item?.is_free, thumbnail: r.item?.thumbnail_url }))))
        .catch(() => setRows([]));
    } else {
      loadGuest();
    }
  }, [signedIn, user]);

  async function remove(row: Row) {
    setBusy(row.key);
    try {
      if (row.serverId != null) await removeCart(row.serverId);
      else removeGuestCart(row.item_type, row.item_id);
      setRows((rs) => rs?.filter((x) => x.key !== row.key) ?? null);
    } finally { setBusy(null); }
  }

  const items = rows ?? [];
  const subtotal = items.reduce((s, i) => s + (i.isFree ? 0 : i.price), 0);
  const gst = Math.round(subtotal * 0.18);

  return (
    <div className="pb-28">
      <MobilePageHeader title="Cart" subtitle={rows == null ? '' : `${items.length} item${items.length === 1 ? '' : 's'}`} />

      {rows == null ? (
        <div className="px-3 mt-4 space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="px-3 mt-10 text-center"><ShoppingCart className="h-7 w-7 mx-auto text-slate-300" /><p className="heading text-slate-700 text-sm mt-2">Your cart is empty</p><Link href="/m/courses" className="mt-3 inline-flex rounded-full bg-brand-500 text-white px-4 py-1.5 text-[12px] font-bold">Browse courses</Link></div>
      ) : (
        <>
          <div className="px-3 mt-4 space-y-2.5">
            {items.map((i) => (
              <div key={i.key} className="flex items-center gap-3 p-3 rounded-md bg-white border border-slate-200 shadow-card">
                <div className="h-14 w-20 rounded-md bg-gradient-to-br from-brand-700 to-brand-500 shrink-0 overflow-hidden">
                  {i.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={i.thumbnail} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="heading text-[13px] text-slate-900 truncate">{i.title}</h3>
                  <div className="heading text-[13px] text-slate-900 mt-0.5">{i.isFree ? 'Free' : inr(i.price)}</div>
                </div>
                <button aria-label="Remove" onClick={() => remove(i)} disabled={busy === i.key} className="h-8 w-8 rounded-full text-slate-400 active:scale-95 disabled:opacity-50 flex items-center justify-center"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <div className="mx-3 mt-4 rounded-md bg-white border border-slate-200 shadow-card p-4">
            <div className="flex justify-between text-[13px]"><span className="text-slate-600">Subtotal</span><span className="font-semibold">{inr(subtotal)}</span></div>
            <div className="flex justify-between text-[13px] mt-1"><span className="text-slate-600">GST (18%)</span><span className="font-semibold">{inr(gst)}</span></div>
            <div className="flex justify-between text-[15px] mt-2 pt-2 border-t border-slate-100"><span className="heading text-slate-900">Total</span><span className="heading text-slate-900">{inr(subtotal + gst)}</span></div>
            <div className="mt-4">
              {signedIn ? (
                <CheckoutButton basePath="/m" />
              ) : (
                <>
                  <button onClick={() => router.push(`/m/login?next=${encodeURIComponent('/m/cart')}`)} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold py-2.5 shadow-btn active:scale-[0.99] transition-all">
                    <LogIn className="h-4 w-4" /> Sign in to checkout
                  </button>
                  <p className="mt-2 text-[11px] text-slate-500 text-center">Cart saved — sign in to pay.</p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
