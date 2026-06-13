'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Send, Loader2, CheckCircle2, Paperclip, X, FileText } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  fetchMyTicket, replyToTicket, closeTicket,
  fetchTicketAttachments, uploadTicketAttachment,
  TICKET_STATUS_STYLE, ticketStatusLabel,
  type TicketDetail, type TicketMessage, type TicketAttachment,
} from '@/lib/tickets';

function AttachmentList({ items, align = 'left' }: { items: TicketAttachment[]; align?: 'left' | 'right' }) {
  if (!items.length) return null;
  return (
    <div className={`mt-1 flex flex-wrap gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
      {items.map((a) => {
        const isImg = (a.file_type || '').startsWith('image/');
        return isImg ? (
          <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.file_url} alt={a.file_name} className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
          </a>
        ) : (
          <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 max-w-[150px]">
            <FileText className="h-3 w-3 text-slate-400 shrink-0" /> <span className="truncate">{a.file_name}</span>
          </a>
        );
      })}
    </div>
  );
}

function senderName(m: TicketMessage): string {
  if (m.sender_type === 'user') return 'You';
  if (m.sender_type === 'system') return 'System';
  const u = m.users;
  const n = u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '';
  return n || 'Support';
}

// BUG-63: merge messages + ticket-level attachments (message_id == null) into a
// single timeline sorted by created_at ascending, so attachments interleave in
// chronological order instead of being dumped in a trailing block. Message-scoped
// attachments are excluded here — they render inline under their message.
type TimelineEntry =
  | { kind: 'message'; at: number; message: TicketMessage }
  | { kind: 'attachment'; at: number; attachment: TicketAttachment };

function buildTimeline(messages: TicketMessage[], attachments: TicketAttachment[]): TimelineEntry[] {
  const ts = (d?: string | null) => (d ? new Date(d).getTime() : 0);
  const entries: TimelineEntry[] = [
    ...messages.map((m): TimelineEntry => ({ kind: 'message', at: ts(m.created_at), message: m })),
    ...attachments
      .filter((a) => a.message_id == null)
      .map((a): TimelineEntry => ({ kind: 'attachment', at: ts(a.created_at), attachment: a })),
  ];
  return entries.sort((a, b) => a.at - b.at);
}
function fmt(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function MobileTicketPage() {
  const { signedIn } = useAuth();
  const params = useParams<{ ticket: string }>();
  const id = params?.ticket;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [pending, setPending] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  // BUG-63: optimistic "Uploading…" entries while files upload.
  const [uploadingNames, setUploadingNames] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!signedIn || !id) return;
    fetchMyTicket(id).then(setTicket).catch(() => setNotFound(true));
    fetchTicketAttachments(id).then(setAttachments).catch(() => {});
  }, [signedIn, id]);

  const isClosed = ticket?.ticket_status === 'closed';
  // BUG-63: chronological message + ticket-attachment timeline.
  const timeline = ticket ? buildTimeline(ticket.messages, attachments) : [];

  async function onSend() {
    if ((!reply.trim() && pending.length === 0) || sending || !id) return;
    setSending(true);
    try {
      let msg: TicketMessage | null = null;
      if (reply.trim()) {
        msg = await replyToTicket(id, reply.trim());
        setReply('');
        setTicket((t) => (t ? { ...t, messages: [...t.messages, msg!] } : t));
      }
      if (pending.length) {
        setUploading(true);
        setUploadingNames(pending.map((f) => f.name)); // optimistic indicator
        const uploaded: TicketAttachment[] = [];
        for (const f of pending) {
          try { uploaded.push(await uploadTicketAttachment(id, f, msg?.id ?? null)); } catch { /* skip */ }
        }
        if (uploaded.length) setAttachments((a) => [...a, ...uploaded]);
        setPending([]);
        setUploadingNames([]);
        setUploading(false);
      }
    } catch { /* keep */ } finally { setSending(false); }
  }
  async function onClose() {
    if (!id || closing) return;
    setClosing(true);
    try { await closeTicket(id); setTicket((t) => (t ? { ...t, ticket_status: 'closed' } : t)); }
    catch { /* ignore */ } finally { setClosing(false); }
  }

  return (
    <div>
      <MobilePageHeader title={ticket?.subject || 'Ticket'} subtitle={ticket?.ticket_number || 'Support'} />

      {!signedIn ? (
        <div className="px-4 pt-6 text-center text-sm text-slate-500">
          Please <Link href="/m/login?next=/m/support" className="text-brand-700 font-semibold">sign in</Link> to view this ticket.
        </div>
      ) : notFound ? (
        <div className="px-4 pt-6 text-center text-sm text-slate-500">Ticket not found.</div>
      ) : ticket == null ? (
        <div className="px-4 py-10 text-center text-slate-400 text-sm inline-flex items-center gap-2 w-full justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <div className="px-3 pt-3 pb-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${TICKET_STATUS_STYLE[ticket.ticket_status] || 'bg-slate-100 text-slate-600'}`}>{ticketStatusLabel(ticket.ticket_status)}</span>
            {!isClosed && (
              <button onClick={onClose} disabled={closing} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-[11.5px] font-semibold text-slate-600 active:scale-95 disabled:opacity-60">
                {closing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Close
              </button>
            )}
          </div>

          <div className="rounded-xl bg-white border border-slate-200 shadow-card p-3 space-y-3">
            {ticket.description && <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-[12.5px] text-slate-700">{ticket.description}</div>}
            {/* BUG-63: single chronological timeline (messages + null-message_id
                attachments by created_at asc); message-scoped attachments inline. */}
            {timeline.map((entry) => {
              if (entry.kind === 'attachment') {
                return (
                  <div key={`att-${entry.attachment.id}`}>
                    <div className="text-[10px] text-slate-400 mb-1">Attachment · {fmt(entry.attachment.created_at)}</div>
                    <AttachmentList items={[entry.attachment]} />
                  </div>
                );
              }
              const m = entry.message;
              const mine = m.sender_type === 'user';
              if (m.sender_type === 'system') return <div key={m.id} className="text-center text-[11px] text-slate-400">{m.message}</div>;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${mine ? 'text-right' : ''}`}>
                    <div className="text-[10px] text-slate-400 mb-0.5">{senderName(m)} · {fmt(m.created_at)}</div>
                    <div className={`inline-block rounded-lg px-3 py-2 text-[12.5px] text-left ${mine ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-800'}`}>{m.message}</div>
                    <AttachmentList items={attachments.filter((a) => a.message_id === m.id)} align={mine ? 'right' : 'left'} />
                  </div>
                </div>
              );
            })}

            {/* BUG-63: optimistic "Uploading…" rows for in-flight attachments */}
            {uploadingNames.map((n, i) => (
              <div key={`up-${i}`} className="flex items-center gap-2 text-[11px] text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[160px]">{n}</span>
                <span className="italic">Uploading…</span>
              </div>
            ))}
          </div>

          {isClosed ? (
            <div className="mt-3 text-center text-[12px] text-slate-400">This ticket is closed.</div>
          ) : (
            <div className="mt-3">
              {pending.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {pending.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] text-slate-700">
                      <FileText className="h-3 w-3 text-slate-400" /> <span className="truncate max-w-[110px]">{f.name}</span>
                      <button onClick={() => setPending((p) => p.filter((_, j) => j !== i))} aria-label="Remove file" className="text-slate-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                  className="hidden"
                  onChange={(e) => { if (e.target.files) setPending((p) => [...p, ...Array.from(e.target.files!)]); e.target.value = ''; }}
                />
                <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach file" className="h-10 w-10 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 active:scale-95">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSend(); } }}
                  className="flex-1 rounded-full bg-white border border-slate-200 px-4 py-2.5 text-[13px] outline-none focus:border-brand-400"
                  placeholder="Reply…"
                />
                <button onClick={onSend} disabled={sending || uploading || (!reply.trim() && pending.length === 0)} className="h-10 w-10 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 disabled:opacity-60">
                  {sending || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
