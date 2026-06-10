'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ShoppingCart } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchCart, removeCart, mergeGuestCart, getGuestCart, removeGuestCart, type CommerceType } from '@/lib/commerce';
import { CartSummary } from '@/components/commerce/CartSummary';

const inr = (n?: number | null) => `₹${Math.round(Number(n ?? 0)).toLocaleString('en-IN')}`;

interface Row { key: string; serverId?: number; item_type: CommerceType; item_id: number; title: string; price: number; isFree?: boolean; thumbnail?: string | null }

export default function MobileCartPage() {
  const { user, signedIn } = useAuth();
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
          <div className="px-3 mt-4">
            <CartSummary basePath="/m" signedIn={signedIn} clientSubtotal={subtotal} />
          </div>
        </>
      )}
    </div>
  );
}
