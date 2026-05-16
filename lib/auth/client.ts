/**
 * Typed HTTP client for the gum_api auth + profile endpoints.
 *
 * Every function maps 1:1 to a server route documented in
 *   gum_api/src/modules/auth/auth.routes.ts
 *   gum_api/src/modules/profile/profile.routes.ts
 *
 * Responses come back wrapped in `{ success, data, error, message }` by
 * `utils/response.ts` on the server. We unwrap them here so callers see
 * either the typed `data` payload or a thrown `AuthApiError` with the
 * server's user-facing `error` string + status code.
 *
 * Uses `apiBase()` so the same code works whether the user is on
 * localhost, a LAN IP, or a deployed domain (see lib/api.ts comment).
 */

import { apiBase } from '@/lib/api';
import { getAccessToken } from './session';
import type { AuthTokens, AuthUser } from './session';

// ── Error class ───────────────────────────────────────────────────────
export class AuthApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.details = details;
  }
}

// ── Low-level fetch wrapper ───────────────────────────────────────────
interface ApiEnvelope<T> {
  success: boolean;
  data?:   T;
  message?: string;
  error?:  string;
  status?: number;
  details?: unknown;
}

interface CallOpts {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?:   unknown;
  auth?:   boolean;   // include Bearer token
}

async function call<T>(path: string, opts: CallOpts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth) {
    const tok = getAccessToken();
    if (tok) headers['Authorization'] = `Bearer ${tok}`;
  }

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: opts.method ?? 'POST',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      // No cache for auth — these are stateful operations.
      cache: 'no-store',
    });
  } catch (networkErr) {
    throw new AuthApiError('Network error. Please check your connection.', 0, networkErr);
  }

  let json: ApiEnvelope<T>;
  try {
    json = await res.json();
  } catch {
    // Some 5xx responses may not have JSON bodies.
    throw new AuthApiError(`Server error (${res.status})`, res.status);
  }

  if (!res.ok || json.success === false) {
    const msg = json.error || json.message || `Request failed (${res.status})`;
    throw new AuthApiError(msg, res.status, json.details);
  }
  return (json.data as T) ?? (json as unknown as T);
}

// ── Auth flow types ───────────────────────────────────────────────────

export interface OtpInitiateResult {
  pending_id:              string;
  email:                   string;   // masked
  mobile:                  string;   // masked
  otp_expiry_seconds:      number;
  resend_cooldown_seconds: number;
}

export interface VerifyOtpProgress {
  both_verified:   boolean;
  email_verified:  boolean;
  mobile_verified: boolean;
}

export interface VerifyOtpComplete extends AuthTokens {
  user: AuthUser;
}

export type VerifyOtpResult = VerifyOtpProgress | VerifyOtpComplete;

export function isOtpComplete(r: VerifyOtpResult): r is VerifyOtpComplete {
  return typeof (r as VerifyOtpComplete).access_token === 'string';
}

export interface ResetInitiateResult extends OtpInitiateResult {
  reset_pending_id: string;
}

export interface ResetVerifyProgress extends VerifyOtpProgress {
  can_reset_password: boolean;
}

// ── Public auth endpoints ─────────────────────────────────────────────

export function register(input: {
  first_name: string;
  last_name:  string;
  email:      string;
  mobile:     string;
  password:   string;
  /**
   * UI hint, NOT persisted by /auth/register. The role chosen here is
   * stashed by the signup page in component state, then sent to
   * `assignMyRole()` immediately after `verifyRegisterOtp()` issues
   * tokens. Sending it on register is harmless — Zod strips unknown keys.
   */
  role?:      SelfAssignableRole;
}): Promise<OtpInitiateResult> {
  return call<OtpInitiateResult>('/auth/register', { body: input });
}

export function verifyRegisterOtp(input: {
  pending_id: string;
  channel:    'email' | 'mobile';
  otp:        string;
}): Promise<VerifyOtpResult> {
  return call<VerifyOtpResult>('/auth/verify-otp', { body: input });
}

export function resendRegisterOtp(input: {
  pending_id: string;
  channel:    'email' | 'mobile';
}): Promise<{ otp_expiry_seconds: number }> {
  return call('/auth/resend-otp', { body: input });
}

export function login(input: {
  identifier: string;
  password:   string;
}): Promise<VerifyOtpComplete> {
  return call<VerifyOtpComplete>('/auth/login', { body: input });
}

export function refresh(input: {
  refresh_token: string;
}): Promise<VerifyOtpComplete> {
  return call<VerifyOtpComplete>('/auth/refresh', { body: input });
}

export function logout(input: { refresh_token: string | null }): Promise<null> {
  return call<null>('/auth/logout', { body: input, auth: true });
}

// ── Forgot password ───────────────────────────────────────────────────

export function forgotPassword(input: {
  email:  string;
  mobile: string;
}): Promise<ResetInitiateResult> {
  return call<ResetInitiateResult>('/auth/forgot-password', { body: input });
}

export function verifyResetOtp(input: {
  reset_pending_id: string;
  channel:          'email' | 'mobile';
  otp:              string;
}): Promise<ResetVerifyProgress> {
  return call<ResetVerifyProgress>('/auth/verify-reset-otp', { body: input });
}

export function resendResetOtp(input: {
  reset_pending_id: string;
  channel:          'email' | 'mobile';
}): Promise<{ otp_expiry_seconds: number }> {
  return call('/auth/resend-reset-otp', { body: input });
}

export function resetPassword(input: {
  reset_pending_id: string;
  new_password:     string;
}): Promise<null> {
  return call<null>('/auth/reset-password', { body: input });
}

// ── Authenticated profile mutations ───────────────────────────────────

// Change password (dual OTP: email + mobile)
export function changePasswordInitiate(input: { old_password: string }): Promise<OtpInitiateResult & { pending_id: string }> {
  return call('/profile/change-password/initiate', { body: input, auth: true });
}
export function changePasswordVerifyOtp(input: { pending_id: string; channel: 'email' | 'mobile'; otp: string }): Promise<VerifyOtpProgress & { can_set_password: boolean }> {
  return call('/profile/change-password/verify-otp', { body: input, auth: true });
}
export function changePasswordConfirm(input: { pending_id: string; new_password: string }): Promise<{ logged_out: boolean }> {
  return call('/profile/change-password/confirm', { body: input, auth: true });
}
export function changePasswordResendOtp(input: { pending_id: string; channel: 'email' | 'mobile' }): Promise<{ otp_expiry_seconds: number }> {
  return call('/profile/change-password/resend-otp', { body: input, auth: true });
}

// Update email (single OTP to NEW email)
export function updateEmailInitiate(input: { new_email: string }): Promise<{ pending_id: string; new_email: string; otp_expiry_seconds: number; resend_cooldown_seconds: number }> {
  return call('/profile/update-email/initiate', { body: input, auth: true });
}
export function updateEmailVerifyOtp(input: { pending_id: string; otp: string }): Promise<{ logged_out: boolean; new_email: string }> {
  return call('/profile/update-email/verify-otp', { body: input, auth: true });
}
export function updateEmailResendOtp(input: { pending_id: string }): Promise<{ otp_expiry_seconds: number }> {
  return call('/profile/update-email/resend-otp', { body: input, auth: true });
}

// ── Self-service role assignment (post-signup) ────────────────────────

/**
 * The two roles a user is allowed to self-assign immediately after
 * completing OTP verification. Mirrors the server's
 * `SELF_ASSIGNABLE_ROLES` allow-list in `user.schema.ts`. Anything
 * else (admin, faculty, super_admin) returns 400 / 403 from the API.
 */
export type SelfAssignableRole = 'student' | 'instructor';

export interface SelfRoleAssignment {
  role_id:       number;
  role:          string;
  display_name?: string;
}

/**
 * POST /users/me/roles — write the user's chosen role into `user_roles`.
 *
 * Called by the signup page right after `verifyRegisterOtp()` issues
 * tokens. At that point the user exists in `users` but has no role,
 * so admin-portal queries like "list all instructors" would miss them.
 * This call closes that gap.
 *
 * Idempotent on the server — calling twice with the same role is safe.
 * We retry up to 3 times with exponential backoff so a flaky network
 * doesn't leave the user role-less.
 */
export async function assignMyRole(role: SelfAssignableRole): Promise<SelfRoleAssignment> {
  let lastErr: unknown;
  const delays = [0, 400, 1200]; // ms — instant, 0.4s, 1.2s
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) await new Promise((r) => setTimeout(r, delays[i]));
    try {
      return await call<SelfRoleAssignment>('/users/me/roles', { body: { role }, auth: true });
    } catch (e) {
      lastErr = e;
      // Don't retry on 4xx (validation, forbidden, conflict) — only on network/5xx
      if (e instanceof AuthApiError && e.status >= 400 && e.status < 500) throw e;
    }
  }
  throw lastErr ?? new AuthApiError('Role assignment failed after retries', 0);
}

// Update mobile (single OTP to NEW mobile)
export function updateMobileInitiate(input: { new_mobile: string }): Promise<{ pending_id: string; new_mobile: string; otp_expiry_seconds: number; resend_cooldown_seconds: number }> {
  return call('/profile/update-mobile/initiate', { body: input, auth: true });
}
export function updateMobileVerifyOtp(input: { pending_id: string; otp: string }): Promise<{ logged_out: boolean; new_mobile: string }> {
  return call('/profile/update-mobile/verify-otp', { body: input, auth: true });
}
export function updateMobileResendOtp(input: { pending_id: string }): Promise<{ otp_expiry_seconds: number }> {
  return call('/profile/update-mobile/resend-otp', { body: input, auth: true });
}
