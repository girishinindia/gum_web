'use client';

import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { fetchActivePromo, type ActivePromo } from '@/lib/promotions';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** Promo banner shown on the course detail page when an active instructor
 *  promotion covers the course. Apply the code at checkout to get the price. */
export function CoursePromo({ courseId, compact = false }: { courseId: number; compact?: boolean }) {
  const [p, setP] = useState<ActivePromo | null>(null);
  useEffect(() => { fetchActivePromo(courseId).then(setP).catch(() => {}); }, [courseId]);
  if (!p) return null;

  const off = p.discount_type === 'percentage' ? `${Math.round(Number(p.discount_value))}% off` : `${inr(Number(p.discount_value))} off`;
  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 ${compact ? 'p-2.5' : 'p-3'} flex items-start gap-2`}>
      <Tag className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-[12.5px] text-amber-800 leading-relaxed">
        <span className="font-semibold">Promo: {off}</span> with code <span className="font-mono font-bold">{p.promo_code}</span> — pay <span className="font-semibold">{inr(p.promo_price)}</span> <span className="line-through text-amber-500">{inr(p.original_price)}</span> at checkout.
      </div>
    </div>
  );
}
