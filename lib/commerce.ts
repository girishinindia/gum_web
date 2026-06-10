/**
 * Authenticated commerce client (wishlist · enrollment · cart · checkout).
 * Client-side only — reads the JWT from localStorage and sends it as Bearer.
 * Import only from "use client" components.
 */
import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

export type CommerceType = 'course' | 'bundle' | 'batch' | 'webinar';

export interface ItemSummary {
  id: number;
  type: CommerceType;
  title: string;
  short_description?: string | null;
  slug?: string | null;
  course_slug?: string | null;
  price?: number | null;
  original_price?: number | null;
  is_free?: boolean;
  level?: string | null;
  thumbnail_url?: string | null;
  scheduled_at?: string | null;
}
export interface WishlistRow { id: number; item_type: CommerceType; item_id: number; item: ItemSummary | null }
export interface EnrollmentRow { id: number; item_type: CommerceType; item_id: number; enrollment_status?: string | null; progress_pct?: number | null; item: ItemSummary | null }
export interface CartRow { id: number; item_type: CommerceType; item_id: number; price?: number | null; item: ItemSummary | null }

export class CommerceError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name = 'CommerceError'; this.status = status; }
}

async function authed<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const tok = getAccessToken();
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: opts.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new CommerceError('Network error. Please check your connection.', 0);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try { json = await res.json(); } catch { /* no body */ }
  if (!res.ok || (json && json.success === false)) {
    throw new CommerceError(json?.error || `Request failed (${res.status})`, res.status);
  }
  return (json?.data ?? json) as T;
}

// ── Wishlist ──────────────────────────────────────────────────────────
export const fetchWishlist = (userId: number) => authed<WishlistRow[]>(`/wishlists/user/${userId}`);
export const addToWishlist = (item_type: CommerceType, item_id: number) => authed<WishlistRow>('/wishlists', { method: 'POST', body: { item_type, item_id } });
export const removeWishlist = (id: number) => authed(`/wishlists/${id}`, { method: 'DELETE' });

// ── Enrollment ────────────────────────────────────────────────────────
export const fetchEnrollments = (userId: number) => authed<EnrollmentRow[]>(`/enrollments/user/${userId}`);
export const enrollFree = (item_type: CommerceType, item_id: number) => authed<EnrollmentRow>('/enrollments', { method: 'POST', body: { item_type, item_id } });

// ── Cart ──────────────────────────────────────────────────────────────
export const fetchCart = (userId: number) => authed<CartRow[]>(`/cart/user/${userId}`);
function dispatchCartChanged() { if (typeof window !== 'undefined') window.dispatchEvent(new Event('gum-cart-changed')); }
export async function addToCart(item_type: CommerceType, item_id: number) { const r = await authed<CartRow>('/cart', { method: 'POST', body: { item_type, item_id, quantity: 1 } }); dispatchCartChanged(); return r; }
export async function removeCart(id: number) { const r = await authed(`/cart/${id}`, { method: 'DELETE' }); dispatchCartChanged(); return r; }

/** "Just added to cart" signal — drives the global confirmation toast.
 *  (`gum-cart-changed`, already fired by addToCart/saveGuestCart, drives the
 *  count + total on the bottom strip.) */
export const CART_ADDED_EVENT = 'gum-cart-added';
export function notifyCartAdded(title?: string | null) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CART_ADDED_EVENT, { detail: { title: title || null } }));
}

// ── Checkout (Razorpay) ───────────────────────────────────────────────
export const checkoutConfig = () => authed<{ keyId: string; currency: string }>('/checkout/config');
export interface CheckoutPreview {
  subtotal: number; discount_amount: number; tax_amount: number; total: number; item_count: number;
  coupon: { code: string; valid: boolean; message?: string } | null;
  promo: { code: string; valid: boolean; message?: string } | null;
}
/** Compute cart totals + coupon/promo discount without creating an order. */
export const checkoutPreview = (p: { coupon_code?: string | null; promo_code?: string | null } = {}) =>
  authed<CheckoutPreview>('/checkout/preview', { method: 'POST', body: p });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkoutInitiate = (p: { coupon_code?: string | null; promo_code?: string | null } = {}) => authed<any>('/checkout/initiate', { method: 'POST', body: p });
export const checkoutVerify = (p: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authed<any>('/checkout/verify', { method: 'POST', body: p });

// ── Shared membership maps (one fetch per session, shared by all buttons) ──
const k = (t: string, id: number) => `${t}:${id}`;
let wlCache: { uid?: number; p?: Promise<Map<string, number>> } = {};
let enCache: { uid?: number; p?: Promise<Map<string, EnrollmentRow>> } = {};

export function wishlistMap(userId: number): Promise<Map<string, number>> {
  if (wlCache.uid !== userId || !wlCache.p) {
    wlCache = { uid: userId, p: fetchWishlist(userId).then((rows) => new Map(rows.map((r) => [k(r.item_type, r.item_id), r.id]))).catch(() => new Map<string, number>()) };
  }
  return wlCache.p!;
}
export function enrolledMap(userId: number): Promise<Map<string, EnrollmentRow>> {
  if (enCache.uid !== userId || !enCache.p) {
    enCache = { uid: userId, p: fetchEnrollments(userId).then((rows) => new Map(rows.map((r) => [k(r.item_type, r.item_id), r]))).catch(() => new Map<string, EnrollmentRow>()) };
  }
  return enCache.p!;
}
export function invalidateWishlist() { wlCache = {}; }
export function invalidateEnrollments() { enCache = {}; }

// ── Guest cart (localStorage) — lets signed-out users build a cart; merged
//    into the server cart on login. Payment still requires login. ──
export interface GuestCartItem {
  item_type: CommerceType;
  item_id: number;
  title?: string;
  price?: number | null;
  original_price?: number | null;
  is_free?: boolean;
  thumbnail_url?: string | null;
  slug?: string | null;
  course_slug?: string | null;
}
const GUEST_KEY = 'gum.cart.guest';

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(GUEST_KEY) || '[]'); } catch { return []; }
}
function saveGuestCart(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(GUEST_KEY, JSON.stringify(items)); window.dispatchEvent(new Event('gum-cart-changed')); } catch { /* ignore */ }
}
export function addGuestCart(item: GuestCartItem) {
  const cur = getGuestCart();
  if (!cur.some((x) => x.item_type === item.item_type && x.item_id === item.item_id)) { cur.push(item); saveGuestCart(cur); }
}
export function removeGuestCart(itemType: CommerceType, itemId: number) {
  saveGuestCart(getGuestCart().filter((x) => !(x.item_type === itemType && x.item_id === itemId)));
}
export function clearGuestCart() { saveGuestCart([]); }

/** Push any guest-cart items into the server cart (after login), then clear. */
export async function mergeGuestCart(): Promise<void> {
  const items = getGuestCart();
  if (!items.length) return;
  for (const it of items) { try { await addToCart(it.item_type, it.item_id); } catch { /* skip dupes/errors */ } }
  clearGuestCart();
}
