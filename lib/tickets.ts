/**
 * Support-ticket client over the gum_api /user-tickets endpoints (all routes
 * require auth + are ownership-scoped to the caller). Import only from
 * "use client" components.
 */
import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

export interface TicketCategory { id: number; name: string }
export interface TicketPriority { id: number; name: string; code?: string | null; color?: string | null }

export interface TicketRow {
  id: number;
  ticket_number: string;
  subject: string;
  description?: string | null;
  ticket_status: string;
  category_id?: number | null;
  priority_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  ticket_categories?: TicketCategory | null;
  ticket_priorities?: TicketPriority | null;
}

export interface TicketMessage {
  id: number;
  message: string;
  sender_type: string; // 'user' | 'admin' | 'system'
  sender_id?: number | null;
  created_at?: string | null;
  users?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
}

export interface TicketDetail extends TicketRow {
  messages: TicketMessage[];
}

async function authed<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const tok = getAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    method: opts.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try { json = await res.json(); } catch { /* no body */ }
  if (!res.ok || (json && json.success === false)) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return (json?.data ?? json) as T;
}

export const fetchTicketCategories = () => authed<TicketCategory[]>('/user-tickets/categories');

export function fetchMyTickets(params: { status?: string; search?: string } = {}) {
  const qs = new URLSearchParams({ limit: '50' });
  if (params.status) qs.set('ticket_status', params.status);
  if (params.search) qs.set('search', params.search);
  return authed<TicketRow[]>(`/user-tickets?${qs.toString()}`);
}

export const fetchMyTicket = (id: number | string) => authed<TicketDetail>(`/user-tickets/${id}`);

export const submitTicket = (body: { subject: string; description: string; category_id?: number | null; priority_id?: number | null }) =>
  authed<TicketRow>('/user-tickets', { method: 'POST', body });

export const replyToTicket = (id: number | string, message: string) =>
  authed<TicketMessage>(`/user-tickets/${id}/reply`, { method: 'POST', body: { message } });

export const closeTicket = (id: number | string) =>
  authed<TicketRow>(`/user-tickets/${id}/close`, { method: 'PATCH' });

// ── Attachments (ownership-scoped self-serve) ──
export interface TicketAttachment {
  id: number;
  message_id?: number | null;
  file_name: string;
  file_url: string;
  file_size?: number | null;
  file_type?: string | null;
  created_at?: string | null;
}

export const fetchTicketAttachments = (id: number | string) =>
  authed<TicketAttachment[]>(`/user-tickets/${id}/attachments`);

/** Upload one file to a ticket (optionally tied to a message). Uses multipart —
 *  the browser sets the Content-Type boundary, so we must NOT set it ourselves. */
export async function uploadTicketAttachment(id: number | string, file: File, messageId?: number | null): Promise<TicketAttachment> {
  const tok = getAccessToken();
  const fd = new FormData();
  fd.append('file', file);
  if (messageId != null) fd.append('message_id', String(messageId));
  const res = await fetch(`${apiBase()}/user-tickets/${id}/attachments`, {
    method: 'POST',
    headers: { ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    body: fd,
    cache: 'no-store',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try { json = await res.json(); } catch { /* no body */ }
  if (!res.ok || (json && json.success === false)) throw new Error(json?.error || `Upload failed (${res.status})`);
  return (json?.data ?? json) as TicketAttachment;
}

// ── Shared status styling ──
export const TICKET_STATUS_STYLE: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  awaiting_reply: 'bg-purple-50 text-purple-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
};
export const ticketStatusLabel = (s?: string | null) =>
  (s || 'open').split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
