'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { wishlistMap, addToWishlist, removeWishlist, invalidateWishlist, type CommerceType } from '@/lib/commerce';

/** Heart toggle that adds/removes the item from the signed-in user's wishlist.
 *  Signed-out → redirect to /login. Shares one membership fetch across buttons. */
export function WishlistButton({
  itemType, itemId, variant = 'icon', basePath = '', className = '',
}: { itemType: CommerceType; itemId: number; variant?: 'icon' | 'full'; basePath?: '' | '/m'; className?: string }) {
  const { user, signedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [wished, setWished] = useState(false);
  const [rowId, setRowId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!signedIn || !user) return;
    let off = false;
    wishlistMap(user.id).then((m) => {
      if (off) return;
      const id = m.get(`${itemType}:${itemId}`);
      if (id != null) { setWished(true); setRowId(id); }
    });
    return () => { off = true; };
  }, [signedIn, user, itemType, itemId]);

  async function toggle(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (busy) return;
    if (!signedIn) { router.push(`${basePath}/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    setBusy(true);
    try {
      if (wished && rowId != null) { await removeWishlist(rowId); setWished(false); setRowId(null); }
      else { const row = await addToWishlist(itemType, itemId); setWished(true); setRowId(row?.id ?? null); }
      invalidateWishlist();
    } catch { /* keep current state on failure */ } finally { setBusy(false); }
  }

  if (variant === 'full') {
    return (
      <button onClick={toggle} disabled={busy} className={`w-full inline-flex items-center justify-center gap-1.5 py-2 text-sm transition-colors disabled:opacity-60 ${wished ? 'text-rose-600' : 'text-slate-600 hover:text-brand-700'} ${className}`}>
        <Heart className={`h-4 w-4 ${wished ? 'fill-rose-500 text-rose-500' : ''}`} /> {wished ? 'Wishlisted' : 'Add to Wishlist'}
      </button>
    );
  }
  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-60 ${wished ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-700'} ${className || 'h-10 w-10'}`}
    >
      <Heart className={`h-4 w-4 ${wished ? 'fill-rose-500 text-rose-500' : ''}`} />
    </button>
  );
}
