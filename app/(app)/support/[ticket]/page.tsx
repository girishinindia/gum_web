'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Send, Loader2, CheckCircle2 } from 'lucide-react';
import {
  fetchMyTicket, replyToTicket, closeTicket,
  TICKET_STATUS_STYLE, ticketStatusLabel,
  type TicketDetail, type TicketMessage,
} from '@/lib/tickets';

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

  function load() {
    if (!id) return;
    fetchMyTicket(id).then(setTicket).catch(() => setNotFound(true));
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const isClosed = ticket?.ticket_status === 'closed';

  async function onSend() {
    if (!reply.trim() || sending || !id) return;
    setSending(true);
    try {
      const msg = await replyToTicket(id, reply.trim());
      setReply('');
      setTicket((t) => (t ? { ...t, messages: [...t.messages, msg], ticket_status: t.ticket_status === 'resolved' ? 'open' : t.ticket_status } : t));
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
                  </div>
                </div>
              );
            })}
          </div>

          {isClosed ? (
            <div className="border-t border-slate-200 p-4 text-center text-[12.5px] text-slate-400">This ticket is closed.</div>
          ) : (
            <div className="border-t border-slate-200 p-3 flex items-center gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                className="flex-1 rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-400"
                placeholder="Reply…"
              />
              <button onClick={onSend} disabled={sending || !reply.trim()} className="h-10 w-10 rounded-full bg-brand-500 text-white shadow-btn flex items-center justify-center disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
