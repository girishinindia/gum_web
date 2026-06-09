'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, PlayCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { enrolledMap, enrollFree, addToCart, addGuestCart, invalidateEnrollments, notifyCartAdded, type CommerceType, type GuestCartItem } from '@/lib/commerce';

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
  const [state, setState] = useState<'idle' | 'enrolled' | 'busy' | 'added'>('idle');
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!signedIn || !user) return;
    let off = false;
    enrolledMap(user.id).then((m) => { if (!off && m.has(`${itemType}:${itemId}`)) setState('enrolled'); });
    return () => { off = true; };
  }, [signedIn, user, itemType, itemId]);

  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  async function onClick() {
    if (state === 'busy') return;
    if (state === 'enrolled') { router.push(learnHref || `${basePath}/my-courses`); return; }

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
      if (addedTimer.current) clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setState('idle'), 1800);
    } catch { setState('idle'); }
  }

  const label = state === 'enrolled' ? 'Go to course' : state === 'busy' ? 'Please wait…' : state === 'added' ? 'Added' : isFree ? 'Enroll free' : 'Add to cart';
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
