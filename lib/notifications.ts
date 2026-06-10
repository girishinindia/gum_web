'use client';
/**
 * Self-serve notifications client for the authenticated learner / instructor.
 *
 * Every call hits the JWT-scoped `/notifications/me/*` and
 * `/notification-preferences/me` endpoints — the server scopes each row to the
 * current user, so nothing here takes a userId. All functions no-op (return
 * empty/zero) when there is no session, so they're safe to call on public pages.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CreditCard, Award, Radio, MessageSquare, LifeBuoy, type LucideIcon } from 'lucide-react';
import { apiBase } from '@/lib/api';
import { getAccessToken, hasSession } from '@/lib/auth/session';

export interface AppNotification {
  id: number;
  notification_type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  read_at: string | null;
  reference_type: string | null;
  reference_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreference {
  id?: number;
  notification_type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  is_active?: boolean;
}

export interface NotificationPage {
  items: AppNotification[];
  total: number;
  page: number;
  totalPages: number;
}

function authHeaders(json = false): Record<string, string> {
  const t = getAccessToken();
  const h: Record<string, string> = {};
  if (t) h.Authorization = `Bearer ${t}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// ── Reads ───────────────────────────────────────────────────────────────
export async function fetchMyNotifications(
  opts: { page?: number; limit?: number; unreadOnly?: boolean; type?: string } = {},
): Promise<NotificationPage> {
  const empty: NotificationPage = { items: [], total: 0, page: 1, totalPages: 0 };
  if (!hasSession()) return empty;
  const qs = new URLSearchParams();
  qs.set('page', String(opts.page ?? 1));
  qs.set('limit', String(opts.limit ?? 20));
  if (opts.unreadOnly) qs.set('is_read', 'false');
  if (opts.type) qs.set('notification_type', opts.type);
  try {
    const res = await fetch(`${apiBase()}/notifications/me?${qs.toString()}`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return empty;
    const j = await res.json();
    return {
      items: (j?.data ?? []) as AppNotification[],
      total: j?.pagination?.total ?? 0,
      page: j?.pagination?.page ?? 1,
      totalPages: j?.pagination?.totalPages ?? 0,
    };
  } catch {
    return empty;
  }
}

export async function fetchMyUnreadCount(): Promise<number> {
  if (!hasSession()) return 0;
  try {
    const res = await fetch(`${apiBase()}/notifications/me/unread-count`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return 0;
    const j = await res.json();
    return Number(j?.data?.unread_count ?? 0);
  } catch {
    return 0;
  }
}

// ── Writes ──────────────────────────────────────────────────────────────
export async function markNotificationRead(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/notifications/me/${id}/read`, { method: 'PATCH', headers: authHeaders() });
    return res.ok;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(): Promise<number> {
  try {
    const res = await fetch(`${apiBase()}/notifications/me/read-all`, { method: 'PATCH', headers: authHeaders() });
    if (!res.ok) return 0;
    const j = await res.json();
    return Number(j?.data?.marked ?? 0);
  } catch {
    return 0;
  }
}

export async function dismissNotification(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/notifications/me/${id}`, { method: 'DELETE', headers: authHeaders() });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Preferences ─────────────────────────────────────────────────────────
export async function fetchMyPreferences(): Promise<NotificationPreference[]> {
  if (!hasSession()) return [];
  try {
    const res = await fetch(`${apiBase()}/notification-preferences/me`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const j = await res.json();
    return (j?.data ?? []) as NotificationPreference[];
  } catch {
    return [];
  }
}

export async function updateMyPreference(
  body: { notification_type: string } & Partial<Omit<NotificationPreference, 'notification_type'>>,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/notification-preferences/me`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Presentation helpers ────────────────────────────────────────────────
export function notificationTime(iso: string): string {
  const d = new Date(iso);
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** Map a notification_type → an icon + accent classes for the inbox row. */
export function notificationVisual(type: string): { Icon: LucideIcon; accent: string } {
  const t = (type || '').toLowerCase();
  if (t.includes('payment') || t.includes('refund') || t.includes('payout') || t.includes('earning'))
    return { Icon: CreditCard, accent: 'bg-emerald-50 text-emerald-700' };
  if (t.includes('enroll') || t.includes('course') || t.includes('certificate'))
    return { Icon: Award, accent: 'bg-violet-50 text-violet-700' };
  if (t.includes('live') || t.includes('webinar') || t.includes('session') || t.includes('reminder'))
    return { Icon: Radio, accent: 'bg-rose-50 text-rose-600' };
  if (t.includes('reply') || t.includes('message') || t.includes('discussion') || t.includes('comment') || t.includes('chat'))
    return { Icon: MessageSquare, accent: 'bg-brand-50 text-brand-700' };
  if (t.includes('ticket') || t.includes('support'))
    return { Icon: LifeBuoy, accent: 'bg-amber-50 text-amber-700' };
  return { Icon: Bell, accent: 'bg-slate-100 text-slate-600' };
}

/** Humanise a notification_type for tab/category labels: "payment_received" → "Payment received". */
export function prettyType(type: string): string {
  return (type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Unread-count hook (polls; no-ops when logged out) ────────────────────
export function useUnreadCount(pollMs = 60000): { count: number; refresh: () => void } {
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    fetchMyUnreadCount().then(setCount).catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasSession()) {
      setCount(0);
      return;
    }
    refresh();
    timer.current = setInterval(refresh, pollMs);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      if (timer.current) clearInterval(timer.current);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh, pollMs]);

  return { count, refresh };
}
