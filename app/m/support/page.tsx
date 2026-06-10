'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, Loader2, LifeBuoy, X } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  fetchMyTickets, fetchTicketCategories, submitTicket,
  TICKET_STATUS_STYLE, ticketStatusLabel,
  type TicketRow, type TicketCategory,
} from '@/lib/tickets';

function fmtDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MobileSupportPage() {
  const { signedIn } = useAuth();
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
    if (!signedIn) return;
    fetchMyTickets().then(setRows).catch(() => setRows([]));
    fetchTicketCategories().then(setCats).catch(() => {});
  }, [signedIn]);

  async function onCreate() {
    if (!subject.trim()) { setError('Please enter a subject.'); return; }
    if (!description.trim()) { setError('Please describe the issue.'); return; }
    setSubmitting(true); setError(null);
    try {
      const t = await submitTicket({ subject: subject.trim(), description: description.trim(), category_id: categoryId ? Number(categoryId) : null });
      router.push(`/m/support/${t.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your ticket.');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <MobilePageHeader
        title="Support"
        subtitle="Help & tickets"
        action={
          signedIn ? (
            <button onClick={() => setShowForm((v) => !v)} aria-label="New ticket" className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-brand-600 text-white">
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          ) : undefined
        }
      />

      {!signedIn ? (
        <div className="px-4 pt-6 text-center">
          <LifeBuoy className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-base text-slate-800">Sign in to view your tickets</p>
          <Link href="/m/login?next=/m/support" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Sign in</Link>
        </div>
      ) : (
        <div className="px-3 pt-3">
          {showForm && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-card p-3 mb-3">
              <h2 className="text-[13px] font-bold text-slate-900">Raise a new ticket</h2>
              <div className="mt-2 space-y-2">
                <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="Subject" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-brand-400" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your issue…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-brand-400 resize-y" />
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] bg-white">
                  <option value="">Category (optional)</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {error && <p className="text-[11px] text-rose-600">{error}</p>}
                <button onClick={onCreate} disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 text-[13px] font-semibold shadow-btn disabled:opacity-70">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit ticket
                </button>
              </div>
            </div>
          )}

          {rows == null ? (
            <div className="py-10 text-center text-slate-400 text-sm inline-flex items-center gap-2 w-full justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center">
              <LifeBuoy className="h-8 w-8 mx-auto text-slate-300" />
              <p className="mt-3 heading text-base text-slate-800">No tickets yet</p>
              <p className="mt-1 text-[12.5px] text-slate-500">Tap + to raise your first ticket.</p>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
              {rows.map((t) => (
                <Link key={t.id} href={`/m/support/${t.id}`} className="flex items-center gap-3 p-3 active:bg-brand-50/40">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">{t.subject}</div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5 font-mono">{t.ticket_number} · {fmtDate(t.created_at)}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${TICKET_STATUS_STYLE[t.ticket_status] || 'bg-slate-100 text-slate-600'}`}>{ticketStatusLabel(t.ticket_status)}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
