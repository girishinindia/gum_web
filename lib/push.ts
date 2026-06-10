'use client';
/**
 * Web Push (VAPID) client for gum_web — mirrors the admin portal helper but
 * uses the learner's JWT from local session. All functions short-circuit when
 * `window`/push APIs are unavailable, so they're safe to import anywhere.
 *
 * Flow: register `/sw.js` → request permission → `PushManager.subscribe` with
 * the server's VAPID public key → POST the subscription to `/push-devices/register`.
 */
import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

export function pushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function pushPermission(): NotificationPermission | 'unsupported' {
  if (!pushSupported()) return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(safe);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function fetchVapidPublicKey(): Promise<string> {
  const res = await fetch(`${apiBase()}/push/vapid-public-key`);
  if (!res.ok) throw new Error('Failed to fetch VAPID public key');
  const body = await res.json();
  const key = body?.data?.vapidPublicKey;
  if (!key) throw new Error('VAPID public key missing');
  return key;
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return false;
  return !!(await reg.pushManager.getSubscription());
}

/** Full opt-in flow. Returns the outcome for UI messaging. */
export async function enablePush(): Promise<'subscribed' | 'denied' | 'unsupported' | 'error'> {
  if (!pushSupported()) return 'unsupported';
  const token = getAccessToken();
  if (!token) return 'error';

  try {
    const reg =
      (await navigator.serviceWorker.getRegistration('/sw.js')) ??
      (await navigator.serviceWorker.register('/sw.js'));

    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm !== 'granted') return 'denied';

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const vapid = await fetchVapidPublicKey();
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as unknown as BufferSource,
      });
    }

    const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    const res = await fetch(`${apiBase()}/push-devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        user_agent: navigator.userAgent,
        platform: 'web',
      }),
    });
    return res.ok ? 'subscribed' : 'error';
  } catch {
    return 'error';
  }
}

/** Unsubscribe locally and deactivate the device row on the server. */
export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const token = getAccessToken();
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  if (token) {
    await fetch(`${apiBase()}/push-devices/${encodeURIComponent(endpoint)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}
