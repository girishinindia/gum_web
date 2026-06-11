'use client';

/**
 * Instructor course builder on gum_web (June 2026) — the web port of the
 * admin course-builder, talking to the same /authoring API (which is
 * ownership-scoped for instructors). Tabs: Basics · Highlights · Curriculum ·
 * Capstones · Mini projects · FAQs, plus readiness + submit-for-review.
 * Publishing to the public catalog still happens ONLY via admin verify.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, UploadCloud, Trash2, PlayCircle,
  Plus, FileText, Send, Loader2, FolderPlus, ListPlus, Pencil,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Chip } from '@/components/studio/StudioSection';
import {
  getDraft, updateDraft, getReadiness, submitDraft,
  uploadDraftThumbnail, uploadDraftTrailer, removeDraftTrailer, importStructure,
  listHighlights, createHighlight, removeHighlight,
  listUnits, createUnit, updateUnit, deleteUnit,
  uploadUnitVideo, removeUnitVideo, unitVideoPlayback, uploadUnitFile, removeUnitFile,
  listDraftFaqs, createDraftFaq, removeDraftFaq,
  listCapstones, createCapstone, removeCapstone, uploadCapstoneFile,
  listMiniProjects, createMiniProject, removeMiniProject, uploadMiniProjectFile,
  studioCategories, studioLanguages,
  type DraftCourse, type DraftUnit, type DraftHighlight, type DraftFaq, type DraftProject, type UnitFileKind,
} from '@/lib/studio';

/* eslint-disable @typescript-eslint/no-explicit-any */

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const HIGHLIGHT_KINDS = [
  { value: 'prerequisite', label: 'Prerequisites' },
  { value: 'outcome', label: "Outcomes (what you'll learn)" },
  { value: 'skill', label: 'Skills gained' },
  { value: 'audience', label: "Who it's for" },
  { value: 'requirement', label: 'Requirements' },
];
const FILE_SLOTS: { kind: UnitFileKind; col: keyof DraftUnit; label: string }[] = [
  { kind: 'article', col: 'article_pdf', label: 'Article PDF' },
  { kind: 'exercise', col: 'exercise_pdf', label: 'Exercise PDF' },
  { kind: 'exercise_solution', col: 'exercise_solution_pdf', label: 'Exercise solution' },
  { kind: 'assignment', col: 'assignment_pdf', label: 'Assignment PDF' },
  { kind: 'project', col: 'project_pdf', label: 'Project PDF' },
  { kind: 'project_solution', col: 'project_solution_file_url', label: 'Project solution' },
];
const TABS = ['Basics', 'Highlights', 'Curriculum', 'Capstones', 'Mini projects', 'FAQs'] as const;

const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400';
const btn = 'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60';
const btnGhost = 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700';

function FileButton({ label, accept, busy, onPick }: { label: string; accept: string; busy?: boolean; onPick: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button onClick={() => ref.current?.click()} disabled={busy} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50">
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />} {label}
      </button>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }} />
    </>
  );
}

export default function CourseBuilderPage() {
  const { signedIn } = useAuth();
  const params = useParams();
  const id = Number(params?.id);

  const [course, setCourse] = useState<DraftCourse | null>(null);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<(typeof TABS)[number]>('Basics');
  const [readiness, setReadiness] = useState<{ ready: boolean; problems: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const refreshReadiness = useCallback(() => { getReadiness(id).then(setReadiness).catch(() => setReadiness(null)); }, [id]);
  const loadCourse = useCallback(() => {
    getDraft(id).then(c => { setCourse(c); setLoadError(''); }).catch((e: any) => setLoadError(e?.message || 'Could not load this course'));
    void refreshReadiness();
  }, [id, refreshReadiness]);

  useEffect(() => { if (signedIn && id) loadCourse(); }, [signedIn, id, loadCourse]);

  const editable = course ? ['draft', 'rejected'].includes(String(course.status || 'draft')) : false;

  const submit = async () => {
    if (!window.confirm('Submit this course for admin review? You cannot edit while it is under review.')) return;
    setSubmitting(true); setNotice('');
    try { await submitDraft(id); setNotice('Submitted! The admin team will review and publish your course.'); loadCourse(); }
    catch (e: any) { setNotice(e?.message || 'Submit failed'); }
    finally { setSubmitting(false); }
  };

  if (!signedIn) {
    return <div className="max-w-7xl"><div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">Sign in with your instructor account to use the course builder.</div></div>;
  }
  if (loadError) {
    return (
      <div className="max-w-7xl">
        <Link href="/instructor/studio" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> Back to Studio</Link>
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">{loadError}</div>
      </div>
    );
  }
  if (!course) return <div className="max-w-7xl"><div className="mt-6 rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">Loading builder…</div></div>;

  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/instructor/studio" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> Studio</Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="heading text-2xl sm:text-3xl text-slate-900 leading-tight">{course.title}</h1>
            <Chip value={course.status || 'draft'} />
          </div>
          {course.canonical_course_id ? <p className="mt-1 text-xs text-emerald-600">Live in the catalog as course #{course.canonical_course_id} — verified updates re-publish it.</p> : null}
          {course.status === 'rejected' && course.rejection_reason ? <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">Rejected: {course.rejection_reason}</p> : null}
        </div>
        {editable ? (
          <button onClick={submit} disabled={submitting || !readiness?.ready} className={`${btn} inline-flex items-center gap-2`}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit for review
          </button>
        ) : null}
      </div>

      {notice ? <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">{notice}</div> : null}

      {readiness ? readiness.ready ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Ready to submit for review.
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /> Before you can submit:</p>
          <ul className="mt-1.5 list-disc pl-9 text-xs text-amber-700 space-y-0.5">
            {readiness.problems.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      ) : null}

      {!editable ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">This course is {String(course.status).replace(/_/g, ' ')} — editing is locked until the review completes{course.status === 'published' ? ' (it will reopen if you need changes — contact admin)' : ''}.</div> : null}

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'Basics' ? <BasicsTab course={course} editable={editable} onSaved={loadCourse} /> : null}
        {tab === 'Highlights' ? <HighlightsTab courseId={id} editable={editable} onChange={refreshReadiness} /> : null}
        {tab === 'Curriculum' ? <CurriculumTab courseId={id} editable={editable} onChange={refreshReadiness} /> : null}
        {tab === 'Capstones' ? <ProjectsTab courseId={id} editable={editable} mini={false} onChange={refreshReadiness} /> : null}
        {tab === 'Mini projects' ? <ProjectsTab courseId={id} editable={editable} mini onChange={refreshReadiness} /> : null}
        {tab === 'FAQs' ? <FaqsTab courseId={id} editable={editable} onChange={refreshReadiness} /> : null}
      </div>
    </div>
  );
}

// ── Basics ──────────────────────────────────────────────────────────────
function BasicsTab({ course, editable, onSaved }: { course: DraftCourse; editable: boolean; onSaved: () => void }) {
  const [f, setF] = useState<any>({});
  const [cats, setCats] = useState<any[]>([]);
  const [langs, setLangs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [thumbBusy, setThumbBusy] = useState(false);
  const [trailerBusy, setTrailerBusy] = useState(false);

  useEffect(() => {
    setF({
      title: course.title || '', subtitle: course.subtitle || '', short_intro: course.short_intro || '', long_intro: course.long_intro || '',
      level: course.level || 'beginner', category_id: course.category_id ?? '', language_id: course.language_id ?? '',
      price: course.price ?? '', original_price: course.original_price ?? '', is_free: !!course.is_free, has_certificate: !!course.has_certificate,
    });
  }, [course]);
  useEffect(() => {
    studioCategories().then(setCats).catch(() => setCats([]));
    studioLanguages().then(setLangs).catch(() => setLangs([]));
  }, []);

  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await updateDraft(course.id, {
        ...f,
        category_id: f.category_id === '' ? null : Number(f.category_id),
        language_id: f.language_id === '' ? null : Number(f.language_id),
        price: f.price === '' ? null : Number(f.price),
        original_price: f.original_price === '' ? null : Number(f.original_price),
      });
      setMsg('Saved.'); onSaved();
    } catch (e: any) { setMsg(e?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 lg:col-span-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Title *</label>
            <input className={input} value={f.title ?? ''} onChange={e => set('title', e.target.value)} disabled={!editable} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Subtitle</label>
            <input className={input} value={f.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} disabled={!editable} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Short intro</label>
            <textarea rows={2} className={input} value={f.short_intro ?? ''} onChange={e => set('short_intro', e.target.value)} disabled={!editable} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Long intro</label>
            <textarea rows={5} className={input} value={f.long_intro ?? ''} onChange={e => set('long_intro', e.target.value)} disabled={!editable} /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Level</label>
            <select className={input} value={f.level ?? 'beginner'} onChange={e => set('level', e.target.value)} disabled={!editable}>
              {LEVELS.map(l => <option key={l} value={l}>{l[0].toUpperCase() + l.slice(1)}</option>)}
            </select></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
            <select className={input} value={f.category_id ?? ''} onChange={e => set('category_id', e.target.value)} disabled={!editable}>
              <option value="">— select —</option>
              {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Language</label>
            <select className={input} value={f.language_id ?? ''} onChange={e => set('language_id', e.target.value)} disabled={!editable}>
              <option value="">— select —</option>
              {langs.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select></div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!f.is_free} onChange={e => set('is_free', e.target.checked)} disabled={!editable} /> Free course</label>
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!f.has_certificate} onChange={e => set('has_certificate', e.target.checked)} disabled={!editable} /> Certificate</label>
          </div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Price (₹)</label>
            <input type="number" className={input} value={f.price ?? ''} onChange={e => set('price', e.target.value)} disabled={!editable || !!f.is_free} /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Original price (₹)</label>
            <input type="number" className={input} value={f.original_price ?? ''} onChange={e => set('original_price', e.target.value)} disabled={!editable || !!f.is_free} /></div>
        </div>
        {msg ? <p className={`mt-3 text-sm ${msg === 'Saved.' ? 'text-emerald-600' : 'text-rose-600'}`}>{msg}</p> : null}
        {editable ? <button onClick={save} disabled={saving} className={`${btn} mt-4`}>{saving ? 'Saving…' : 'Save basics'}</button> : null}
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">Thumbnail</h3>
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail_url} alt="thumbnail" className="mt-3 aspect-video w-full rounded-xl border border-slate-100 object-cover" />
          ) : <div className="mt-3 flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">No thumbnail yet</div>}
          {editable ? (
            <div className="mt-3">
              <FileButton label={course.thumbnail_url ? 'Replace image' : 'Upload image'} accept="image/*" busy={thumbBusy}
                onPick={async file => { setThumbBusy(true); try { await uploadDraftThumbnail(course.id, file); onSaved(); } catch (e: any) { window.alert(e?.message || 'Upload failed'); } finally { setThumbBusy(false); } }} />
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">Trailer video</h3>
          <p className="mt-1 text-xs text-slate-400">{course.trailer_video ? 'Trailer uploaded (streams via Bunny).' : 'Optional promo video shown on the course page.'}</p>
          {editable ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <FileButton label={course.trailer_video ? 'Replace video' : 'Upload video'} accept="video/*" busy={trailerBusy}
                onPick={async file => { setTrailerBusy(true); try { await uploadDraftTrailer(course.id, file); onSaved(); } catch (e: any) { window.alert(e?.message || 'Upload failed'); } finally { setTrailerBusy(false); } }} />
              {course.trailer_video ? (
                <button className={btnGhost} onClick={async () => { if (window.confirm('Remove trailer?')) { try { await removeDraftTrailer(course.id); onSaved(); } catch (e: any) { window.alert(e?.message || 'Failed'); } } }}>
                  <Trash2 className="mr-1 inline h-3 w-3" /> Remove
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Highlights ──────────────────────────────────────────────────────────
function HighlightsTab({ courseId, editable, onChange }: { courseId: number; editable: boolean; onChange: () => void }) {
  const [items, setItems] = useState<DraftHighlight[]>([]);
  const [kind, setKind] = useState('outcome');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => { listHighlights(courseId).then(setItems).catch(() => setItems([])); }, [courseId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try { await createHighlight({ authoring_course_id: courseId, kind, text: text.trim() }); setText(''); load(); onChange(); }
    catch (e: any) { window.alert(e?.message || 'Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      {editable ? (
        <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 sm:flex-row">
          <select className={`${input} sm:w-56`} value={kind} onChange={e => setKind(e.target.value)}>
            {HIGHLIGHT_KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
          <input className={input} placeholder="Write one point and press Add…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
          <button onClick={add} disabled={busy || !text.trim()} className={btn}>Add</button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {HIGHLIGHT_KINDS.map(k => {
          const list = items.filter(h => h.kind === k.value);
          return (
            <div key={k.value} className="rounded-2xl border border-slate-100 bg-white p-4">
              <h3 className="text-sm font-bold text-slate-900">{k.label} <span className="font-normal text-slate-400">({list.length})</span></h3>
              {list.length === 0 ? <p className="mt-2 text-xs text-slate-400">None yet{k.value === 'outcome' ? ' — at least one outcome is required to submit' : ''}.</p> : (
                <ul className="mt-2 space-y-1.5">
                  {list.map(h => (
                    <li key={h.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <span>{h.text}</span>
                      {editable ? <button onClick={async () => { try { await removeHighlight(h.id); load(); onChange(); } catch (e: any) { window.alert(e?.message || 'Failed'); } }} className="text-slate-300 hover:text-rose-500" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Curriculum ──────────────────────────────────────────────────────────
function CurriculumTab({ courseId, editable, onChange }: { courseId: number; editable: boolean; onChange: () => void }) {
  const [units, setUnits] = useState<DraftUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | 'import' | null>(null);
  const [openTopic, setOpenTopic] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listUnits(courseId).then(setUnits).catch(() => setUnits([])).finally(() => setLoading(false));
  }, [courseId]);
  useEffect(() => { load(); }, [load]);

  const tree = useMemo(() => {
    const by = (p: number | null) => units
      .filter(u => (u.parent_unit_id ?? null) === p)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.id - b.id);
    return by(null).filter(u => u.unit_type === 'module').map(m => ({
      ...m,
      chapters: by(m.id).map(c => ({ ...c, topics: by(c.id) })),
    }));
  }, [units]);

  const refresh = () => { load(); onChange(); };
  const addUnit = async (unit_type: 'module' | 'chapter' | 'topic', parent: number | null) => {
    const title = window.prompt(`New ${unit_type} title:`);
    if (!title?.trim()) return;
    try { await createUnit({ authoring_course_id: courseId, unit_type, parent_unit_id: parent, title: title.trim() }); refresh(); }
    catch (e: any) { window.alert(e?.message || 'Failed'); }
  };
  const rename = async (u: DraftUnit) => {
    const title = window.prompt('Title:', u.title);
    if (!title?.trim() || title === u.title) return;
    try { await updateUnit(u.id, { title: title.trim() }); refresh(); } catch (e: any) { window.alert(e?.message || 'Failed'); }
  };
  const remove = async (u: DraftUnit) => {
    if (!window.confirm(`Delete "${u.title}"${u.unit_type !== 'topic' ? ' and everything inside it' : ''}?`)) return;
    try { await deleteUnit(u.id); refresh(); } catch (e: any) { window.alert(e?.message || 'Failed'); }
  };

  return (
    <div>
      {editable ? (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button onClick={() => addUnit('module', null)} className={`${btn} inline-flex items-center gap-1.5`}><FolderPlus className="h-4 w-4" /> Add module</button>
          <FileButton label="Import structure (.txt)" accept=".txt,text/plain" busy={busyId === 'import'}
            onPick={async f => { setBusyId('import'); try { await importStructure(courseId, f); refresh(); } catch (e: any) { window.alert(e?.message || 'Import failed'); } finally { setBusyId(null); } }} />
          <span className="text-[11px] text-slate-400">Tree: Module → Chapter → Topic. Each topic holds the video + PDFs.</span>
        </div>
      ) : null}

      {loading ? <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">Loading curriculum…</div>
        : tree.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No modules yet — add your first module{editable ? ' or import a .txt outline' : ''}.</div>
        : (
        <div className="space-y-4">
          {tree.map((m, mi) => (
            <div key={m.id} className="rounded-2xl border border-slate-100 bg-white">
              <div className="flex items-center justify-between gap-2 border-b border-slate-50 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-900">Module {mi + 1}: {m.title}</h3>
                {editable ? (
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => addUnit('chapter', m.id)} className={btnGhost}><ListPlus className="mr-1 inline h-3 w-3" />Chapter</button>
                    <button onClick={() => rename(m)} className={btnGhost} aria-label="Rename"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => remove(m)} className={`${btnGhost} text-rose-500`} aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                {m.chapters.length === 0 ? <p className="text-xs text-slate-400">No chapters yet.</p> : m.chapters.map((c: any, ci: number) => (
                  <div key={c.id} className="rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between gap-2 bg-slate-50/70 px-3 py-2">
                      <p className="text-[13px] font-semibold text-slate-700">{mi + 1}.{ci + 1} {c.title}</p>
                      {editable ? (
                        <div className="flex shrink-0 gap-1.5">
                          <button onClick={() => addUnit('topic', c.id)} className={btnGhost}><Plus className="mr-0.5 inline h-3 w-3" />Topic</button>
                          <button onClick={() => rename(c)} className={btnGhost} aria-label="Rename"><Pencil className="h-3 w-3" /></button>
                          <button onClick={() => remove(c)} className={`${btnGhost} text-rose-500`} aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      ) : null}
                    </div>
                    {c.topics.length === 0 ? <p className="px-3 py-2 text-xs text-slate-400">No topics yet.</p> : (
                      <ul className="divide-y divide-slate-50">
                        {c.topics.map((t: DraftUnit) => (
                          <li key={t.id} className="px-3 py-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <button onClick={() => setOpenTopic(openTopic === t.id ? null : t.id)} className="flex min-w-0 items-center gap-2 text-left text-[13px] text-slate-700 hover:text-emerald-700">
                                <PlayCircle className={`h-4 w-4 shrink-0 ${t.video || t.youtube_url ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span className="truncate font-medium">{t.title}</span>
                                {t.is_free_preview ? <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">FREE PREVIEW</span> : null}
                              </button>
                              {editable ? (
                                <div className="flex shrink-0 gap-1.5">
                                  <button onClick={() => rename(t)} className={btnGhost} aria-label="Rename"><Pencil className="h-3 w-3" /></button>
                                  <button onClick={() => remove(t)} className={`${btnGhost} text-rose-500`} aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              ) : null}
                            </div>

                            {openTopic === t.id ? (
                              <div className="mt-2 rounded-xl bg-slate-50 p-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Video:</span>
                                  {t.video ? (
                                    <>
                                      <span className="text-[11px] text-emerald-600">uploaded ✓</span>
                                      <button className={btnGhost} onClick={async () => { try { const p = await unitVideoPlayback(t.id); if (p?.url) window.open(p.url, '_blank'); else window.alert('Playback not ready yet (video may still be processing).'); } catch (e: any) { window.alert(e?.message || 'Failed'); } }}>Preview</button>
                                      {editable ? <button className={`${btnGhost} text-rose-500`} onClick={async () => { if (window.confirm('Remove video?')) { try { await removeUnitVideo(t.id); refresh(); } catch (e: any) { window.alert(e?.message || 'Failed'); } } }}>Remove</button> : null}
                                    </>
                                  ) : t.youtube_url ? <span className="text-[11px] text-slate-500">YouTube: {t.youtube_url}</span> : <span className="text-[11px] text-slate-400">none</span>}
                                  {editable ? (
                                    <>
                                      <FileButton label={t.video ? 'Replace video' : 'Upload video'} accept="video/*" busy={busyId === t.id}
                                        onPick={async f => { setBusyId(t.id); try { await uploadUnitVideo(t.id, f); refresh(); } catch (e: any) { window.alert(e?.message || 'Upload failed'); } finally { setBusyId(null); } }} />
                                      <button className={btnGhost} onClick={async () => { const y = window.prompt('YouTube URL (blank to clear):', t.youtube_url || ''); if (y === null) return; try { await updateUnit(t.id, { youtube_url: y.trim() || null }); refresh(); } catch (e: any) { window.alert(e?.message || 'Failed'); } }}>YouTube link</button>
                                      <label className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                                        <input type="checkbox" checked={!!t.is_free_preview} onChange={async e => { try { await updateUnit(t.id, { is_free_preview: e.target.checked }); refresh(); } catch (er: any) { window.alert(er?.message || 'Failed'); } }} /> Free preview
                                      </label>
                                    </>
                                  ) : null}
                                </div>

                                <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                                  {FILE_SLOTS.map(slot => (
                                    <div key={slot.kind} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5">
                                      <span className="flex items-center gap-1.5 text-[11px] text-slate-600"><FileText className="h-3 w-3 text-slate-300" /> {slot.label}{(t as any)[slot.col] ? <span className="text-emerald-600">✓</span> : null}</span>
                                      {editable ? (
                                        <span className="flex gap-1">
                                          <FileButton label={(t as any)[slot.col] ? 'Replace' : 'Upload'} accept=".pdf,.zip,.doc,.docx,application/pdf" busy={busyId === t.id}
                                            onPick={async f => { setBusyId(t.id); try { await uploadUnitFile(t.id, slot.kind, f); refresh(); } catch (e: any) { window.alert(e?.message || 'Upload failed'); } finally { setBusyId(null); } }} />
                                          {(t as any)[slot.col] ? <button className={`${btnGhost} text-rose-500`} onClick={async () => { try { await removeUnitFile(t.id, slot.kind); refresh(); } catch (e: any) { window.alert(e?.message || 'Failed'); } }} aria-label="Remove file"><Trash2 className="h-3 w-3" /></button> : null}
                                        </span>
                                      ) : (t as any)[slot.col] ? <a href={(t as any)[slot.col]} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-emerald-600">open</a> : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Capstones & Mini projects ───────────────────────────────────────────
function ProjectsTab({ courseId, editable, mini, onChange }: { courseId: number; editable: boolean; mini: boolean; onChange: () => void }) {
  const [items, setItems] = useState<DraftProject[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [git, setGit] = useState('');
  const [busy, setBusy] = useState<number | 0 | null>(null);
  const label = mini ? 'mini project' : 'capstone project';

  const load = useCallback(() => {
    (mini ? listMiniProjects(courseId) : listCapstones(courseId)).then(setItems).catch(() => setItems([]));
  }, [courseId, mini]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!title.trim()) return;
    setBusy(0);
    try {
      const body = { authoring_course_id: courseId, title: title.trim(), description: desc.trim() || null, solution_github_url: git.trim() || null };
      await (mini ? createMiniProject(body) : createCapstone(body));
      setTitle(''); setDesc(''); setGit(''); load(); onChange();
    } catch (e: any) { window.alert(e?.message || 'Failed'); }
    finally { setBusy(null); }
  };

  return (
    <div>
      {editable ? (
        <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-900">Add {label}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input className={input} placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} />
            <input className={input} placeholder="Solution GitHub URL (optional)" value={git} onChange={e => setGit(e.target.value)} />
            <textarea rows={2} className={`${input} sm:col-span-2`} placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <button onClick={add} disabled={busy === 0 || !title.trim()} className={`${btn} mt-3`}>{busy === 0 ? 'Adding…' : `Add ${label}`}</button>
        </div>
      ) : null}

      {items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">No {label}s yet.</div> : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map(p => (
            <div key={p.id} className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-slate-900">{p.title}</h4>
                  {p.description ? <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{p.description}</p> : null}
                </div>
                {editable ? <button onClick={async () => { if (window.confirm('Delete this project?')) { try { await (mini ? removeMiniProject(p.id) : removeCapstone(p.id)); load(); onChange(); } catch (e: any) { window.alert(e?.message || 'Failed'); } } }} className="text-slate-300 hover:text-rose-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button> : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className={p.pdf_url ? 'text-emerald-600' : 'text-slate-400'}>Brief PDF {p.pdf_url ? '✓' : '—'}</span>
                <span className={p.solution_file_url ? 'text-emerald-600' : 'text-slate-400'}>Solution {p.solution_file_url ? '✓' : '—'}</span>
                {p.solution_github_url ? <a className="font-semibold text-emerald-600" href={p.solution_github_url} target="_blank" rel="noreferrer">GitHub</a> : null}
              </div>
              {editable ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <FileButton label={p.pdf_url ? 'Replace brief' : 'Upload brief'} accept=".pdf" busy={busy === p.id}
                    onPick={async f => { setBusy(p.id); try { await (mini ? uploadMiniProjectFile(p.id, 'pdf', f) : uploadCapstoneFile(p.id, 'pdf', f)); load(); } catch (e: any) { window.alert(e?.message || 'Upload failed'); } finally { setBusy(null); } }} />
                  <FileButton label={p.solution_file_url ? 'Replace solution' : 'Upload solution'} accept=".pdf,.zip" busy={busy === p.id}
                    onPick={async f => { setBusy(p.id); try { await (mini ? uploadMiniProjectFile(p.id, 'solution', f) : uploadCapstoneFile(p.id, 'solution', f)); load(); } catch (e: any) { window.alert(e?.message || 'Upload failed'); } finally { setBusy(null); } }} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FAQs ────────────────────────────────────────────────────────────────
function FaqsTab({ courseId, editable, onChange }: { courseId: number; editable: boolean; onChange: () => void }) {
  const [items, setItems] = useState<DraftFaq[]>([]);
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => { listDraftFaqs(courseId).then(setItems).catch(() => setItems([])); }, [courseId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!q.trim() || !a.trim()) return;
    setBusy(true);
    try { await createDraftFaq({ authoring_course_id: courseId, question: q.trim(), answer: a.trim() }); setQ(''); setA(''); load(); onChange(); }
    catch (e: any) { window.alert(e?.message || 'Failed'); }
    finally { setBusy(false); }
  };

  return (
    <div>
      {editable ? (
        <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4">
          <input className={input} placeholder="Question" value={q} onChange={e => setQ(e.target.value)} />
          <textarea rows={3} className={`${input} mt-2`} placeholder="Answer" value={a} onChange={e => setA(e.target.value)} />
          <button onClick={add} disabled={busy || !q.trim() || !a.trim()} className={`${btn} mt-3`}>{busy ? 'Adding…' : 'Add FAQ'}</button>
        </div>
      ) : null}
      {items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">No FAQs yet — these show on your course page after publish.</div> : (
        <div className="space-y-2">
          {items.map(f => (
            <div key={f.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{f.question}</p>
                <p className="mt-1 text-xs text-slate-500">{f.answer}</p>
              </div>
              {editable ? <button onClick={async () => { try { await removeDraftFaq(f.id); load(); onChange(); } catch (e: any) { window.alert(e?.message || 'Failed'); } }} className="shrink-0 text-slate-300 hover:text-rose-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
