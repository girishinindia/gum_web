'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
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

export default function MobileTicketPage() {
  const { signedIn } = useAuth();
  const params = useParams<{ ticket: string }>();
  const id = params?.ticket;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!signedIn || !id) return;
    fetchMyTicket(id).then(setTicket).catch(() => setNotFound(true));
  }, [signedIn, id]);

  const isClosed = ticket?.ticket_status === 'closed';

  async function onSend() {
    if (!reply.trim() || sending || !id) return;
    setSending(true);
    try {
      const msg = await replyToTicket(id, reply.trim());
      setReply('');
      setTicket((t) => (t ? { ...t, messages: [...t.messages, msg] } : t));
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
            {ticket.messages.map((m) => {
              const mine = m.sender_type === 'user';
              if (m.sender_type === 'system') return <div key={m.id} className="text-center text-[11px] text-slate-400">{m.message}</div>;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${mine ? 'text-right' : ''}`}>
                    <div className="text-[10px] text-slate-400 mb-0.5">{senderName(m)} · {fmt(m.created_at)}</div>
                    <div className={`inline-block rounded-lg px-3 py-2 text-[12.5px] text-left ${mine ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-800'}`}>{m.message}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {isClosed ? (
            <div className="mt-3 text-center text-[12px] text-slate-400">This ticket is closed.</div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSend(); } }}
                className="flex-1 rounded-full bg-white border border-slate-200 px-4 py-2.5 text-[13px] outline-none focus:border-brand-400"
                placeholder="Reply…"
              />
              <button onClick={onSend} disabled={sending || !reply.trim()} className="h-10 w-10 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
