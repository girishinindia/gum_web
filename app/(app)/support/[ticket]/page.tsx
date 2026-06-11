'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Send, Loader2, CheckCircle2, Paperclip, X, FileText } from 'lucide-react';
import {
  fetchMyTicket, replyToTicket, closeTicket,
  fetchTicketAttachments, uploadTicketAttachment,
  TICKET_STATUS_STYLE, ticketStatusLabel,
  type TicketDetail, type TicketMessage, type TicketAttachment,
} from '@/lib/tickets';

function AttachmentList({ items, align = 'left' }: { items: TicketAttachment[]; align?: 'left' | 'right' }) {
  if (!items.length) return null;
  return (
    <div className={`mt-1.5 flex flex-wrap gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
      {items.map((a) => {
        const isImg = (a.file_type || '').startsWith('image/');
        return isImg ? (
          <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" title={a.file_name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.file_url} alt={a.file_name} className="h-20 w-20 rounded-lg object-cover border border-slate-200" />
          </a>
        ) : (
          <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] text-slate-700 hover:border-brand-300 max-w-[200px]">
            <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" /> <span className="truncate">{a.file_name}</span>
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
function fmt(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function TicketPage() {
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
  // BUG-08 fix: upload failures were swallowed silently — now they're shown.
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    if (!id) return;
    fetchMyTicket(id).then(setTicket).catch(() => setNotFound(true));
    fetchTicketAttachments(id).then(setAttachments).catch(() => {});
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const isClosed = ticket?.ticket_status === 'closed';

  async function onSend() {
    if ((!reply.trim() && pending.length === 0) || sending || !id) return;
    setSending(true);
    try {
      let msg: TicketMessage | null = null;
      if (reply.trim()) {
        msg = await replyToTicket(id, reply.trim());
        setReply('');
        setTicket((t) => (t ? { ...t, messages: [...t.messages, msg!], ticket_status: t.ticket_status === 'resolved' ? 'open' : t.ticket_status } : t));
      }
      if (pending.length) {
        setUploading(true);
        setUploadErrors([]);
        const errors: string[] = [];
        const stillPending: File[] = [];
        for (const f of pending) {
          if (f.size > 25 * 1024 * 1024) { errors.push(`${f.name}: larger than 25 MB`); continue; }
          try {
            await uploadTicketAttachment(id, f, msg?.id ?? null);
          } catch (e) {
            errors.push(`${f.name}: ${e instanceof Error ? e.message : 'upload failed'}`);
            stillPending.push(f); // keep it so the user can retry
          }
        }
        // Re-fetch from the server so what you see is what was truly saved
        try { setAttachments(await fetchTicketAttachments(id)); } catch { /* keep current */ }
        setPending(stillPending);
        setUploadErrors(errors);
        setUploading(false);
      }
    } catch { /* keep text on failure */ } finally { setSending(false); }
  }

  async function onClose() {
    if (!id || closing) return;
    setClosing(true);
    try { await closeTicket(id); setTicket((t) => (t ? { ...t, ticket_status: 'closed' } : t)); }
    catch { /* ignore */ } finally { setClosing(false); }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/support" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700"><ChevronLeft className="h-3.5 w-3.5" /> Tickets</Link>

      {notFound ? (
        <div className="mt-3 rounded-md bg-white border border-slate-200 p-10 text-center text-slate-500 text-sm">Ticket not found.</div>
      ) : ticket == null ? (
        <div className="mt-3 rounded-md bg-white border border-slate-200 p-10 text-center text-slate-400 text-sm inline-flex items-center gap-2 w-full justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <div className="mt-3 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
          <header className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono text-slate-400">{ticket.ticket_number}</div>
              <h1 className="mt-0.5 heading text-xl text-slate-900">{ticket.subject}</h1>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${TICKET_STATUS_STYLE[ticket.ticket_status] || 'bg-slate-100 text-slate-600'}`}>{ticketStatusLabel(ticket.ticket_status)}</span>
                {ticket.ticket_priorities?.name && <span className="text-[11px] text-slate-500">{ticket.ticket_priorities.name} priority</span>}
              </div>
            </div>
            {!isClosed && (
              <button onClick={onClose} disabled={closing} className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[12.5px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60">
                {closing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Close ticket
              </button>
            )}
          </header>

          <div className="p-5 space-y-4">
            {ticket.description && (
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm text-slate-700">{ticket.description}</div>
            )}
            {ticket.messages.map((m) => {
              const mine = m.sender_type === 'user';
              const system = m.sender_type === 'system';
              if (system) {
                return <div key={m.id} className="text-center text-[11.5px] text-slate-400">{m.message}</div>;
              }
              return (
                <div key={m.id} className={`flex gap-2.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                  {!mine && <div className="h-8 w-8 rounded-full bg-success/15 text-success text-[11px] font-bold flex items-center justify-center shrink-0">S</div>}
                  <div className={`max-w-md ${mine ? 'text-right' : ''}`}>
                    <div className="text-[11px] text-slate-500 mb-0.5">{senderName(m)} · {fmt(m.created_at)}</div>
                    <div className={`inline-block rounded-md px-3.5 py-2 text-sm text-left ${mine ? 'bg-brand-500 text-white shadow-btn' : 'bg-slate-100 text-slate-800'}`}>{m.message}</div>
                    <AttachmentList items={attachments.filter((a) => a.message_id === m.id)} align={mine ? 'right' : 'left'} />
                  </div>
                </div>
              );
            })}
            {attachments.some((a) => a.message_id == null) && (
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Attachments</div>
                <AttachmentList items={attachments.filter((a) => a.message_id == null)} />
              </div>
            )}
          </div>

          {isClosed ? (
            <div className="border-t border-slate-200 p-4 text-center text-[12.5px] text-slate-400">This ticket is closed.</div>
          ) : (
            <div className="border-t border-slate-200 p-3">
              {pending.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {pending.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11.5px] text-slate-700">
                      <FileText className="h-3 w-3 text-slate-400" /> <span className="truncate max-w-[140px]">{f.name}</span>
                      <button onClick={() => setPending((p) => p.filter((_, j) => j !== i))} aria-label="Remove file" className="text-slate-400 hover:text-slate-600"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              {uploadErrors.length > 0 && (
                <div className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                  {uploadErrors.map((er, i) => (
                    <p key={i} className="text-[11.5px] text-rose-600">⚠ {er}</p>
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
                <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach file" className="h-10 w-10 rounded-full border border-slate-200 text-slate-500 hover:text-brand-700 hover:border-brand-300 flex items-center justify-center shrink-0">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  className="flex-1 rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-400"
                  placeholder="Reply…"
                />
                <button onClick={onSend} disabled={sending || uploading || (!reply.trim() && pending.length === 0)} className="h-10 w-10 rounded-full bg-brand-500 text-white shadow-btn flex items-center justify-center disabled:opacity-60">
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
