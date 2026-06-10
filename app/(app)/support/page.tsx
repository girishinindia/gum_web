'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, Loader2, LifeBuoy, X } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import {
  fetchMyTickets, fetchTicketCategories, submitTicket,
  TICKET_STATUS_STYLE, ticketStatusLabel,
  type TicketRow, type TicketCategory,
} from '@/lib/tickets';

function fmtDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SupportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TicketRow[] | null>(null);
  const [cats, setCats] = useState<TicketCategory[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTickets().then(setRows).catch(() => setRows([]));
    fetchTicketCategories().then(setCats).catch(() => {});
  }, []);

  async function onCreate() {
    if (!subject.trim()) { setError('Please enter a subject.'); return; }
    if (!description.trim()) { setError('Please describe the issue.'); return; }
    setSubmitting(true); setError(null);
    try {
      const t = await submitTicket({ subject: subject.trim(), description: description.trim(), category_id: categoryId ? Number(categoryId) : null });
      router.push(`/support/${t.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your ticket.');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Eyebrow>Support</Eyebrow>
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Your tickets</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 text-sm font-semibold shadow-btn">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showForm ? 'Close' : 'New ticket'}
        </button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="mt-5 rounded-2xl bg-white border border-slate-200 shadow-card p-5">
          <h2 className="text-sm font-bold text-slate-900">Raise a new ticket</h2>
          <div className="mt-3 space-y-3">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="Subject" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
            <div className="grid sm:grid-cols-[1fr_220px] gap-3">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your issue…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 resize-y" />
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white self-start">
                <option value="">Category (optional)</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <div className="flex justify-end">
              <button onClick={onCreate} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2 text-sm font-semibold shadow-btn disabled:opacity-70">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket list */}
      {rows == null ? (
        <div className="mt-6 rounded-md bg-white border border-slate-200 p-10 text-center text-slate-400 text-sm inline-flex items-center gap-2 w-full justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-md bg-white border border-slate-200 p-10 text-center">
          <LifeBuoy className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-lg text-slate-800">No tickets yet</p>
          <p className="mt-1 text-sm text-slate-500">Raise a ticket and our support team will help you out.</p>
        </div>
      ) : (
        <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100">
          {rows.map((t) => (
            <Link key={t.id} href={`/support/${t.id}`} className="flex items-center gap-4 p-4 hover:bg-brand-50/30 transition-colors">
              <div className="text-[11px] font-mono text-slate-400 w-28 shrink-0">{t.ticket_number}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{t.subject}</div>
                <div className="text-[11.5px] text-slate-500 mt-0.5">{t.ticket_categories?.name ? `${t.ticket_categories.name} · ` : ''}{fmtDate(t.created_at)}</div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${TICKET_STATUS_STYLE[t.ticket_status] || 'bg-slate-100 text-slate-600'}`}>{ticketStatusLabel(t.ticket_status)}</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
