'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { acceptChatInvite } from '@/lib/chat';

/**
 * Chat invite accept page — target of `${FRONTEND_URL}/chat/join/<token>`.
 * Behind the authenticated (app) layout, so the user is logged in; it accepts
 * the invite via POST /chat-invites/accept/:token then redirects into the room.
 */
export default function ChatJoinPage() {
  const params = useParams();
  const router = useRouter();
  const token = Array.isArray(params?.token) ? params.token[0] : ((params?.token as string) || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setError('Invalid invite link.');
      return;
    }
    (async () => {
      try {
        const { room_id } = await acceptChatInvite(token);
        if (!cancelled) router.replace(room_id ? `/chat/${room_id}` : '/chat');
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'This invite link is invalid or has expired.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {!error ? (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="text-sm text-slate-600">Joining the chat…</p>
          </>
        ) : (
          <>
            <p className="text-base font-medium text-slate-900">Couldn&rsquo;t join this chat</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button
              onClick={() => router.push('/chat')}
              className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to chats
            </button>
          </>
        )}
      </div>
    </div>
  );
}
