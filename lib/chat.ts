'use client';
/**
 * Chat client for the authenticated learner.
 *
 * Transport split (matches gum_api):
 *   • Live send/receive  → the shared Socket.io `/chat` socket (lib/presence.ts).
 *     `send_message` needs no admin RBAC — only room membership (enforced server-side).
 *   • History + attachments → REST with the Bearer access token.
 *     Attachments go to the member endpoint POST /chat-messages/room/:id
 *     (membership-gated, sender forced to the caller — no admin permission needed).
 *
 * Everything no-ops without a session, so these are safe to import anywhere.
 */
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { apiBase } from '@/lib/api';
import { getAccessToken, hasSession } from '@/lib/auth/session';
import { acquireChatSocket } from '@/lib/presence';

// ── Types ─────────────────────────────────────────────────────────────────
export interface ChatUserLite {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  /** gum_api aliases users.avatar_url → profile_picture in the message select. */
  profile_picture?: string | null;
  avatar_url?: string | null;
}

export interface ChatReaction {
  id?: number;
  emoji: string;
  user_id: number;
}

export interface ChatAttachment {
  id: number;
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  content: string | null;
  message_type: string;
  reply_to_id?: number | null;
  is_pinned?: boolean;
  is_edited?: boolean;
  created_at: string;
  users?: ChatUserLite | null;
  chat_attachments?: ChatAttachment[];
  chat_message_reactions?: ChatReaction[];
}

export interface ChatRoom {
  id: number;
  name: string | null;
  room_type: string;
  avatar_url?: string | null;
  member_count?: number;
  last_message?: ChatMessage | null;
  unread_count?: number;
  /** Room creator (owner) — used to gate pin/unpin. */
  created_by?: number | null;
  /** Resolved display fields from /chat-rooms/mine (DM → the other participant). */
  display_name?: string | null;
  display_avatar?: string | null;
}

export interface ChatReadReceipt {
  id?: number;
  room_id: number;
  user_id: number;
  last_read_message_id: number | null;
  read_at?: string | null;
  users?: ChatUserLite | null;
}

// ── Auth headers ────────────────────────────────────────────────────────────
function authHeaders(json = false): Record<string, string> {
  const t = getAccessToken();
  const h: Record<string, string> = {};
  if (t) h.Authorization = `Bearer ${t}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// ── REST ────────────────────────────────────────────────────────────────────
export async function fetchMyRooms(): Promise<ChatRoom[]> {
  if (!hasSession()) return [];
  try {
    const res = await fetch(`${apiBase()}/chat-rooms/mine`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const j = await res.json();
    return (j?.data ?? []) as ChatRoom[];
  } catch {
    return [];
  }
}

export async function fetchRoom(roomId: number): Promise<ChatRoom | null> {
  try {
    const res = await fetch(`${apiBase()}/chat-rooms/${roomId}`, { headers: authHeaders(), cache: 'no-store' });
    if (!res.ok) return null;
    const j = await res.json();
    return (j?.data ?? null) as ChatRoom | null;
  } catch {
    return null;
  }
}

export interface MessagePage {
  items: ChatMessage[];
  total: number;
  totalPages: number;
  page: number;
}

export async function fetchRoomMessages(roomId: number, page = 1, limit = 40): Promise<MessagePage> {
  const empty: MessagePage = { items: [], total: 0, totalPages: 0, page: 1 };
  try {
    const res = await fetch(`${apiBase()}/chat-messages/room/${roomId}?page=${page}&limit=${limit}`, {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return empty;
    const j = await res.json();
    return {
      items: (j?.data ?? []) as ChatMessage[],
      total: j?.pagination?.total ?? 0,
      totalPages: j?.pagination?.totalPages ?? 0,
      page: j?.pagination?.page ?? 1,
    };
  } catch {
    return empty;
  }
}

/** Pinned messages for a room (newest-first), mirrors GET /chat-messages/room/:id/pinned. */
export async function fetchPinned(roomId: number): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${apiBase()}/chat-messages/room/${roomId}/pinned`, {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const j = await res.json();
    return (j?.data ?? []) as ChatMessage[];
  } catch {
    return [];
  }
}

/** Read receipts for a room (newest-first), mirrors GET /chat-read-receipts/room/:id. */
export async function fetchReadReceipts(roomId: number): Promise<ChatReadReceipt[]> {
  try {
    const res = await fetch(`${apiBase()}/chat-read-receipts/room/${roomId}`, {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const j = await res.json();
    return (j?.data ?? []) as ChatReadReceipt[];
  } catch {
    return [];
  }
}

/** Send a file (and optional caption) via the membership-gated member endpoint. */
export async function uploadChatAttachment(roomId: number, file: File, content?: string): Promise<ChatMessage | null> {
  try {
    const fd = new FormData();
    fd.set('message_type', file.type.startsWith('image/') ? 'image' : 'file');
    if (content) fd.set('content', content);
    fd.set('attachment', file);
    const res = await fetch(`${apiBase()}/chat-messages/room/${roomId}`, {
      method: 'POST',
      headers: authHeaders(), // no Content-Type — browser sets multipart boundary
      body: fd,
    });
    if (!res.ok) return null;
    const j = await res.json();
    return (j?.data ?? null) as ChatMessage | null;
  } catch {
    return null;
  }
}

/** Create (or fetch the existing) 1:1 direct-message room with another user. */
export async function createDirectChat(userId: number): Promise<ChatRoom | null> {
  try {
    const res = await fetch(`${apiBase()}/chat-rooms/direct`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return (j?.data ?? null) as ChatRoom | null;
  } catch {
    return null;
  }
}

// ── Presentation helpers ────────────────────────────────────────────────────
export function displayName(u?: ChatUserLite | null): string {
  if (!u) return 'Member';
  return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'Member';
}

export function avatarOf(u?: ChatUserLite | null): string | null {
  return u?.profile_picture ?? u?.avatar_url ?? null;
}

export function initials(name?: string | null): string {
  const n = (name || '').trim();
  if (!n) return '?';
  const parts = n.split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || n[0].toUpperCase();
}

/** Short clock time for a message bubble (e.g. "10:42"). */
export function messageTime(iso?: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '';
  }
}

/** Relative time for the room list (e.g. "2m", "3h", "Mon"). */
export function relativeTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** Short preview text for a room's last message. */
export function previewOf(msg?: ChatMessage | null): string {
  if (!msg) return 'No messages yet';
  if (msg.message_type === 'image') return '📷 Photo';
  if (msg.message_type === 'file') return '📎 Attachment';
  if (msg.message_type === 'sticker') return 'Sticker';
  return msg.content || '';
}

// ── Shared socket hook ──────────────────────────────────────────────────────
/**
 * Acquire the app-wide shared `/chat` socket (reference-counted in presence.ts).
 * Returns null until mounted / when signed out. Callers attach their own
 * listeners with `.on(...)` and must remove them with `.off(...)` on cleanup.
 */
export function useChatSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const handle = acquireChatSocket();
    if (!handle) return;
    setSocket(handle.socket);
    return () => handle.release();
  }, []);
  return socket;
}
