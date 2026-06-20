/**
 * Public review client (read for everyone · write for any signed-in user).
 * Talks to the gum_api /public-reviews endpoints. Import only from
 * "use client" components (reads the JWT from localStorage for writes).
 */
import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

export type ReviewItemType =
  | 'course' | 'bundle' | 'batch' | 'webinar' | 'instructor' | 'blog' | 'live_session' | 'podcast';

export interface PublicReview {
  id: number;
  rating: number;
  title?: string | null;
  review_text?: string | null;
  is_verified_purchase?: boolean;
  helpful_count?: number;
  created_at?: string | null;
  reviewer_name: string;
  reviewer_image?: string | null;
}

export interface ReviewSummary {
  average: number;
  total: number;
  breakdown: Record<number, number>;
}

export interface MyReview {
  id: number;
  rating: number;
  title?: string | null;
  review_text?: string | null;
  status?: string;
  is_verified_purchase?: boolean;
  created_at?: string | null;
}

async function getJson<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const tok = opts.auth ? getAccessToken() : null;
  const res = await fetch(`${apiBase()}${path}`, {
    method: opts.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try { json = await res.json(); } catch { /* no body */ }
  if (!res.ok || (json && json.success === false)) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  // BUG-65: when the API returns a success envelope ({ success, ... }) we must
  // read `data` only — the old `json?.data ?? json` returned the whole truthy
  // envelope when `data` was omitted (e.g. "no review yet"), so callers like
  // fetchMyReview saw a falsy-looking-but-truthy object and showed "Edit Review".
  // Treat a missing/null `data` on a success envelope as null.
  if (json && typeof json === 'object' && 'success' in json) {
    return (json.data ?? null) as T;
  }
  return json as T;
}

export function fetchItemReviews(itemType: ReviewItemType, itemId: number, opts: { limit?: number; offset?: number } = {}) {
  const qs = new URLSearchParams({
    item_type: itemType, item_id: String(itemId),
    limit: String(opts.limit ?? 20), offset: String(opts.offset ?? 0),
  });
  return getJson<{ summary: ReviewSummary; reviews: PublicReview[] }>(`/public-reviews?${qs.toString()}`);
}

export function fetchMyReview(itemType: ReviewItemType, itemId: number) {
  const qs = new URLSearchParams({ item_type: itemType, item_id: String(itemId) });
  return getJson<MyReview | null>(`/public-reviews/mine?${qs.toString()}`, { auth: true });
}

export function submitReview(p: { itemType: ReviewItemType; itemId: number; rating: number; title?: string | null; review_text?: string | null }) {
  return getJson<MyReview>('/public-reviews', {
    method: 'POST', auth: true,
    body: { item_type: p.itemType, item_id: p.itemId, rating: p.rating, title: p.title ?? null, review_text: p.review_text ?? null },
  });
}

export function deleteMyReview(itemType: ReviewItemType, itemId: number) {
  const qs = new URLSearchParams({ item_type: itemType, item_id: String(itemId) });
  return getJson(`/public-reviews/mine?${qs.toString()}`, { method: 'DELETE', auth: true });
}

export interface HelpfulResult { review_id: number; helpful_count: number; viewer_has_voted: boolean; }

/** Toggle the signed-in user's "helpful" vote on a review. */
export function markHelpful(reviewId: number) {
  return getJson<HelpfulResult>('/public-reviews/helpful', { method: 'POST', auth: true, body: { review_id: reviewId } });
}

/** Review ids the signed-in user has marked helpful for an item (to pre-fill button state). */
export function fetchMyHelpful(itemType: ReviewItemType, itemId: number) {
  const qs = new URLSearchParams({ item_type: itemType, item_id: String(itemId) });
  return getJson<number[]>(`/public-reviews/my-helpful?${qs.toString()}`, { auth: true });
}
