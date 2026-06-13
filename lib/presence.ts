/**
 * BUG-31: shared presence/chat socket helper.
 *
 * The API exposes a socket.io `/chat` namespace (gum_api/src/socket). Connecting
 * to it is what marks a user "online" in the cluster-safe `online_users` roster
 * the admin dashboard counts — so the admin "Online Users" stat stayed at 0
 * because the web only ever connected on chat pages (which are not built yet).
 *
 * This module owns a SINGLE shared connection per access token, reference-
 * counted across callers (the app-shell presence provider today, any future
 * chat page tomorrow). Calling `acquireChatSocket()` twice returns the same
 * underlying socket and never opens a second connection — that's the
 * "don't double-connect" guard. The connection is torn down when the last
 * holder releases it (e.g. sign-out / unmount).
 *
 * Mirrors the admin portal's connection options (app/(admin)/chat-monitoring),
 * pointed at `/chat` and authed with the web's access token.
 */
import { io, type Socket } from 'socket.io-client';
import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

/** Server root = API base with the trailing `/api/v<n>` stripped (same as admin). */
function socketUrl(): string {
  return apiBase().replace(/\/api\/v\d+$/, '');
}

let shared: { token: string; socket: Socket; refs: number; heartbeat?: ReturnType<typeof setInterval> } | null = null;

/** Open (or reuse) the shared `/chat` socket for the current user. */
function connect(token: string): Socket {
  const socket = io(`${socketUrl()}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 10,
  });
  // The API refreshes presence TTL on `heartbeat` (5-min Redis TTL). Ping well
  // inside that window so long-idle tabs keep counting as online.
  const heartbeat = setInterval(() => { if (socket.connected) socket.emit('heartbeat'); }, 60_000);
  shared = { token, socket, refs: 0, heartbeat };
  return socket;
}

/**
 * Acquire the shared chat socket. Returns the socket plus a `release()` that
 * must be called when the holder is done (sign-out / unmount). Returns null
 * when there's no access token (signed-out) or during SSR.
 */
export function acquireChatSocket(): { socket: Socket; release: () => void } | null {
  if (typeof window === 'undefined') return null;
  const token = getAccessToken();
  if (!token) return null;

  // Token changed (re-login / refresh) → drop the stale socket first.
  if (shared && shared.token !== token) {
    teardown();
  }
  const sock = shared?.socket ?? connect(token);
  shared!.refs += 1;

  let released = false;
  return {
    socket: sock,
    release() {
      if (released) return;
      released = true;
      if (!shared) return;
      shared.refs -= 1;
      if (shared.refs <= 0) teardown();
    },
  };
}

function teardown() {
  if (!shared) return;
  if (shared.heartbeat) clearInterval(shared.heartbeat);
  try { shared.socket.disconnect(); } catch { /* already gone */ }
  shared = null;
}
