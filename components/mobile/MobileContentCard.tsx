'use client';

import { extractCardData, UnifiedCard, type UnifiedItem } from '@/components/ui/ContentCard';

/**
 * Mobile catalog card — renders the exact same card as the desktop web
 * (`UnifiedCard`): cover, category + badge, title, description, detail stats,
 * price + rating, and the CTA button. Shown one-per-row in the mobile
 * single-column list so the mobile app matches desktop for every content type.
 */
export function MobileContentCard({ item, index = 0 }: { item: UnifiedItem; index?: number }) {
  const d = extractCardData(item);
  if (!d) return null;
  return <UnifiedCard d={d} index={index} />;
}
