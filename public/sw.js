/* eslint-disable no-restricted-globals */
/**
 * Grow Up More — Web Service Worker (Web Push).
 *
 *   • Receives encrypted Web Push payloads and calls showNotification().
 *   • On click, focuses an already-open matching tab or opens a new one.
 *
 * Served from the site origin and registered via
 * navigator.serviceWorker.register('/sw.js') in lib/push.ts.
 * Keep it dependency-free — service workers have no build step.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try { payload = event.data.json(); } catch (e) { payload = { title: 'Grow Up More', body: event.data.text() }; }

  const title = payload.title || 'Grow Up More';
  const options = {
    body:  payload.body  || '',
    icon:  payload.icon  || '/icons/notification.png',
    badge: payload.badge || '/icons/badge.png',
    // `renotify` REQUIRES a non-empty tag, else the browser throws and the
    // notification never shows. Always provide a tag fallback.
    tag:   payload.tag || 'gum-notification',
    data: { url: payload.url || '/', ...(payload.data || {}) },
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
  })());
});
