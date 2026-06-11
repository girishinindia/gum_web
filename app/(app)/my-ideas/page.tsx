'use client';

/** My Ideas (June 2026) — track status, rewards and partnership offers. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lightbulb, Plus, Eye, ThumbsUp, Trophy, Handshake } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchMyIdeas, STATUS_LABEL, type MyIdea } from '@/lib/ideas';

const TONE: Record<string, string> = {
  submitted: 'bg-slate-100 text-slate-600', under_review: 'bg-amber-50 text-amber-700', shortlisted: 'bg-sky-50 text-sky-700',
  need_more_details: 'bg-orange-50 text-orange-600', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-rose-50 text-rose-500',
  planned_for_implementation: 'bg-indigo-50 text-indigo-600', in_progress: 'bg-blue-50 text-blue-700', implemented: 'bg-emerald-100 text-emerald-800',
  rewarded: 'bg-yellow-50 text-yellow-700', partnership_offered: 'bg-violet-50 text-violet-700', closed: 'bg-slate-200 text-slate-500',
};

export default function MyIdeasPage() {
  const { signedIn } = useAuth();
  const [rows, setRows] = useState<MyIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!signedIn) { setLoading(false); return; }
    fetchMyIdeas().then(setRows).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, [signedIn]);

  if (!signedIn) {
    return (
      <div className="max-w-5xl">
        <Eyebrow>Ideas</Eyebrow>
        <h1 className="mt-3 heading text-3xl text-slate-900">My Ideas</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">Sign in to see your submitted ideas.</p>
          <Link href="/auth/sign-in" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Ideas</Eyebrow>
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">My Ideas</h1>
          <p className="mt-1 text-sm text-slate-500">Track review status, feedback, rewards and partnership offers.</p>
        </div>
        <Link href="/submit-idea" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Submit new idea
        </Link>
      </div>

      {error ? <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Lightbulb className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No ideas yet — your first one could earn a reward!</p>
          <p className="mt-1 text-xs text-slate-400">If we implement your idea you may get a cash reward in your GUM Wallet, recognition, or a partnership.</p>
          <Link href="/submit-idea" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Submit your first idea</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {rows.map((idea) => {
            const paid = (idea.idea_rewards || []).find((r) => r.reward_status === 'paid');
            const part = (idea.idea_partnerships || []).find((p) => ['offered', 'accepted', 'completed'].includes(p.partnership_status));
            return (
              <Link key={idea.id} href={`/my-ideas/${idea.id}`} className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-slate-400">{idea.idea_categories?.icon} {idea.idea_categories?.name || 'Idea'}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${TONE[idea.status] || 'bg-slate-100 text-slate-500'}`}>{STATUS_LABEL[idea.status] || idea.status}</span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-2">{idea.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {paid ? <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[10.5px] font-bold text-yellow-700"><Trophy className="h-3 w-3" /> ₹{Number(paid.reward_amount || 0).toLocaleString('en-IN')} rewarded</span> : null}
                  {part ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10.5px] font-bold text-violet-700"><Handshake className="h-3 w-3" /> partnership {part.partnership_status}</span> : null}
                  {idea.is_public ? <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10.5px] font-bold text-sky-600">on public showcase</span> : null}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11.5px] text-slate-400">
                  <span>{new Date(idea.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {idea.likes_count}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {idea.views_count}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
