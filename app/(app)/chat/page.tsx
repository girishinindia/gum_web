'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Loader2 } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  fetchMyRooms, useChatSocket, relativeTime, previewOf, initials,
  type ChatRoom, type ChatMessage,
} from '@/lib/chat';

export default function ChatListPage() {
  const { user } = useAuth();
  const me = user?.id ?? 0;
  const socket = useChatSocket();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  // Initial load
  useEffect(() => {
    let alive = true;
    fetchMyRooms().then((r) => {
      if (!alive) return;
      setRooms(r);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  // Live: move a room to the top + refresh its preview / unread on new messages
  useEffect(() => {
    if (!socket) return;
    const onNew = (payload: { roomId: number; message: ChatMessage }) => {
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r.id === payload.roomId);
        if (idx === -1) {
          // A room we don't have yet (just added / first DM) → resync.
          fetchMyRooms().then(setRooms).catch(() => {});
          return prev;
        }
        const room: ChatRoom = {
          ...prev[idx],
          last_message: payload.message,
          unread_count:
            payload.message.sender_id === me ? 0 : (prev[idx].unread_count ?? 0) + 1,
        };
        const next = [...prev];
        next.splice(idx, 1);
        return [room, ...next];
      });
    };
    socket.on('new_message', onNew);
    return () => { socket.off('new_message', onNew); };
  }, [socket, me]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rooms;
    return rooms.filter(
      (r) =>
        (r.display_name || r.name || '').toLowerCase().includes(s) ||
        (r.last_message?.content || '').toLowerCase().includes(s),
    );
  }, [rooms, q]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Eyebrow>Chat</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Conversations</h1>

      <div className="mt-6 grid lg:grid-cols-[340px_1fr] gap-6 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        {/* Left list */}
        <aside className="border-r border-slate-200 min-h-[520px]">
          <div className="p-3 border-b border-slate-200">
            <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="Search conversations"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {q ? 'No conversations match your search.' : 'No conversations yet.'}
              </p>
            </div>
          ) : (
            <ul>
              {filtered.map((r, i) => {
                const name = r.display_name || r.name || 'Conversation';
                return (
                  <li key={r.id}>
                    <Link
                      href={`/chat/${r.id}`}
                      className={`flex items-center gap-3 p-3 hover:bg-brand-50/30 transition-colors ${i > 0 ? 'border-t border-slate-100' : ''}`}
                    >
                      {r.display_avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.display_avatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                          {initials(name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-slate-900 truncate">{name}</div>
                          <div className="text-[10.5px] text-slate-400 shrink-0">{relativeTime(r.last_message?.created_at)}</div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className={`text-[12px] truncate ${(r.unread_count ?? 0) > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                            {previewOf(r.last_message)}
                          </div>
                          {(r.unread_count ?? 0) > 0 && (
                            <span className="bg-brand-500 text-white rounded-full text-[10px] font-bold px-1.5 min-w-[18px] text-center shrink-0">
                              {r.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Right placeholder */}
        <div className="hidden lg:flex items-center justify-center min-h-[520px] p-10 text-center">
          <div>
            <div className="mx-auto h-16 w-16 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h2 className="mt-4 heading text-lg text-slate-900">Pick a conversation</h2>
            <p className="mt-1 text-sm text-slate-500">Select a thread from the left to start messaging.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
