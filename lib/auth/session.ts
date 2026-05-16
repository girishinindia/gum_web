/**
 * Browser-side persistence for the authenticated user.
 *
 * What's stored and where:
 *   • `access_token`  — short-lived JWT. localStorage.
 *   • `refresh_token` — long-lived JWT used to mint new access tokens.
 *     localStorage (acceptable for a public web app behind HTTPS; if we
 *     ever need to harden against XSS-exfiltration we can move this to
 *     an httpOnly cookie via a Next.js API route).
 *   • `user`          — the user blob the API returns alongside the
 *     tokens. Cached so we can hydrate `<AuthProvider>` synchronously
 *     on first render and avoid an empty-state flicker.
 *
 * Every accessor is SSR-safe (typeof window guard) and silently no-ops
 * during server rendering — Next.js calls these from both contexts.
 */

const K_ACCESS  = 'gum.auth.access';
const K_REFRESH = 'gum.auth.refresh';
const K_USER    = 'gum.auth.user';

/**
 * One role assignment surfaced from `v_user_profile` (joined from
 * `user_roles` + `roles`). A user can hold multiple roles concurrently;
 * `max_role_level` below collapses them into a single comparable number
 * for visibility gating (≥ 60 = instructor, ≥ 80 = admin).
 */
export interface AuthRole {
  role:         string; // 'student' | 'faculty' | 'admin' | …
  display_name: string;
  level:        number; // 0–100 — higher = more privileged
}

export interface AuthUser {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  mobile:     string;
  // ── Optional — populated by /users/me after login / on hydration ──
  // These never come from /auth/login itself; AuthProvider fetches them
  // separately so we can gate the user menu (Instructor / Admin
  // sections) and the profile-page sections by `max_role_level`.
  roles?:           AuthRole[];
  max_role_level?:  number;
  /**
   * Publicly-visible display name (`users.display_name`). Lives on the
   * `users` table; surfaced through `v_user_profile` as of phase28 so
   * the BasicInfoCard input rehydrates correctly after a refresh.
   */
  display_name?: string | null;
  // Avatar URL (signed if private). `profile_image_url` is how
  // `/users/me` returns it; we mirror the same key here for clarity.
  profile_image_url?: string | null;
}

export interface AuthTokens {
  access_token:  string;
  refresh_token: string;
}

function lsGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function lsSet(key: string, val: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, val); } catch { /* quota / private mode — ignore */ }
}
function lsDel(key: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

// ── Tokens ────────────────────────────────────────────────────────────
export function getAccessToken():  string | null { return lsGet(K_ACCESS);  }
export function getRefreshToken(): string | null { return lsGet(K_REFRESH); }

export function setTokens(t: AuthTokens): void {
  lsSet(K_ACCESS,  t.access_token);
  lsSet(K_REFRESH, t.refresh_token);
}

export function clearTokens(): void {
  lsDel(K_ACCESS);
  lsDel(K_REFRESH);
}

// ── User ──────────────────────────────────────────────────────────────
export function getStoredUser(): AuthUser | null {
  const raw = lsGet(K_USER);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export function setStoredUser(u: AuthUser): void {
  lsSet(K_USER, JSON.stringify(u));
}

export function clearStoredUser(): void {
  lsDel(K_USER);
}

// ── Combined ──────────────────────────────────────────────────────────
export function persistSession(payload: { user: AuthUser } & AuthTokens): void {
  setTokens(payload);
  setStoredUser(payload.user);
}

export function clearSession(): void {
  clearTokens();
  clearStoredUser();
}

/** True if we have at least an access token to attempt authenticated calls. */
export function hasSession(): boolean {
  return !!getAccessToken();
}
