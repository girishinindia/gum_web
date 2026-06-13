'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, PlayCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { enrolledMap, cartMap, enrollFree, addToCart, addGuestCart, invalidateEnrollments, notifyCartAdded, type CommerceType, type GuestCartItem } from '@/lib/commerce';

/** Primary CTA. Free items self-enroll (login required). Paid items add to the
 *  cart — allowed for guests too (login is only enforced at payment). */
export function EnrollButton({
  itemType, itemId, isFree, item, learnHref, basePath = '', className = '',
}: {
  itemType: CommerceType; itemId: number; isFree?: boolean;
  item?: Omit<GuestCartItem, 'item_type' | 'item_id'>;
  learnHref?: string; basePath?: '' | '/m'; className?: string;
}) {
  const { user, signedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // BUG-46: `incart` is a persistent state (survives reload) shown when a paid
  // item is already in the cart — links to /cart instead of re-adding.
  const [state, setState] = useState<'idle' | 'enrolled' | 'busy' | 'added' | 'incart'>('idle');
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enrolled wins over in-cart; both re-check when auth or the cart changes.
  // BUG-46: paid items also consult cartMap so the button reflects an existing
  // cart membership (server cart when signed in, guest cart otherwise).
  useEffect(() => {
    let off = false;
    const key = `${itemType}:${itemId}`;
    async function sync() {
      if (signedIn && user) {
        const enrolled = await enrolledMap(user.id);
        if (off) return;
        if (enrolled.has(key)) { setState('enrolled'); return; }
      }
      if (isFree) return; // free items never use the cart
      const cart = await cartMap(signedIn && user ? user.id : 0);
      if (off) return;
      // Don't clobber a transient "added"/"busy" — only set/clear the resting state.
      setState((s) => (s === 'busy' || s === 'added') ? s : (cart.has(key) ? 'incart' : 'idle'));
    }
    sync();
    const onCartChanged = () => sync();
    window.addEventListener('gum-cart-changed', onCartChanged);
    return () => { off = true; window.removeEventListener('gum-cart-changed', onCartChanged); };
  }, [signedIn, user, itemType, itemId, isFree]);

  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  async function onClick() {
    if (state === 'busy') return;
    if (state === 'enrolled') { router.push(learnHref || `${basePath}/my-courses`); return; }
    // BUG-46: already in the cart → take the user to the cart, don't re-add.
    if (state === 'incart') { router.push(`${basePath}/cart`); return; }

    if (isFree) {
      // Free enrolment grants course ownership → needs an account.
      if (!signedIn) { router.push(`${basePath}/login?next=${encodeURIComponent(pathname || '/')}`); return; }
      setState('busy');
      try { await enrollFree(itemType, itemId); invalidateEnrollments(); setState('enrolled'); }
      catch { setState('idle'); }
      return;
    }

    // Paid → add to cart. Guests use a local cart; login is enforced at payment.
    // No navigation — confirm with a toast + the global cart strip instead.
    setState('busy');
    try {
      if (signedIn) await addToCart(itemType, itemId);
      else addGuestCart({ item_type: itemType, item_id: itemId, ...(item || {}) });
      notifyCartAdded(item?.title);
      setState('added');
      // BUG-46: after the brief "Added" flash, settle into the persistent
      // "In cart" state (so a reload keeps showing it, not "Add to cart").
      if (addedTimer.current) clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setState('incart'), 1800);
    } catch { setState('idle'); }
  }

  const label = state === 'enrolled' ? 'Go to course' : state === 'busy' ? 'Please wait…' : state === 'added' ? 'Added' : state === 'incart' ? 'In cart · Go to cart' : isFree ? 'Enroll free' : 'Add to cart';
  const Icon = state === 'enrolled' ? PlayCircle : state === 'busy' ? Loader2 : state === 'added' ? Check : ShoppingCart;

  return (
    <button
      onClick={onClick}
      disabled={state === 'busy'}
      className={className || 'inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-6 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all disabled:opacity-70'}
    >
      <Icon className={`h-4 w-4 ${state === 'busy' ? 'animate-spin' : ''}`} /> {label}
    </button>
  );
}
