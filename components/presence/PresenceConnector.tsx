'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { acquireChatSocket } from '@/lib/presence';

/**
 * BUG-31 (web half): keep a signed-in user marked "online" app-wide.
 *
 * The admin "Online Users" stat counts connections to the API's `/chat` socket
 * namespace, but the web only connected on chat pages — so it always read 0.
 * Mounting this once inside the authenticated app shell opens the shared
 * presence socket as soon as the user is signed in and releases it on
 * sign-out (or unmount). It renders nothing.
 *
 * Double-connect guard: the connection comes from `acquireChatSocket()`, a
 * reference-counted singleton. If a future chat page acquires the same socket
 * it reuses this one connection instead of opening a second.
 */
export function PresenceConnector() {
  const { signedIn, user } = useAuth();

  useEffect(() => {
    if (!signedIn || !user) return;
    const handle = acquireChatSocket();
    return () => handle?.release();
    // Re-acquire if the signed-in user changes (re-login as someone else).
  }, [signedIn, user?.id]);

  return null;
}
