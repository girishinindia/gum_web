'use client';

/**
 * Submit an idea (June 2026) — "Have an Idea? Submit It and Get Rewarded."
 * Students and instructors; rewards land in the GUM Wallet if implemented.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lightbulb, Loader2, Paperclip, CheckCircle2 } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchIdeaCategoriesClient, submitIdea, uploadIdeaAttachment, type IdeaCategory } from '@/lib/ideas';

const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400';
const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500';

export default function SubmitIdeaPage() {
  const { signedIn } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [cats, setCats] = useState<IdeaCategory[]>([]);
  const [f, setF] = useState<Record<string, string>>({
    title: '', category_id: '', short_summary: '', description: '', problem_statement: '',
    proposed_solution: '', target_users: '', expected_benefit: '', usefulness_reason: '', expected_reward_note: '', tags: '',
  });
  const [partner, setPartner] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [doneId, setDoneId] = useState<number | null>(null);

  useEffect(() => {
    if (signedIn) fetchIdeaCategoriesClient().then(setCats).catch(() => setCats([]));
  }, [signedIn]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (f.title.trim().length < 10) { setError('Title must be at least 10 characters.'); return; }
    if (!f.category_id) { setError('Please pick a category.'); return; }
    if (f.description.trim().length < 50) { setError('Detailed description must be at least 50 characters — tell us the full story!'); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...f, interested_as_partner: partner };
      body.tags = f.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const idea = await submitIdea(body);
      if (file) { try { await uploadIdeaAttachment(idea.id, file); } catch { /* attachment optional */ } }
      setDoneId(idea.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally { setSaving(false); }
  };

  if (!signedIn) {
    return (
      <div className="max-w-3xl">
        <Eyebrow>Ideas</Eyebrow>
        <h1 className="mt-3 heading text-3xl text-slate-900">Have an idea? Submit it and get rewarded.</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">Sign in as a student or instructor to submit your idea.</p>
          <Link href="/auth/sign-in" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">Sign in</Link>
        </div>
      </div>
    );
  }

  if (doneId) {
    return (
      <div className="max-w-3xl">
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h1 className="mt-3 heading text-2xl text-slate-900">Idea submitted! 🎉</h1>
          <p className="mt-2 text-sm text-slate-600">Our team will review it and you&apos;ll be notified at every step. If your idea is implemented, you may receive a cash reward in your GUM Wallet or a partnership opportunity.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href={`/my-ideas/${doneId}`} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Track my idea</Link>
            <Link href="/my-ideas" className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600">All my ideas</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Eyebrow>Ideas</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Have an idea? <span className="text-emerald-600">Submit it and get rewarded.</span></h1>
      <p className="mt-2 text-sm text-slate-500">If your idea is selected and implemented, you may receive a cash reward (credited to your GUM Wallet), recognition on the public showcase, or a partnership opportunity.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
        {[['💡', 'Any idea counts'], ['🏆', 'Cash rewards'], ['🌟', 'Public recognition'], ['🤝', 'Partnerships']].map(([i, t]) => (
          <div key={t} className="rounded-xl border border-slate-100 bg-white px-2 py-3">
            <div className="text-xl">{i}</div>
            <div className="mt-1 text-[11px] font-semibold text-slate-600">{t}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Idea title * <span className="normal-case font-normal">(min 10 characters)</span></label>
            <input className={input} placeholder="e.g. AI-powered doubt solver inside every course" value={f.title} onChange={set('title')} />
          </div>
          <div>
            <label className={label}>Category *</label>
            <select className={input} value={f.category_id} onChange={set('category_id')}>
              <option value="">— choose —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Tags <span className="normal-case font-normal">(comma separated)</span></label>
            <input className={input} placeholder="ai, students, mobile" value={f.tags} onChange={set('tags')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Short summary</label>
            <input className={input} placeholder="One or two lines that capture the idea" value={f.short_summary} onChange={set('short_summary')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Detailed description * <span className="normal-case font-normal">(min 50 characters)</span></label>
            <textarea rows={5} className={input} placeholder="Explain your idea fully — what it is, how it works, what makes it special…" value={f.description} onChange={set('description')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Problem statement</label>
            <textarea rows={2} className={input} placeholder="What problem does this solve?" value={f.problem_statement} onChange={set('problem_statement')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Proposed solution</label>
            <textarea rows={2} className={input} placeholder="How would it work?" value={f.proposed_solution} onChange={set('proposed_solution')} />
          </div>
          <div>
            <label className={label}>Target users</label>
            <input className={input} placeholder="Who benefits?" value={f.target_users} onChange={set('target_users')} />
          </div>
          <div>
            <label className={label}>Expected benefit</label>
            <input className={input} placeholder="What improves?" value={f.expected_benefit} onChange={set('expected_benefit')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Why is this idea useful?</label>
            <textarea rows={2} className={input} value={f.usefulness_reason} onChange={set('usefulness_reason')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Expected reward note <span className="normal-case font-normal">(optional)</span></label>
            <input className={input} placeholder="Anything you'd like us to know about rewards" value={f.expected_reward_note} onChange={set('expected_reward_note')} />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button onClick={() => fileRef.current?.click()} type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-emerald-300">
              <Paperclip className="h-3.5 w-3.5" /> {file ? file.name : 'Attach image / PDF / doc (optional)'}
            </button>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file ? <button onClick={() => setFile(null)} className="text-xs text-rose-500 font-semibold">remove</button> : null}
          </div>

          <label className="sm:col-span-2 flex items-start gap-2 rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-0.5" checked={partner} onChange={(e) => setPartner(e.target.checked)} />
            <span><b>I&apos;m interested in becoming a partner / contributor / mentor</b> for this idea if it&apos;s implemented.</span>
          </label>
        </div>

        {error ? <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">Likes & popularity help us evaluate ideas, but rewards are decided by the review team.</p>
          <button onClick={submit} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />} Submit idea
          </button>
        </div>
      </div>
    </div>
  );
}
