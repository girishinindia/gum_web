'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getGuestCart, fetchCart } from '@/lib/commerce';

/** Cart icon with a live item-count badge. Counts the server cart when signed
 *  in, the guest cart when not. Re-counts on the `gum-cart-changed` event. */
export function CartBadge({ href = '/cart', className = '' }: { href?: string; className?: string }) {
  const { user, signedIn } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let off = false;
    async function recompute() {
      if (signedIn && user) {
        try { const c = await fetchCart(user.id); if (!off) setCount(c.length); } catch { if (!off) setCount(0); }
      } else if (!off) {
        setCount(getGuestCart().length);
      }
    }
    recompute();
    const handler = () => { recompute(); };
    window.addEventListener('gum-cart-changed', handler);
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => {
      off = true;
      window.removeEventListener('gum-cart-changed', handler);
      window.removeEventListener('storage', handler);
      window.removeEventListener('focus', handler);
    };
  }, [signedIn, user]);

  return (
    <Link href={href} aria-label={`Cart${count > 0 ? ` (${count})` : ''}`} className={`relative inline-flex items-center justify-center text-slate-600 hover:text-brand-700 transition-colors ${className}`}>
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold inline-flex items-center justify-center">{count}</span>
      )}
    </Link>
  );
}
