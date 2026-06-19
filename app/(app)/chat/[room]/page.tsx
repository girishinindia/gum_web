'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Send, Paperclip, SmilePlus, Trash2, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  fetchRoom, fetchRoomMessages, uploadChatAttachment, useChatSocket,
  displayName, avatarOf, initials, messageTime,
  type ChatRoom, type ChatMessage, type ChatReaction,
} from '@/lib/chat';

const REACTIONS = ['👍', '❤️', '😂', '🎉', '🙏', '🔥'];

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = Number(Array.isArray(params?.room) ? params?.room[0] : params?.room);
  const { user } = useAuth();
  const me = user?.id ?? 0;
  const socket = useChatSocket();

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({});
  const [reactionFor, setReactionFor] = useState<number | null>(null);
  const [closed, setClosed] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
  }, []);

  // ── Load room meta + message history ──
  useEffect(() => {
    if (!roomId) return;
    let alive = true;
    setLoading(true);
    Promise.all([fetchRoom(roomId), fetchRoomMessages(roomId, 1, 40)]).then(([r, page]) => {
      if (!alive) return;
      setRoom(r);
      setMessages([...page.items].reverse()); // API returns newest-first
      // A deleted/inactive room now 404s → fetchRoom returns null.
      setClosed(r ? null : 'This conversation is no longer available.');
      setLoading(false);
      scrollToBottom(false);
    });
    return () => { alive = false; };
  }, [roomId, scrollToBottom]);

  // ── Join room + live listeners ──
  useEffect(() => {
    if (!socket || !roomId) return;
    const join = () => socket.emit('join_room', { roomId }, () => {});
    join();
    socket.on('connect', join);

    const onNew = (p: { roomId: number; message: ChatMessage }) => {
      if (p.roomId !== roomId) return;
      setMessages((prev) => (prev.some((m) => m.id === p.message.id) ? prev : [...prev, p.message]));
      if (p.message.sender_id !== me) socket.emit('mark_read', { roomId, lastReadMessageId: p.message.id });
      scrollToBottom();
    };
    const onDeleted = (p: { roomId: number; messageId: number }) => {
      if (p.roomId !== roomId) return;
      setMessages((prev) => prev.filter((m) => m.id !== p.messageId));
    };
    const onEdited = (p: { roomId: number; message: ChatMessage }) => {
      if (p.roomId !== roomId) return;
      setMessages((prev) => prev.map((m) => (m.id === p.message.id ? p.message : m)));
    };
    const onTyping = (p: { roomId: number; userId: number; user?: { name?: string }; isTyping: boolean }) => {
      if (p.roomId !== roomId || p.userId === me) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (p.isTyping) next[p.userId] = p.user?.name || 'Someone';
        else delete next[p.userId];
        return next;
      });
    };
    const onReactionAdded = (p: { roomId: number; messageId: number; userId: number; emoji: string }) => {
      if (p.roomId !== roomId) return;
      setMessages((prev) => prev.map((m) => {
        if (m.id !== p.messageId) return m;
        const list = m.chat_message_reactions ? [...m.chat_message_reactions] : [];
        if (!list.some((r) => r.user_id === p.userId && r.emoji === p.emoji)) list.push({ emoji: p.emoji, user_id: p.userId });
        return { ...m, chat_message_reactions: list };
      }));
    };
    const onReactionRemoved = (p: { roomId: number; messageId: number; userId: number; emoji: string }) => {
      if (p.roomId !== roomId) return;
      setMessages((prev) => prev.map((m) => {
        if (m.id !== p.messageId) return m;
        const list = (m.chat_message_reactions || []).filter((r) => !(r.user_id === p.userId && r.emoji === p.emoji));
        return { ...m, chat_message_reactions: list };
      }));
    };

    // Room soft-deleted / deactivated while viewing → lock it down.
    const onRoomClosed = (p: { roomId: number; reason?: string | null }) => {
      if (p.roomId !== roomId) return;
      setClosed(p.reason || 'This conversation has been closed.');
    };

    socket.on('new_message', onNew);
    socket.on('message_deleted', onDeleted);
    socket.on('message_edited', onEdited);
    socket.on('user_typing', onTyping);
    socket.on('reaction_added', onReactionAdded);
    socket.on('reaction_removed', onReactionRemoved);
    socket.on('room_closed', onRoomClosed);

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('connect', join);
      socket.off('new_message', onNew);
      socket.off('message_deleted', onDeleted);
      socket.off('message_edited', onEdited);
      socket.off('user_typing', onTyping);
      socket.off('reaction_added', onReactionAdded);
      socket.off('reaction_removed', onReactionRemoved);
      socket.off('room_closed', onRoomClosed);
    };
  }, [socket, roomId, me, scrollToBottom]);

  // ── Mark the newest message read once history is in ──
  useEffect(() => {
    if (!socket || !roomId || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last && last.id > 0) socket.emit('mark_read', { roomId, lastReadMessageId: last.id });
  }, [socket, roomId, messages.length]);

  // ── Typing ──
  const sendTyping = useCallback((typing: boolean) => {
    if (socket) socket.emit(typing ? 'typing_start' : 'typing_stop', { roomId });
  }, [socket, roomId]);

  const onChangeText = (v: string) => {
    setText(v);
    const now = Date.now();
    if (now - lastTypingSent.current > 1500) { sendTyping(true); lastTypingSent.current = now; }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(false), 1800);
  };

  // ── Send text (via socket — membership-checked server-side) ──
  const send = useCallback(() => {
    const content = text.trim();
    if (!content || !socket) return;
    setSending(true);
    setError(null);
    socket.emit('send_message', { roomId, content, messageType: 'text' }, (ack: any) => {
      setSending(false);
      if (!ack?.success) { setError(ack?.error || 'Failed to send message'); return; }
      setText('');
      sendTyping(false);
      // The message arrives via the new_message broadcast (dedup by id).
    });
  }, [text, socket, roomId, sendTyping]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // ── Attachment (via membership-gated REST endpoint) ──
  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSending(true);
    setError(null);
    const msg = await uploadChatAttachment(roomId, file, text.trim() || undefined);
    setSending(false);
    if (!msg) { setError('Attachment upload failed'); return; }
    setText('');
  };

  const toggleReaction = (messageId: number, emoji: string) => {
    if (socket) socket.emit('react_to_message', { messageId, emoji }, () => {});
    setReactionFor(null);
  };

  const deleteOwn = (messageId: number) => {
    if (socket) socket.emit('delete_message', { messageId }, () => {});
  };

  const typingLabel = useMemo(() => {
    const names = Object.values(typingUsers);
    if (names.length === 0) return '';
    if (names.length === 1) return `${names[0]} is typing…`;
    return `${names.length} people are typing…`;
  }, [typingUsers]);

  // Header name — for DMs derive the other participant from messages.
  const headerName = useMemo(() => {
    if (room && room.room_type !== 'direct') return room.name || 'Conversation';
    const other = messages.find((m) => m.sender_id !== me && m.users);
    if (other?.users) return displayName(other.users);
    return room?.name || 'Direct message';
  }, [room, messages, me]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden h-[calc(100vh-9rem)] flex flex-col">
        {/* Header */}
        <header className="px-5 py-3 border-b border-slate-200 flex items-center gap-3">
          <Link href="/chat" className="h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-[12px] font-bold flex items-center justify-center">
            {initials(headerName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{loading ? 'Loading…' : headerName}</div>
            <div className="text-[11px] text-slate-500 h-[14px]">
              {typingLabel
                ? <span className="text-brand-600">{typingLabel}</span>
                : room?.member_count
                  ? `${room.member_count} member${room.member_count === 1 ? '' : 's'}`
                  : ''}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : closed ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-6">
              <div className="text-sm text-slate-500">{closed}</div>
              <Link href="/chat" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Back to conversations</Link>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">No messages yet — say hello 👋</div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === me;
              const reactions = groupReactions(m.chat_message_reactions, me);
              return (
                <div key={m.id} className={`group flex gap-2.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                  {!mine && (
                    avatarOf(m.users)
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={avatarOf(m.users)!} alt="" className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5" />
                      : <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{initials(displayName(m.users))}</div>
                  )}

                  <div className={`max-w-[78%] sm:max-w-md ${mine ? 'items-end text-right' : ''} flex flex-col`}>
                    {!mine && <div className="text-[11px] text-slate-500 mb-0.5">{displayName(m.users)}</div>}

                    <div className={`relative inline-block ${mine ? 'self-end' : 'self-start'}`}>
                      {/* Attachments */}
                      {m.chat_attachments && m.chat_attachments.length > 0 && (
                        <div className="mb-1 space-y-1">
                          {m.chat_attachments.map((a) => (
                            (a.file_type || '').startsWith('image/')
                              ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="block">
                                  <img src={a.file_url} alt={a.file_name} className="rounded-lg max-h-60 object-cover border border-slate-200" />
                                </a>
                              ) : (
                                <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer"
                                   className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  <span className="truncate max-w-[200px]">{a.file_name}</span>
                                </a>
                              )
                          ))}
                        </div>
                      )}

                      {/* Text bubble */}
                      {m.content && (
                        <div className={`inline-block rounded-2xl px-3.5 py-2 text-sm text-left break-words ${mine ? 'bg-brand-500 text-white shadow-btn' : 'bg-slate-100 text-slate-800'}`}>
                          {m.content}
                        </div>
                      )}

                      {/* Hover actions */}
                      <div className={`absolute top-0 ${mine ? '-left-16' : '-right-16'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                        <button
                          onClick={() => setReactionFor(reactionFor === m.id ? null : m.id)}
                          className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-brand-600 flex items-center justify-center shadow-sm"
                          aria-label="React"
                        >
                          <SmilePlus className="h-3.5 w-3.5" />
                        </button>
                        {mine && (
                          <button
                            onClick={() => deleteOwn(m.id)}
                            className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-sm"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Reaction palette */}
                      {reactionFor === m.id && (
                        <div className={`absolute z-10 top-8 ${mine ? 'right-0' : 'left-0'} flex items-center gap-1 rounded-full bg-white border border-slate-200 shadow-lg px-2 py-1`}>
                          {REACTIONS.map((e) => (
                            <button key={e} onClick={() => toggleReaction(m.id, e)} className="text-lg leading-none hover:scale-125 transition-transform">{e}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reaction chips */}
                    {reactions.length > 0 && (
                      <div className={`mt-1 flex flex-wrap gap-1 ${mine ? 'justify-end' : ''}`}>
                        {reactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => toggleReaction(m.id, r.emoji)}
                            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] ${r.mine ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}
                          >
                            <span>{r.emoji}</span><span>{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 mt-0.5">{messageTime(m.created_at)}{m.is_edited ? ' · edited' : ''}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Error */}
        {error && <div className="px-5 py-1.5 text-[12px] text-rose-600 bg-rose-50 border-t border-rose-100">{error}</div>}

        {/* Composer */}
        <div className="border-t border-slate-200 p-3 flex items-center gap-2">
          <input ref={fileRef} type="file" className="hidden" onChange={onPickFile} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={sending || !!closed}
            className="h-9 w-9 rounded-full hover:bg-brand-50 text-slate-500 hover:text-brand-700 flex items-center justify-center disabled:opacity-50"
            aria-label="Attach a file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={sending || !!closed}
            className="flex-1 rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 disabled:opacity-60"
            placeholder={closed ? 'Conversation closed' : 'Type a message…'}
          />
          <button
            onClick={send}
            disabled={sending || !!closed || !text.trim()}
            className="h-10 w-10 rounded-full bg-brand-500 text-white shadow-btn flex items-center justify-center hover:shadow-btnHover disabled:opacity-50"
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Collapse a reaction list into { emoji, count, mine } chips. */
function groupReactions(list: ChatReaction[] | undefined, me: number): { emoji: string; count: number; mine: boolean }[] {
  const map: Record<string, { emoji: string; count: number; mine: boolean }> = {};
  for (const r of list || []) {
    if (!map[r.emoji]) map[r.emoji] = { emoji: r.emoji, count: 0, mine: false };
    map[r.emoji].count += 1;
    if (r.user_id === me) map[r.emoji].mine = true;
  }
  return Object.values(map);
}
