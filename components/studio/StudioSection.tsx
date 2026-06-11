'use client';

/**
 * Generic Instructor-Studio section: own-content list + create/edit dialog,
 * fully config-driven so one component serves webinars, live sessions,
 * batches, blog, podcasts, FAQs and promotions.
 * Every call goes to /studio/:type — the API enforces ownership.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StudioType, studioList, studioCreate, studioUpdate, studioDelete,
  myPublishedCourses, getPromotionCourses, setPromotionCourses,
} from '@/lib/studio';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Field {
  name: string;
  label: string;
  kind: 'text' | 'textarea' | 'number' | 'select' | 'datetime' | 'date' | 'checkbox' | 'course';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  half?: boolean;       // render two-per-row
  hint?: string;
}

export interface Col {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

export function Chip({ value }: { value?: string | null }) {
  const v = String(value || '—').toLowerCase();
  const tone =
    ['live', 'published', 'active', 'ongoing', 'verified'].includes(v) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    ['scheduled', 'upcoming', 'draft', 'pending', 'pending_review'].includes(v) ? 'bg-amber-50 text-amber-700 border-amber-200' :
    ['cancelled', 'rejected', 'expired'].includes(v) ? 'bg-rose-50 text-rose-600 border-rose-200' :
    'bg-slate-50 text-slate-600 border-slate-200';
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}>{String(value || '—').replace(/_/g, ' ')}</span>;
}

function toLocalInput(iso?: string | null, dateOnly = false): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  return dateOnly ? date : `${date}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function StudioSection({
  type, singular, fields, columns, statusKey, emptyHint, coursePicker, note,
}: {
  type: StudioType;
  singular: string;             // e.g. "webinar"
  fields: Field[];
  columns: Col[];
  statusKey?: string;           // column shown as chip in list
  emptyHint?: string;
  coursePicker?: boolean;       // promotions: attach own courses
  note?: string;                // banner note (e.g. approval flows)
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [pickedCourses, setPickedCourses] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setRows(await studioList(type)); }
    catch (e: any) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [type]);

  useEffect(() => { void load(); }, [load]);

  const needsCourses = coursePicker || fields.some(f => f.kind === 'course');
  useEffect(() => {
    if (!needsCourses) return;
    myPublishedCourses().then(c => setCourses(c.map(x => ({ id: x.id, name: x.name })))).catch(() => setCourses([]));
  }, [needsCourses]);

  const openForm = async (row?: any) => {
    setFormError('');
    setEditing(row || null);
    const v: Record<string, any> = {};
    for (const f of fields) {
      const raw = row ? row[f.name] : undefined;
      if (f.kind === 'checkbox') v[f.name] = row ? !!raw : f.name === 'is_active';
      else if (f.kind === 'datetime') v[f.name] = toLocalInput(raw);
      else if (f.kind === 'date') v[f.name] = toLocalInput(raw, true);
      else v[f.name] = raw ?? '';
    }
    setValues(v);
    setPickedCourses([]);
    setOpen(true);
    if (coursePicker && row) {
      try { setPickedCourses(await getPromotionCourses(row.id)); } catch { /* ignore */ }
    }
  };

  const save = async () => {
    setFormError('');
    for (const f of fields) {
      if (f.required && (values[f.name] === '' || values[f.name] === undefined || values[f.name] === null)) {
        setFormError(`${f.label} is required`); return;
      }
    }
    setSaving(true);
    try {
      const body: Record<string, any> = {};
      for (const f of fields) {
        let v = values[f.name];
        if ((f.kind === 'datetime' || f.kind === 'date') && v) v = new Date(v).toISOString();
        body[f.name] = v === '' ? null : v;
      }
      const saved = editing
        ? await studioUpdate(type, editing.id, body)
        : await studioCreate(type, body);
      if (coursePicker) await setPromotionCourses(saved.id ?? editing?.id, pickedCourses);
      setOpen(false);
      await load();
    } catch (e: any) {
      setFormError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const trash = async (row: any) => {
    if (!window.confirm(`Move this ${singular} to trash?`)) return;
    try { await studioDelete(type, row.id); await load(); }
    catch (e: any) { window.alert(e?.message || 'Delete failed'); }
  };

  const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400';
  const visibleCols = useMemo(() => columns.slice(0, 5), [columns]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{rows.length} {rows.length === 1 ? singular : `${singular}s`}</p>
        <button onClick={() => openForm()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          + New {singular}
        </button>
      </div>

      {note ? <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">{note}</div> : null}
      {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Nothing here yet</p>
          <p className="mt-1 text-xs text-slate-400">{emptyHint || `Create your first ${singular} to get started.`}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                {visibleCols.map(c => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
                {statusKey ? <th className="px-4 py-3 font-semibold">Status</th> : null}
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  {visibleCols.map(c => (
                    <td key={c.key} className="px-4 py-3 align-middle text-slate-700">
                      {c.render ? c.render(row) : <span className="line-clamp-1">{row[c.key] ?? '—'}</span>}
                    </td>
                  ))}
                  {statusKey ? <td className="px-4 py-3"><Chip value={row[statusKey]} /></td> : null}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openForm(row)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700">Edit</button>
                    <button onClick={() => trash(row)} className="ml-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:border-rose-300">Trash</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4" onClick={() => !saving && setOpen(false)}>
          <div className="mt-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{editing ? `Edit ${singular}` : `New ${singular}`}</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100" aria-label="Close">✕</button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(f => (
                <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {f.label}{f.required ? <span className="text-rose-500"> *</span> : null}
                  </label>
                  {f.kind === 'textarea' ? (
                    <textarea rows={4} className={input} placeholder={f.placeholder} value={values[f.name] ?? ''} onChange={e => setValues(s => ({ ...s, [f.name]: e.target.value }))} />
                  ) : f.kind === 'select' ? (
                    <select className={input} value={values[f.name] ?? ''} onChange={e => setValues(s => ({ ...s, [f.name]: e.target.value }))}>
                      <option value="">— select —</option>
                      {(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.kind === 'course' ? (
                    <select className={input} value={values[f.name] ?? ''} onChange={e => setValues(s => ({ ...s, [f.name]: e.target.value }))}>
                      <option value="">— select your course —</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : f.kind === 'checkbox' ? (
                    <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input type="checkbox" checked={!!values[f.name]} onChange={e => setValues(s => ({ ...s, [f.name]: e.target.checked }))} />
                      {f.placeholder || 'Yes'}
                    </label>
                  ) : (
                    <input
                      type={f.kind === 'number' ? 'number' : f.kind === 'datetime' ? 'datetime-local' : f.kind === 'date' ? 'date' : 'text'}
                      className={input} placeholder={f.placeholder} value={values[f.name] ?? ''}
                      onChange={e => setValues(s => ({ ...s, [f.name]: e.target.value }))}
                    />
                  )}
                  {f.hint ? <p className="mt-1 text-[11px] text-slate-400">{f.hint}</p> : null}
                </div>
              ))}

              {coursePicker ? (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Applies to courses</label>
                  {courses.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">You have no published courses yet — the promotion will apply to none until courses are attached.</p>
                  ) : (
                    <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 p-2">
                      {courses.map(c => (
                        <label key={c.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={pickedCourses.includes(c.id)}
                            onChange={e => setPickedCourses(p => e.target.checked ? [...p, c.id] : p.filter(x => x !== c.id))}
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-[11px] text-slate-400">Only your own courses can be attached.</p>
                </div>
              ) : null}
            </div>

            {formError ? <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div> : null}

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={save} disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
