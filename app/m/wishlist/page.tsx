'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, X, Heart, BookOpen, Layers, Users, Video, Loader2 } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchWishlist, removeWishlist, addToCart, type WishlistRow } from '@/lib/commerce';

const inr = (n?: number | null) => (n == null ? '' : `₹${Math.round(Number(n)).toLocaleString('en-IN')}`);
const GRAD: Record<string, string> = { course: 'from-brand-700 to-brand-500', bundle: 'from-violet-700 to-brand-500', batch: 'from-amber-600 to-rose-500', webinar: 'from-sky-600 to-indigo-500' };
const ICON: Record<string, typeof BookOpen> = { course: BookOpen, bundle: Layers, batch: Users, webinar: Video };

function itemHref(r: WishlistRow): string {
  if (r.item_type === 'course') return r.item?.slug ? `/m/courses/${r.item.slug}` : '#';
  if (r.item_type === 'bundle') return r.item?.slug ? `/m/bundles/${r.item.slug}` : '#';
  if (r.item_type === 'batch') return r.item?.course_slug ? `/m/courses/${r.item.course_slug}` : '#';
  if (r.item_type === 'webinar') return `/m/webinars/${r.item_id}`;
  return '#';
}

export default function MobileWishlistPage() {
  const { user, signedIn } = useAuth();
  const [rows, setRows] = useState<WishlistRow[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!signedIn || !user) { setRows([]); return; }
    fetchWishlist(user.id).then(setRows).catch(() => setRows([]));
  }, [signedIn, user]);

  async function remove(id: number) { setBusyId(id); try { await removeWishlist(id); setRows((r) => r?.filter((x) => x.id !== id) ?? null); } finally { setBusyId(null); } }
  async function toCart(r: WishlistRow) { setBusyId(r.id); try { await addToCart(r.item_type, r.item_id); await removeWishlist(r.id); setRows((rs) => rs?.filter((x) => x.id !== r.id) ?? null); } finally { setBusyId(null); } }

  return (
    <div className="pb-6">
      <MobilePageHeader title="Wishlist" subtitle="Saved for later" />
      {!signedIn ? (
        <div className="mx-3 mt-4 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white p-5 text-center shadow-cardHover">
          <Heart className="h-6 w-6 mx-auto" />
          <div className="heading mt-2 text-[15px]">Sign in to see your wishlist</div>
          <Link href="/m/login?next=%2Fm%2Fwishlist" className="mt-3 inline-flex rounded-full bg-white text-brand-700 px-4 py-1.5 text-[12px] font-bold">Sign in</Link>
        </div>
      ) : rows == null ? (
        <div className="px-3 mt-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <div className="px-3 mt-10 text-center"><Heart className="h-7 w-7 mx-auto text-slate-300" /><p className="heading text-slate-700 text-sm mt-2">Nothing saved yet</p><Link href="/m/courses" className="mt-3 inline-flex rounded-full bg-brand-500 text-white px-4 py-1.5 text-[12px] font-bold">Browse courses</Link></div>
      ) : (
        <div className="px-3 mt-4 space-y-3">
          {rows.map((r) => { const Icon = ICON[r.item_type] ?? BookOpen; return (
            <div key={r.id} className="flex gap-3 p-3 rounded-md bg-white border border-slate-200 shadow-card">
              <Link href={itemHref(r)} className={`h-16 w-16 rounded-md shrink-0 overflow-hidden bg-gradient-to-br ${GRAD[r.item_type] ?? GRAD.course} flex items-center justify-center`}>
                {r.item?.thumbnail_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={r.item.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  : <Icon className="h-6 w-6 text-white/85" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={itemHref(r)} className="heading text-[13.5px] text-slate-900 line-clamp-2 leading-tight">{r.item?.title ?? `${r.item_type} #${r.item_id}`}</Link>
                <div className="mt-1 heading text-[13px] text-slate-900">{r.item?.is_free ? <span className="text-emerald-600">Free</span> : inr(r.item?.price)}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => toCart(r)} disabled={busyId === r.id} className="inline-flex items-center gap-1 rounded-full bg-brand-500 text-white px-2.5 py-1 text-[11px] font-semibold active:scale-95 disabled:opacity-60">{busyId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingCart className="h-3 w-3" />} Cart</button>
                  <button onClick={() => remove(r.id)} disabled={busyId === r.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 text-slate-600 px-2.5 py-1 text-[11px] font-semibold active:scale-95 disabled:opacity-60"><X className="h-3 w-3" /> Remove</button>
                </div>
              </div>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}
