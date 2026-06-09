'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, X, Loader2, Heart, BookOpen, Layers, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchWishlist, removeWishlist, addToCart, type WishlistRow } from '@/lib/commerce';

const inr = (n?: number | null) => (n == null ? '' : `₹${Math.round(Number(n)).toLocaleString('en-IN')}`);
const GRAD: Record<string, string> = { course: 'from-brand-700 to-brand-500', bundle: 'from-violet-700 to-brand-500', batch: 'from-amber-600 to-rose-500', webinar: 'from-sky-600 to-indigo-500' };
const ICON: Record<string, typeof BookOpen> = { course: BookOpen, bundle: Layers, batch: Users, webinar: Video };

function itemHref(r: WishlistRow): string {
  const it = r.item;
  if (r.item_type === 'course') return it?.slug ? `/courses/${it.slug}` : '#';
  if (r.item_type === 'bundle') return it?.slug ? `/bundles/${it.slug}` : '#';
  if (r.item_type === 'batch') return it?.course_slug ? `/courses/${it.course_slug}` : '#';
  if (r.item_type === 'webinar') return `/webinars/${r.item_id}`;
  return '#';
}

export default function WishlistPage() {
  const { user, signedIn } = useAuth();
  const [rows, setRows] = useState<WishlistRow[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!signedIn || !user) return;
    fetchWishlist(user.id).then(setRows).catch(() => setRows([]));
  }, [signedIn, user]);

  async function remove(id: number) {
    setBusyId(id);
    try { await removeWishlist(id); setRows((r) => r?.filter((x) => x.id !== id) ?? null); }
    finally { setBusyId(null); }
  }
  async function toCart(r: WishlistRow) {
    setBusyId(r.id);
    try { await addToCart(r.item_type, r.item_id); await removeWishlist(r.id); setRows((rs) => rs?.filter((x) => x.id !== r.id) ?? null); }
    finally { setBusyId(null); }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Eyebrow>Saved for later</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Wishlist</h1>
      <p className="mt-1 text-sm text-slate-500">{rows == null ? 'Loading…' : `${rows.length} item${rows.length === 1 ? '' : 's'} you bookmarked.`}</p>

      {rows == null ? (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 rounded-md bg-white border border-slate-200 animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-md bg-white border border-slate-200 p-10 text-center">
          <Heart className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-lg text-slate-800">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-slate-500">Browse courses and tap the heart to save them here.</p>
          <Link href="/courses" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Explore courses</Link>
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((r) => {
            const it = r.item; const Icon = ICON[r.item_type] ?? BookOpen;
            return (
              <div key={r.id} className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden flex flex-col">
                <Link href={itemHref(r)} className={`relative aspect-[16/10] bg-gradient-to-br ${GRAD[r.item_type] ?? GRAD.course} flex items-center justify-center overflow-hidden`}>
                  {it?.thumbnail_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={it.thumbnail_url} alt={it?.title ?? ''} className="absolute inset-0 h-full w-full object-cover" />
                    : <Icon className="h-10 w-10 text-white/80" />}
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 capitalize">{r.item_type}</span>
                  <h3 className="heading text-base text-slate-900 mt-0.5 line-clamp-2"><Link href={itemHref(r)}>{it?.title ?? `${r.item_type} #${r.item_id}`}</Link></h3>
                  <div className="mt-2 heading text-lg text-slate-900">{it?.is_free ? <span className="text-emerald-600">Free</span> : inr(it?.price)}</div>
                  <div className="flex-1" />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="primary" size="sm" className="rounded-full" onClick={() => toCart(r)} disabled={busyId === r.id}>
                      {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />} Move to cart
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => remove(r.id)} disabled={busyId === r.id}>
                      <X className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
