'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchCart, removeCart, mergeGuestCart, getGuestCart, removeGuestCart, type CommerceType } from '@/lib/commerce';
import { CartSummary } from '@/components/commerce/CartSummary';

const inr = (n?: number | null) => `₹${Math.round(Number(n ?? 0)).toLocaleString('en-IN')}`;

interface Row { key: string; serverId?: number; item_type: CommerceType; item_id: number; title: string; price: number; original?: number | null; isFree?: boolean; thumbnail?: string | null }

export default function CartPage() {
  const { user, signedIn } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function loadGuest() {
    setRows(getGuestCart().map((x) => ({ key: `${x.item_type}:${x.item_id}`, item_type: x.item_type, item_id: x.item_id, title: x.title || `${x.item_type} #${x.item_id}`, price: Number(x.price ?? 0), original: x.original_price, isFree: x.is_free, thumbnail: x.thumbnail_url })));
  }

  useEffect(() => {
    if (signedIn && user) {
      mergeGuestCart()
        .then(() => fetchCart(user.id))
        .then((server) => setRows(server.map((r) => ({ key: `srv:${r.id}`, serverId: r.id, item_type: r.item_type, item_id: r.item_id, title: r.item?.title || `${r.item_type} #${r.item_id}`, price: Number(r.item?.price ?? r.price ?? 0), original: r.item?.original_price, isFree: r.item?.is_free, thumbnail: r.item?.thumbnail_url }))))
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
    <div className="max-w-6xl mx-auto pt-6 sm:pt-10">
      <h1 className="heading text-3xl text-slate-900">Your cart</h1>
      <p className="mt-1 text-sm text-slate-500">{rows == null ? 'Loading…' : `${items.length} item${items.length === 1 ? '' : 's'}`}{!signedIn && items.length > 0 ? ' · sign in at checkout to pay' : ''}</p>

      {rows == null ? (
        <div className="mt-6 space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-md bg-white border border-slate-200 p-10 text-center">
          <ShoppingCart className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-lg text-slate-800">Your cart is empty</p>
          <Link href="/courses" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Browse courses</Link>
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.key} className="rounded-md bg-white border border-slate-200 shadow-card p-4 flex items-center gap-4">
                <div className="h-16 w-24 rounded-md bg-gradient-to-br from-brand-700 to-brand-500 shrink-0 overflow-hidden">
                  {i.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={i.thumbnail} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="heading text-base text-slate-900 truncate">{i.title}</h3>
                  <div className="mt-1 text-[12px] text-slate-500 capitalize">{i.item_type} · lifetime access</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="heading text-base text-slate-900">{i.isFree ? 'Free' : inr(i.price)}</div>
                  {i.original ? <div className="text-[11px] text-slate-400 line-through">{inr(i.original)}</div> : null}
                </div>
                <button aria-label="Remove" onClick={() => remove(i)} disabled={busy === i.key} className="h-8 w-8 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center disabled:opacity-50"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>

          <CartSummary basePath="" signedIn={signedIn} clientSubtotal={subtotal} />
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/courses" className="text-sm text-brand-700 font-semibold hover:underline">← Continue browsing courses</Link>
      </div>
    </div>
  );
}
