import type { ElementType, ReactNode } from 'react';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { EnrollButton } from '@/components/commerce/EnrollButton';
import { PageBottomBarRegistrar } from '@/components/commerce/BottomBarContext';
import type { CommerceType, GuestCartItem } from '@/lib/commerce';

/**
 * Fixed bottom action bar for mobile detail pages. Sits above the bottom tab
 * bar (`bottom-14`). `left` holds the price/meta block. When `enroll` is given
 * it renders the live Wishlist (♥) + Enroll buttons; otherwise a static `cta`.
 */
export function MobileDetailBar({
  left,
  cta,
  CtaIcon,
  enroll,
}: {
  left: ReactNode;
  cta?: string;
  CtaIcon?: ElementType;
  enroll?: { itemType: CommerceType; itemId: number; isFree?: boolean; learnHref?: string; item?: Omit<GuestCartItem, 'item_type' | 'item_id'> };
}) {
  return (
    <>
      <PageBottomBarRegistrar />
      <div className="fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/70 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex max-w-md items-center gap-2 px-3 py-2">
          <div className="flex-1 min-w-0">{left}</div>
          {enroll ? (
            <>
              <WishlistButton itemType={enroll.itemType} itemId={enroll.itemId} className="h-10 w-10" />
              <EnrollButton itemType={enroll.itemType} itemId={enroll.itemId} isFree={enroll.isFree} item={enroll.item} learnHref={enroll.learnHref} basePath="/m" />
            </>
          ) : (
            <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-6 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all">
              {CtaIcon && <CtaIcon className="h-4 w-4" />}
              {cta}
            </button>
          )}
        </div>
      </div>
      <div className="h-24" />
    </>
  );
}
