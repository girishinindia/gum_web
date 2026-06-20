/**
 * Authenticated commerce client (wishlist · enrollment · cart · checkout).
 * Client-side only — reads the JWT from localStorage and sends it as Bearer.
 * Import only from "use client" components.
 */
import { apiBase } from '@/lib/api';
import { getAccessToken, getRefreshToken, setTokens } from '@/lib/auth/session';

// BUG-33 fix (June 2026): expired access tokens made payments/orders fail with
// "Token not provided". On 401 we now refresh ONCE (shared promise so parallel
// calls don't stampede) and retry the request with the new token.
let refreshInFlight: Promise<boolean> | null = null;
async function tryRefreshToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const rt = getRefreshToken();
      if (!rt) return false;
      try {
        const res = await fetch(`${apiBase()}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: rt }),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const j: any = await res.json().catch(() => null);
        const d = j?.data ?? j;
        if (res.ok && d?.access_token) {
          setTokens({ access_token: d.access_token, refresh_token: d.refresh_token || rt });
          return true;
        }
        return false;
      } catch { return false; }
    })().finally(() => { setTimeout(() => { refreshInFlight = null; }, 50); });
  }
  return refreshInFlight;
}

export type CommerceType = 'course' | 'bundle' | 'batch' | 'webinar' | 'live_session';

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
  if (res.status === 401 && tok && (await tryRefreshToken())) {
    // retry once with the fresh token (BUG-33)
    const tok2 = getAccessToken();
    const res2 = await fetch(`${apiBase()}${path}`, {
      method: opts.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(tok2 ? { Authorization: `Bearer ${tok2}` } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
    try { json = await res2.json(); } catch { json = null; }
    if (!res2.ok || (json && json.success === false)) {
      throw new CommerceError(json?.error || `Request failed (${res2.status})`, res2.status);
    }
    return (json?.data ?? json) as T;
  }
  if (!res.ok || (json && json.success === false)) {
    throw new CommerceError(json?.error || `Request failed (${res.status})`, res.status);
  }
  return (json?.data ?? json) as T;
}

// ── Wishlist ──────────────────────────────────────────────────────────
export const fetchWishlist = (userId: number) => authed<WishlistRow[]>(`/wishlists/user/${userId}`);
export const addToWishlist = (item_type: CommerceType, item_id: number) => authed<WishlistRow>('/wishlists', { method: 'POST', body: { item_type, item_id } });
export const removeWishlist = (id: number) => authed(`/wishlists/${id}`, { method: 'DELETE' });

// ── Achievements: badges + certificates (self-service) ───────────────
export interface MyBadge {
  id: number;
  earned_at?: string | null;
  badges?: { id: number; name: string; slug?: string | null; description?: string | null; icon_url?: string | null; category?: string | null; xp_reward?: number | null } | null;
}
export interface MyCertificate {
  id: number;
  certificate_number: string;
  certificate_url?: string | null;
  png_url?: string | null;
  issued_at?: string | null;
  certificate_templates?: { id: number; name?: string | null; courses?: { id: number; name?: string | null; slug?: string | null } | null } | null;
}
export const fetchMyBadges = () => authed<MyBadge[]>('/user-badges/me');
export const fetchMyCertificates = () => authed<MyCertificate[]>('/issued-certificates/me');

// ── Student dashboard summary (June 2026) ────────────────────────────
export interface DashboardSummary {
  stats: { active_courses: number; total_enrollments: number; completed: number; certificates: number; badges: number };
  continue: { enrollment_id: number; progress_pct: number; course: { id: number; name: string; slug?: string | null; trailer_thumbnail_url?: string | null; total_lessons?: number | null } }[];
  upcoming: { kind: 'live_session' | 'webinar'; id: number; title: string; slug?: string | null; scheduled_at?: string | null; duration_minutes?: number | null; meeting_platform?: string | null }[];
}
export const fetchDashboard = () => authed<DashboardSummary>('/dashboard/me');

// ── Orders / payment history (self-service — June 2026) ──────────────
export interface MyOrderItem { id: number; item_type: string; item_id: number; item_name?: string | null; item_slug?: string | null; original_price?: number | string | null; discount_amount?: number | string | null; tax_amount?: number | string | null; final_price?: number | string | null; quantity?: number | null }
export interface MyOrder {
  id: number; order_number?: string | null; order_status?: string | null; payment_status?: string | null;
  subtotal?: number | string | null; discount_amount?: number | string | null; tax_amount?: number | string | null; total_amount?: number | string | null;
  coupon_code?: string | null; promo_code?: string | null; created_at?: string; order_items?: MyOrderItem[];
}
export const fetchMyOrders = (page = 1, limit = 20) => authed<MyOrder[]>(`/orders/me?page=${page}&limit=${limit}`);
export const fetchMyOrder = (id: number) => authed<MyOrder>(`/orders/me/${id}`);

// ── Instructor self-service (June 2026) ──────────────────────────────
export interface MyEarning {
  id: number; order_id?: number | null; item_type?: string | null; item_id?: number | null;
  order_amount?: number | string | null; gst_amount?: number | string | null; instructor_share?: number | string | null;
  earning_amount?: number | string | null; platform_fee?: number | string | null; earning_status?: string | null; created_at?: string;
  orders?: { id: number; order_number?: string | null } | null;
  student?: { id: number; first_name?: string | null; last_name?: string | null; full_name?: string | null } | null;
}
export interface MyEarningsSummary {
  total_earnings: number; pending_earnings: number; confirmed_earnings: number; paid_earnings: number; reversed_earnings: number; gross_sales: number;
  by_item: { item_type: string; item_id: number; name?: string; gross: number; earning: number; sales: number }[];
}
export const fetchMyEarnings = (page = 1, limit = 20, status?: string) =>
  authed<MyEarning[]>(`/instructor-earnings/me?page=${page}&limit=${limit}${status ? `&earning_status=${status}` : ''}`);
export const fetchMyEarningsSummary = () => authed<MyEarningsSummary>('/instructor-earnings/me/summary');

export interface MyPayoutRequest { id: number; request_number?: string | null; requested_amount?: number | string | null; request_status?: string | null; payment_method?: string | null; created_at?: string; review_notes?: string | null }
export interface MyPayoutSettlement { id: number; settlement_amount?: number | string | null; settlement_status?: string | null; payment_method?: string | null; transaction_reference?: string | null; created_at?: string; payout_requests?: { id: number; request_number?: string | null } | null }
export const fetchMyPayoutRequests = () => authed<MyPayoutRequest[]>('/payout-requests/me');
export const fetchMyPayoutSettlements = () => authed<MyPayoutSettlement[]>('/payout-settlements/me');
export const createMyPayoutRequest = (p: { requested_amount: number; payment_method?: string; bank_account_id?: number | null; notes?: string | null }) =>
  authed<MyPayoutRequest>('/payout-requests/me', { method: 'POST', body: p });

export interface MyBankAccount {
  id: number; account_holder_name?: string | null; account_number?: string | null; ifsc_code?: string | null;
  bank_name?: string | null; branch_name?: string | null; account_type?: string | null; is_primary?: boolean; is_verified?: boolean;
}
export const fetchMyBankAccounts = () => authed<MyBankAccount[]>('/bank-accounts/me');
export const createBankAccount = (p: Partial<MyBankAccount>) => authed<MyBankAccount>('/bank-accounts', { method: 'POST', body: p });
export const setPrimaryBankAccount = (id: number) => authed<MyBankAccount>(`/bank-accounts/${id}/primary`, { method: 'PATCH' });
export const deleteBankAccount = (id: number) => authed(`/bank-accounts/${id}`, { method: 'DELETE' });

// ── Wallet (self-service — June 2026 /wallet page) ───────────────────
export interface MyWallet { id: number; balance: number | string; total_credited?: number | string | null; total_debited?: number | string | null; is_frozen?: boolean; frozen_reason?: string | null }
export interface WalletTxn { id: number; transaction_type: 'credit' | 'debit'; amount: number | string; balance_after?: number | string | null; source_type?: string | null; source_id?: number | null; description?: string | null; status?: string | null; created_at?: string }
export const fetchMyWallet = () => authed<MyWallet>('/wallets/me');
export const fetchMyWalletTransactions = (page = 1, limit = 20) =>
  authed<WalletTxn[]>(`/wallets/me/transactions?page=${page}&limit=${limit}`);

// ── Enrollment ────────────────────────────────────────────────────────
export const fetchEnrollments = (userId: number) => authed<EnrollmentRow[]>(`/enrollments/user/${userId}`);
export const enrollFree = (item_type: CommerceType, item_id: number) => authed<EnrollmentRow>('/enrollments', { method: 'POST', body: { item_type, item_id } });

// ── Cart ──────────────────────────────────────────────────────────────
export const fetchCart = (userId: number) => authed<CartRow[]>(`/cart-items/user/${userId}`);
function dispatchCartChanged() { if (typeof window !== 'undefined') window.dispatchEvent(new Event('gum-cart-changed')); }
export async function addToCart(item_type: CommerceType, item_id: number) { const r = await authed<CartRow>('/cart-items', { method: 'POST', body: { item_type, item_id, quantity: 1 } }); dispatchCartChanged(); return r; }
export async function removeCart(id: number) { const r = await authed(`/cart-items/${id}`, { method: 'DELETE' }); dispatchCartChanged(); return r; }

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
  subtotal: number; discount_amount: number; tax_amount: number; gst_rate?: number; total: number; item_count: number;
  coupon: { code: string; valid: boolean; message?: string } | null;
  promo: { code: string; valid: boolean; message?: string } | null;
}
/** Compute cart totals + coupon/promo discount without creating an order. */
export const checkoutPreview = (p: { coupon_code?: string | null; promo_code?: string | null } = {}) =>
  authed<CheckoutPreview>('/checkout/preview', { method: 'POST', body: p });
// BUG-27: single-call coupon/promo validation — the API tries the code as a
// coupon first, then as an instructor promo, and tells us which kind applied
// (or null) plus the rupee discount. Replaces the web's old 3× /preview dance.
export interface ValidateCodeResult { kind: 'coupon' | 'promo' | null; valid: boolean; discount: number; message?: string }
export const validateCode = (code: string) =>
  authed<ValidateCodeResult>('/checkout/validate-code', { method: 'POST', body: { code } });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkoutInitiate = (p: { coupon_code?: string | null; promo_code?: string | null } = {}) => authed<any>('/checkout/initiate', { method: 'POST', body: p });
export const checkoutVerify = (p: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authed<any>('/checkout/verify', { method: 'POST', body: p });

// ── Shared membership maps (one fetch per session, shared by all buttons) ──
const k = (t: string, id: number) => `${t}:${id}`;
let wlCache: { uid?: number; p?: Promise<Map<string, number>> } = {};
let enCache: { uid?: number; p?: Promise<Map<string, EnrollmentRow>> } = {};
// BUG-46: cart-membership cache (mirrors enrolledMap). `uid === 0` = guest cart.
let cartCache: { uid?: number; p?: Promise<Set<string>> } = {};

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
/**
 * BUG-46: set of `${item_type}:${item_id}` keys currently in the cart — drives
 * the persistent "In cart" state on EnrollButton. Signed-in users (userId > 0)
 * read the server cart; signed-out users (pass userId 0) read the localStorage
 * guest cart. Invalidated by the `gum-cart-changed` window event (see below).
 */
export function cartMap(userId: number): Promise<Set<string>> {
  if (cartCache.uid !== userId || !cartCache.p) {
    const p = userId > 0
      ? fetchCart(userId).then((rows) => new Set(rows.map((r) => k(r.item_type, r.item_id)))).catch(() => new Set<string>())
      : Promise.resolve(new Set(getGuestCart().map((x) => k(x.item_type, x.item_id))));
    cartCache = { uid: userId, p };
  }
  return cartCache.p!;
}
export function invalidateWishlist() { wlCache = {}; }
export function invalidateEnrollments() { enCache = {}; }
export function invalidateCart() { cartCache = {}; }

// BUG-46: keep the cart-membership cache fresh — every add/remove (server or
// guest) fires `gum-cart-changed`, so any button can re-read its in-cart state.
if (typeof window !== 'undefined') {
  window.addEventListener('gum-cart-changed', () => { cartCache = {}; });
}

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
