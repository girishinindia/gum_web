'use client';

/**
 * My idea detail (June 2026) — status timeline, admin feedback, rewards,
 * partnership offers; editable while still in review.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trophy, Handshake, MessageSquare, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchMyIdea, updateMyIdea, withdrawMyIdea, STATUS_LABEL } from '@/lib/ideas';

/* eslint-disable @typescript-eslint/no-explicit-any */

const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400';

export default function MyIdeaDetailPage() {
  const { signedIn } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [idea, setIdea] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetchMyIdea(id).then((d) => { setIdea(d); setError(''); }).catch((e: Error) => setError(e.message));
  }, [id]);
  useEffect(() => { if (signedIn && id) load(); }, [signedIn, id, load]);

  const startEdit = () => {
    setF({
      title: idea.title || '', short_summary: idea.short_summary || '', description: idea.description || '',
      problem_statement: idea.problem_statement || '', proposed_solution: idea.proposed_solution || '',
      target_users: idea.target_users || '', expected_benefit: idea.expected_benefit || '', usefulness_reason: idea.usefulness_reason || '',
    });
    setEditing(true);
  };

  const save = async () => {
    setSaving(true); setError('');
    try { await updateMyIdea(id, f); setEditing(false); load(); }
    catch (e: any) { setError(e?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const withdraw = async () => {
    if (!window.confirm('Withdraw this idea? This cannot be undone.')) return;
    try { await withdrawMyIdea(id); router.push('/my-ideas'); }
    catch (e: any) { window.alert(e?.message || 'Failed'); }
  };

  if (!signedIn) return <div className="max-w-3xl"><div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">Sign in to view your idea.</div></div>;
  if (error && !idea) return (
    <div className="max-w-3xl">
      <Link href="/my-ideas" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500"><ArrowLeft className="h-4 w-4" /> My Ideas</Link>
      <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">{error}</div>
    </div>
  );
  if (!idea) return <div className="max-w-3xl"><div className="mt-6 rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">Loading…</div></div>;

  const paidReward = (idea.rewards || []).find((r: any) => r.reward_status === 'paid');
  const partnership = (idea.partnerships || [])[0];

  return (
    <div className="max-w-3xl">
      <Link href="/my-ideas" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> My Ideas</Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="heading text-2xl sm:text-3xl text-slate-900 leading-tight">{idea.title}</h1>
        <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">{STATUS_LABEL[idea.status] || idea.status}</span>
        {idea.is_public ? <Link href={`/ideas/${idea.slug}`} className="text-[11px] font-bold text-sky-600 underline">view on public showcase ↗</Link> : null}
      </div>
      <p className="mt-1 text-xs text-slate-400">{idea.category?.icon} {idea.category?.name} · submitted {new Date(idea.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })} · ♥ {idea.likes_count} · 👁 {idea.views_count}</p>

      {paidReward ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <Trophy className="h-6 w-6 text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-yellow-800">₹{Number(paidReward.reward_amount).toLocaleString('en-IN')} reward credited to your GUM Wallet 🎉</p>
            <p className="text-xs text-yellow-700">{paidReward.reward_payment_date ? `Paid on ${paidReward.reward_payment_date}. ` : ''}<Link href="/wallet" className="underline font-semibold">Open wallet</Link></p>
          </div>
        </div>
      ) : null}

      {partnership && partnership.partnership_status !== 'not_offered' ? (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
          <Handshake className="h-6 w-6 text-violet-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-violet-800">Partnership {partnership.partnership_status.replace(/_/g, ' ')}{partnership.partnership_type ? ` — ${partnership.partnership_type.replace(/_/g, ' ')}` : ''}</p>
            {partnership.partnership_note ? <p className="text-xs text-violet-700">{partnership.partnership_note}</p> : null}
            {partnership.partnership_status === 'offered' ? <p className="text-xs text-violet-600 mt-0.5">Our team will contact you — or reach out via <Link href="/support" className="underline font-semibold">support</Link> to respond.</p> : null}
          </div>
        </div>
      ) : null}

      {idea.status === 'need_more_details' ? (
        <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          The review team needs more details — check the feedback below and update your idea.
        </div>
      ) : null}

      {/* Content / edit */}
      <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Idea details</h2>
          {idea.can_edit && !editing ? (
            <div className="flex gap-2">
              <button onClick={startEdit} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-300"><Pencil className="h-3 w-3" /> Edit</button>
              <button onClick={withdraw} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:border-rose-300"><Trash2 className="h-3 w-3" /> Withdraw</button>
            </div>
          ) : null}
        </div>

        {editing ? (
          <div className="mt-3 space-y-3">
            {[['title', 'Title'], ['short_summary', 'Short summary']].map(([k, l]) => (
              <div key={k}><label className="mb-1 block text-xs font-semibold uppercase text-slate-500">{l}</label>
                <input className={input} value={f[k] || ''} onChange={(e) => setF((s: any) => ({ ...s, [k]: e.target.value }))} /></div>
            ))}
            {[['description', 'Detailed description'], ['problem_statement', 'Problem statement'], ['proposed_solution', 'Proposed solution'], ['target_users', 'Target users'], ['expected_benefit', 'Expected benefit'], ['usefulness_reason', 'Why useful']].map(([k, l]) => (
              <div key={k}><label className="mb-1 block text-xs font-semibold uppercase text-slate-500">{l}</label>
                <textarea rows={k === 'description' ? 4 : 2} className={input} value={f[k] || ''} onChange={(e) => setF((s: any) => ({ ...s, [k]: e.target.value }))} /></div>
            ))}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save changes
              </button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3 text-sm">
            {[['Short summary', idea.short_summary], ['Description', idea.description], ['Problem statement', idea.problem_statement],
              ['Proposed solution', idea.proposed_solution], ['Target users', idea.target_users], ['Expected benefit', idea.expected_benefit],
              ['Why useful', idea.usefulness_reason]].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{k}</div>
                <p className="mt-0.5 whitespace-pre-wrap text-slate-700">{v}</p>
              </div>
            ))}
            {idea.attachment_url ? <a href={idea.attachment_url} target="_blank" rel="noreferrer" className="inline-block text-xs font-semibold text-emerald-600 hover:underline">📎 View attachment</a> : null}
          </div>
        )}
      </div>

      {/* Feedback */}
      {(idea.feedback || []).length ? (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900"><MessageSquare className="h-4 w-4 text-slate-400" /> Feedback from the team</h2>
          <div className="mt-3 space-y-2">
            {idea.feedback.map((fb: any, i: number) => (
              <div key={i} className="rounded-xl bg-slate-50 px-4 py-2.5">
                <p className="text-sm text-slate-700">{fb.message}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{new Date(fb.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Timeline */}
      <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">Status timeline</h2>
        <ol className="mt-3 space-y-0">
          {(idea.timeline || []).map((t: any, i: number) => (
            <li key={i} className="relative pl-6 pb-4 last:pb-0">
              <span className={`absolute left-0 top-1 h-3 w-3 rounded-full border-2 ${i === (idea.timeline.length - 1) ? 'border-emerald-500 bg-emerald-100' : 'border-slate-300 bg-white'}`} />
              {i < idea.timeline.length - 1 ? <span className="absolute left-[5px] top-4 bottom-0 w-px bg-slate-200" /> : null}
              <p className="text-sm font-semibold text-slate-800">{STATUS_LABEL[t.new_status] || t.new_status}</p>
              {t.remark ? <p className="text-xs text-slate-500">{t.remark}</p> : null}
              <p className="text-[11px] text-slate-400">{new Date(t.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
