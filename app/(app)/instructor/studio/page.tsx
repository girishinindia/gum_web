'use client';

/**
 * Instructor Studio (June 2026) — create & manage your own content from
 * gum_web: courses (authoring module → admin verify), webinars, live
 * sessions, batches, blog posts, podcasts, FAQs and promotions.
 * Everything is scoped server-side to the signed-in instructor.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Video, Radio, Users, PenSquare, Mic, HelpCircle, BadgePercent, Plus,
} from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';
import StudioSection, { Chip, type Field, type Col } from '@/components/studio/StudioSection';
import { listDrafts, createDraft, deleteDraft, type DraftCourse } from '@/lib/studio';

/* eslint-disable @typescript-eslint/no-explicit-any */

const TABS = [
  { key: 'courses', label: 'Courses', Icon: BookOpen },
  { key: 'batches', label: 'Batches', Icon: Users },
  { key: 'webinars', label: 'Webinars', Icon: Video },
  { key: 'sessions', label: 'Live sessions', Icon: Radio },
  { key: 'blog', label: 'Blog', Icon: PenSquare },
  { key: 'podcasts', label: 'Podcasts', Icon: Mic },
  { key: 'faqs', label: 'FAQs', Icon: HelpCircle },
  { key: 'promotions', label: 'Promotions', Icon: BadgePercent },
] as const;

const dt = (v?: string | null) => (v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const d = (v?: string | null) => (v ? new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—');
const inr = (v: any) => (v == null || v === '' ? '—' : `₹${Number(v).toLocaleString('en-IN')}`);

// ── Courses tab (authoring module) ──────────────────────────────────────
function CoursesStudio() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError('');
    listDrafts().then(setDrafts).catch((e: any) => setError(e?.message || 'Failed to load')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const createNew = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const draft = await createDraft({ title: newTitle.trim() });
      router.push(`/instructor/studio/courses/${draft.id}`);
    } catch (e: any) {
      setError(e?.message || 'Could not create the course'); setCreating(false);
    }
  };

  const trash = async (c: DraftCourse) => {
    if (!window.confirm(`Move "${c.title}" to trash?`)) return;
    try { await deleteDraft(c.id); load(); } catch (e: any) { window.alert(e?.message || 'Delete failed'); }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{drafts.length} course {drafts.length === 1 ? 'draft' : 'drafts'} · published after admin review</p>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> New course
        </button>
      </div>

      {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {showNew ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Course title</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Mastering React from Zero"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400" />
            <div className="flex gap-2">
              <button onClick={createNew} disabled={creating || !newTitle.trim()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {creating ? 'Creating…' : 'Create & open builder'}
              </button>
              <button onClick={() => setShowNew(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">Loading…</div>
      ) : drafts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-600">No courses yet</p>
          <p className="mt-1 text-xs text-slate-400">Create your first course — build the curriculum, then submit it for review.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {drafts.map(c => (
            <div key={c.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900">{c.title}</h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{c.subtitle || c.short_intro || '—'}</p>
                </div>
                <Chip value={c.status || 'draft'} />
              </div>
              {c.status === 'rejected' && c.rejection_reason ? (
                <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">Rejected: {c.rejection_reason}</p>
              ) : null}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {c.is_free ? 'Free' : inr(c.price)} · {c.level ? String(c.level).replace(/_/g, ' ') : 'level —'}
                  {c.canonical_course_id ? <span className="text-emerald-600"> · live as course #{c.canonical_course_id}</span> : null}
                </p>
                <div className="flex gap-2">
                  <Link href={`/instructor/studio/courses/${c.id}`} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">Open builder</Link>
                  {(c.status === 'draft' || c.status === 'rejected') ? (
                    <button onClick={() => trash(c)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:border-rose-300">Trash</button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Configs for the 7 generic sections ─────────────────────────────────
const PLATFORMS = [
  { value: 'zoom', label: 'Zoom' }, { value: 'google_meet', label: 'Google Meet' },
  { value: 'microsoft_teams', label: 'Microsoft Teams' }, { value: 'other', label: 'Other' },
];

const SECTIONS: Record<string, { singular: string; fields: Field[]; columns: Col[]; statusKey?: string; coursePicker?: boolean; note?: string; emptyHint?: string }> = {
  webinars: {
    singular: 'webinar',
    statusKey: 'webinar_status',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'course_id', label: 'Related course (optional)', kind: 'course', half: true },
      { name: 'webinar_status', label: 'Status', kind: 'select', half: true, options: ['scheduled', 'live', 'completed', 'cancelled'].map(v => ({ value: v, label: v })) },
      { name: 'scheduled_at', label: 'Scheduled at', kind: 'datetime', half: true, required: true },
      { name: 'duration_minutes', label: 'Duration (min)', kind: 'number', half: true },
      { name: 'is_free', label: 'Free webinar', kind: 'checkbox', half: true, placeholder: 'Attendees join free' },
      { name: 'price', label: 'Price (₹)', kind: 'number', half: true },
      { name: 'max_attendees', label: 'Max attendees', kind: 'number', half: true },
      { name: 'meeting_platform', label: 'Platform', kind: 'select', half: true, options: PLATFORMS },
      { name: 'meeting_url', label: 'Meeting URL', kind: 'text' },
      { name: 'meeting_id', label: 'Meeting ID', kind: 'text', half: true },
      { name: 'meeting_password', label: 'Meeting password', kind: 'text', half: true },
      { name: 'is_active', label: 'Active', kind: 'checkbox', half: true, placeholder: 'Visible where applicable' },
    ],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'scheduled_at', label: 'When', render: r => <span className="text-xs">{dt(r.scheduled_at)}</span> },
      { key: 'price', label: 'Price', render: r => r.is_free ? 'Free' : inr(r.price) },
    ],
    emptyHint: 'Schedule a webinar; it appears on the public webinars page once active.',
  },
  sessions: {
    singular: 'live session',
    statusKey: 'session_status',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'description', label: 'Description', kind: 'textarea' },
      { name: 'item_type', label: 'Attached to', kind: 'select', half: true, required: true, options: [{ value: 'course', label: 'Course' }, { value: 'course_batch', label: 'Batch' }, { value: 'webinar', label: 'Webinar' }] },
      { name: 'item_id', label: 'Item ID', kind: 'number', half: true, required: true, hint: 'ID of the course/batch/webinar this session belongs to' },
      { name: 'session_status', label: 'Status', kind: 'select', half: true, options: ['scheduled', 'live', 'completed', 'cancelled'].map(v => ({ value: v, label: v })) },
      { name: 'scheduled_at', label: 'Scheduled at', kind: 'datetime', half: true, required: true },
      { name: 'duration_minutes', label: 'Duration (min)', kind: 'number', half: true },
      { name: 'max_attendees', label: 'Max attendees', kind: 'number', half: true },
      { name: 'meeting_platform', label: 'Platform', kind: 'select', half: true, options: PLATFORMS },
      { name: 'meeting_url', label: 'Meeting URL', kind: 'text' },
      { name: 'meeting_id', label: 'Meeting ID', kind: 'text', half: true },
      { name: 'meeting_password', label: 'Meeting password', kind: 'text', half: true },
      { name: 'is_active', label: 'Active', kind: 'checkbox', half: true },
    ],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'scheduled_at', label: 'When', render: r => <span className="text-xs">{dt(r.scheduled_at)}</span> },
      { key: 'item_type', label: 'Attached to', render: r => r.item_type ? `${r.item_type} #${r.item_id ?? '—'}` : '—' },
    ],
    emptyHint: 'Sessions show on enrolled students’ dashboards before they start.',
  },
  batches: {
    singular: 'batch',
    statusKey: 'batch_status',
    fields: [
      { name: 'title', label: 'Batch title', kind: 'text', required: true },
      { name: 'course_id', label: 'Course', kind: 'course', required: true, hint: 'Only your own published courses are listed' },
      { name: 'batch_status', label: 'Status', kind: 'select', half: true, options: ['upcoming', 'ongoing', 'completed', 'cancelled'].map(v => ({ value: v, label: v })) },
      { name: 'max_students', label: 'Max students', kind: 'number', half: true },
      { name: 'start_date', label: 'Start date', kind: 'date', half: true },
      { name: 'end_date', label: 'End date', kind: 'date', half: true },
      { name: 'is_free', label: 'Free batch', kind: 'checkbox', half: true },
      { name: 'price', label: 'Price (₹)', kind: 'number', half: true },
      { name: 'includes_course_access', label: 'Includes course access', kind: 'checkbox', half: true, placeholder: 'Buying the batch unlocks the course' },
      { name: 'meeting_platform', label: 'Platform', kind: 'select', half: true, options: PLATFORMS },
      { name: 'meeting_link', label: 'Meeting link', kind: 'text' },
      { name: 'schedule', label: 'Schedule (text)', kind: 'text', placeholder: 'e.g. Mon–Fri, 7–8 PM IST' },
      { name: 'is_active', label: 'Active', kind: 'checkbox', half: true },
    ],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'start_date', label: 'Starts', render: r => <span className="text-xs">{d(r.start_date)}</span> },
      { key: 'price', label: 'Price', render: r => r.is_free ? 'Free' : inr(r.price) },
      { key: 'enrolled_count', label: 'Enrolled', render: r => `${r.enrolled_count ?? 0}${r.max_students ? `/${r.max_students}` : ''}` },
    ],
    emptyHint: 'Batches are cohort runs of your courses with live schedules.',
  },
  blog: {
    singular: 'blog post',
    statusKey: 'status',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', kind: 'textarea' },
      { name: 'content', label: 'Content (HTML or text)', kind: 'textarea', required: true },
      { name: 'featured_image_url', label: 'Featured image URL', kind: 'text' },
      { name: 'status', label: 'Status', kind: 'select', half: true, options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }] },
      { name: 'published_at', label: 'Publish at', kind: 'datetime', half: true },
      { name: 'meta_title', label: 'Meta title', kind: 'text', half: true },
      { name: 'meta_description', label: 'Meta description', kind: 'text', half: true },
      { name: 'is_active', label: 'Active', kind: 'checkbox', half: true },
    ],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'published_at', label: 'Published', render: r => <span className="text-xs">{r.published_at ? dt(r.published_at) : '—'}</span> },
    ],
    emptyHint: 'Published posts appear on the public blog.',
  },
  podcasts: {
    singular: 'podcast',
    statusKey: 'status',
    note: 'Instructor podcasts are created as drafts and go live after the admin team verifies them.',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', required: true },
      { name: 'short_summary', label: 'Short summary', kind: 'text' },
      { name: 'description', label: 'Description', kind: 'textarea' },
      { name: 'youtube_url', label: 'YouTube URL', kind: 'text', hint: 'Paste the episode link' },
      { name: 'thumbnail_url', label: 'Thumbnail URL', kind: 'text' },
      { name: 'duration_seconds', label: 'Duration (seconds)', kind: 'number', half: true },
      { name: 'is_active', label: 'Active', kind: 'checkbox', half: true },
    ],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'created_at', label: 'Created', render: r => <span className="text-xs">{d(r.created_at)}</span> },
    ],
    emptyHint: 'Add an episode; it publishes after admin verification.',
  },
  faqs: {
    singular: 'FAQ',
    fields: [
      { name: 'question', label: 'Question', kind: 'text', required: true },
      { name: 'answer', label: 'Answer', kind: 'textarea', required: true },
      { name: 'item_type', label: 'Attach to', kind: 'select', half: true, options: [{ value: 'general', label: 'General' }, { value: 'course', label: 'A course' }] },
      { name: 'item_id', label: 'Course ID (if course)', kind: 'number', half: true },
      { name: 'display_order', label: 'Display order', kind: 'number', half: true },
      { name: 'is_featured', label: 'Featured', kind: 'checkbox', half: true },
      { name: 'is_active', label: 'Active', kind: 'checkbox', half: true },
    ],
    columns: [
      { key: 'question', label: 'Question' },
      { key: 'item_type', label: 'Scope', render: r => r.item_type === 'course' ? `course #${r.item_id}` : (r.item_type || 'general') },
    ],
    emptyHint: 'FAQs show on your course pages and the public FAQ hub.',
  },
  promotions: {
    singular: 'promotion',
    statusKey: 'promotion_status',
    coursePicker: true,
    note: 'Your promotions need admin approval before students can use the code. The discount comes out of YOUR revenue share only — the platform’s share is always computed on the full amount, and codes never discount more than your share.',
    fields: [
      { name: 'promotion_name', label: 'Promotion name', kind: 'text', required: true },
      { name: 'promo_code', label: 'Promo code', kind: 'text', required: true, half: true, hint: 'Students type this at checkout (stored lowercase)' },
      { name: 'discount_type', label: 'Discount type', kind: 'select', half: true, required: true, options: [{ value: 'percentage', label: 'Percentage %' }, { value: 'fixed', label: 'Fixed ₹' }] },
      { name: 'discount_value', label: 'Discount value', kind: 'number', half: true, required: true },
      { name: 'max_discount_amount', label: 'Max discount (₹)', kind: 'number', half: true },
      { name: 'valid_from', label: 'Valid from', kind: 'datetime', half: true, required: true },
      { name: 'valid_until', label: 'Valid until', kind: 'datetime', half: true, required: true },
      { name: 'usage_limit', label: 'Usage limit', kind: 'number', half: true },
      { name: 'is_active', label: 'Active', kind: 'checkbox', half: true },
    ],
    columns: [
      { key: 'promotion_name', label: 'Name' },
      { key: 'promo_code', label: 'Code', render: r => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{r.promo_code}</code> },
      { key: 'discount_value', label: 'Discount', render: r => r.discount_type === 'percentage' ? `${Number(r.discount_value)}%` : inr(r.discount_value) },
      { key: 'approved_at', label: 'Approval', render: r => <Chip value={r.approved_at ? 'approved' : 'pending'} /> },
    ],
    emptyHint: 'Create a code for your own courses — it activates after admin approval.',
  },
};

// ── Page ────────────────────────────────────────────────────────────────
export default function InstructorStudioPage() {
  const { signedIn } = useAuth();
  const [tab, setTabState] = useState('courses');
  useEffect(() => {
    // read ?tab= without useSearchParams (avoids a Suspense boundary requirement)
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t && (t === 'courses' || SECTIONS[t])) setTabState(t);
  }, []);
  const setTab = (k: string) => {
    setTabState(k);
    window.history.replaceState(null, '', `/instructor/studio?tab=${k}`);
  };

  if (!signedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Eyebrow>Instructor</Eyebrow>
        <h1 className="mt-3 heading text-3xl text-slate-900">Studio</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">Sign in with your instructor account to manage your content.</p>
          <Link href="/auth/sign-in" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">Sign in</Link>
        </div>
      </div>
    );
  }

  const cfg = SECTIONS[tab];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Eyebrow>Instructor</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Studio</h1>
      <p className="mt-1 text-sm text-slate-500">Create and manage everything you teach and publish — courses, batches, webinars, sessions, blog, podcasts, FAQs and promo codes.</p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
            <t.Icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'courses' ? (
          <CoursesStudio />
        ) : cfg ? (
          <StudioSection
            key={tab}
            type={tab as any}
            singular={cfg.singular}
            fields={cfg.fields}
            columns={cfg.columns}
            statusKey={cfg.statusKey}
            coursePicker={cfg.coursePicker}
            note={cfg.note}
            emptyHint={cfg.emptyHint}
          />
        ) : null}
      </div>
    </div>
  );
}
