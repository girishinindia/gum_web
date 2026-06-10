import { apiBase } from '@/lib/api';

export interface ActivePromo {
  promotion_id: number;
  promotion_name: string;
  promo_code: string;
  discount_type: string;
  discount_value: number;
  valid_until?: string | null;
  original_price: number;
  discount_amount: number;
  promo_price: number;
}

/** Best currently-active instructor promotion for a course (public, no auth). */
export async function fetchActivePromo(courseId: number): Promise<ActivePromo | null> {
  try {
    const res = await fetch(`${apiBase()}/public-promotions/course/${courseId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as ActivePromo | null;
  } catch {
    return null;
  }
}
