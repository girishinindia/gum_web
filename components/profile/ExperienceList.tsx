'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Save, Trash2, Pencil, Loader2, AlertCircle, Briefcase,
} from 'lucide-react';
import {
  addExperience, updateExperience, deleteExperience, listDesignations,
  type UserExperience, type Designation, type EmploymentType, type WorkMode,
} from '@/lib/users/client';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FieldError } from '@/components/ui/FieldError';
import {
  validateRequired, validateMaxLen, validateDate, validateDateRange,
} from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * Experience list + inline expander form.
 *
 * Full schema (Zod `createUserExperienceSchema`):
 *   required: company_name, job_title, start_date
 *   optional: designation_id, employment_type, work_mode, department,
 *             location, end_date, is_current_job, description,
 *             key_achievements, skills_used, salary_range,
 *             reference_name, reference_phone, reference_email
 *
 * The expander groups fields into 4 labelled sub-sections so the form
 * doesn't read as a wall of inputs: Role · Dates · Detail · References.
 */

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'full_time',      label: 'Full-time' },
  { value: 'part_time',      label: 'Part-time' },
  { value: 'contract',       label: 'Contract' },
  { value: 'internship',     label: 'Internship' },
  { value: 'freelance',      label: 'Freelance' },
  { value: 'self_employed',  label: 'Self-employed' },
  { value: 'volunteer',      label: 'Volunteer' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'other',          label: 'Other' },
];

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: 'on_site', label: 'On-site' },
  { value: 'remote',  label: 'Remote' },
  { value: 'hybrid',  label: 'Hybrid' },
];

export function ExperienceList({
  rows, onAdded, onUpdated, onRemoved,
}: {
  rows:      UserExperience[];
  onAdded:   (row: UserExperience) => void;
  onUpdated: (row: UserExperience) => void;
  onRemoved: (id: number) => void;
}) {
  const [mode, setMode] = useState<{ kind: 'idle' } | { kind: 'add' } | { kind: 'edit'; row: UserExperience }>({ kind: 'idle' });
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loadingDes, setLoadingDes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listDesignations()
      .then((rs) => { if (!cancelled) setDesignations(rs); })
      .catch((e) => { if (!cancelled) console.error('[ExperienceList] listDesignations', e); })
      .finally(() => { if (!cancelled) setLoadingDes(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleSave(
    payload: Parameters<typeof addExperience>[0],
    editingId: number | null,
  ) {
    setError(null);
    try {
      if (editingId == null) {
        const created = await addExperience(payload);
        onAdded(created);
      } else {
        const updated = await updateExperience(editingId, payload);
        onUpdated(updated);
      }
      setMode({ kind: 'idle' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteExperience(id);
      onRemoved(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove.');
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {rows.length === 0 && mode.kind === 'idle' && (
        <div className="text-sm text-slate-500 mb-3">No work experience added yet.</div>
      )}

      <ul className="space-y-2">
        {rows.map((r) => {
          const editing = mode.kind === 'edit' && mode.row.id === r.id;
          return (
            <li key={r.id} className="rounded-md border border-slate-200 bg-slate-50/60">
              <div className="flex items-start gap-3 px-3 py-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-violet-50 text-violet-700 border border-violet-200 shrink-0">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {r.job_title} <span className="text-slate-500 font-normal">@ {r.company_name}</span>
                    </div>
                    {r.is_current_job && (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                        current
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-slate-600 truncate mt-0.5">
                    {r.employment_type ? employmentLabel(r.employment_type) + ' · ' : ''}
                    {r.work_mode ? workModeLabel(r.work_mode) + ' · ' : ''}
                    {r.location ? r.location + ' · ' : ''}
                    {formatDate(r.start_date)}{r.is_current_job ? ' – present' : r.end_date ? ` – ${formatDate(r.end_date)}` : ''}
                  </div>
                  {r.description && (
                    <div className="mt-1 text-[12.5px] text-slate-600 line-clamp-2">{r.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setMode(editing ? { kind: 'idle' } : { kind: 'edit', row: r })}
                    className="text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-md p-1.5"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => r.id && void handleDelete(r.id)}
                    className="text-rose-500 hover:bg-rose-50 rounded-md p-1.5"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {editing && (
                <div className="border-t border-slate-200 bg-white p-3 rounded-b-md">
                  <ExperienceForm
                    initial={mode.row}
                    designations={designations}
                    loadingDes={loadingDes}
                    onCancel={() => setMode({ kind: 'idle' })}
                    onSave={(payload) => handleSave(payload, mode.row.id ?? null)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-3">
        {mode.kind === 'add' ? (
          <div className="rounded-md border border-brand-200 bg-brand-50/40 p-3">
            <ExperienceForm
              initial={null}
              designations={designations}
              loadingDes={loadingDes}
              onCancel={() => setMode({ kind: 'idle' })}
              onSave={(payload) => handleSave(payload, null)}
            />
          </div>
        ) : mode.kind === 'idle' && (
          <button
            type="button"
            onClick={() => setMode({ kind: 'add' })}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[12.5px] font-bold shadow-btn"
          >
            <Plus className="h-3.5 w-3.5" /> Add experience
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ExperienceForm — pure form, parent owns the POST / PATCH calls.

function ExperienceForm({
  initial, designations, loadingDes, onCancel, onSave,
}: {
  initial: UserExperience | null;
  designations: Designation[];
  loadingDes: boolean;
  onCancel: () => void;
  onSave: (payload: Parameters<typeof addExperience>[0]) => Promise<void>;
}) {
  const [companyName,    setCompanyName]    = useState(initial?.company_name ?? '');
  const [jobTitle,       setJobTitle]       = useState(initial?.job_title ?? '');
  const [designationId,  setDesignationId]  = useState<string>(initial?.designation_id ? String(initial.designation_id) : '');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initial?.employment_type ?? 'full_time');
  const [workMode,       setWorkMode]       = useState<WorkMode>(initial?.work_mode ?? 'on_site');
  const [department,     setDepartment]     = useState(initial?.department ?? '');
  const [location,       setLocation]       = useState(initial?.location ?? '');
  const [startDate,      setStartDate]      = useState(initial?.start_date ?? '');
  const [endDate,        setEndDate]        = useState(initial?.end_date ?? '');
  const [isCurrent,      setIsCurrent]      = useState(!!initial?.is_current_job);
  const [description,    setDescription]    = useState(initial?.description ?? '');
  const [achievements,   setAchievements]   = useState(initial?.key_achievements ?? '');
  const [skillsUsed,     setSkillsUsed]     = useState(initial?.skills_used ?? '');
  const [salaryRange,    setSalaryRange]    = useState(initial?.salary_range ?? '');

  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    const c1 = validateRequired(companyName, 'Company');
    if (!c1.ok) errs.companyName = c1.msg;
    const c2 = validateMaxLen(companyName, 500, 'Company');
    if (!c2.ok) errs.companyName = c2.msg;
    const t1 = validateRequired(jobTitle, 'Job title');
    if (!t1.ok) errs.jobTitle = t1.msg;
    const t2 = validateMaxLen(jobTitle, 500, 'Job title');
    if (!t2.ok) errs.jobTitle = t2.msg;
    const d1 = validateMaxLen(department, 300, 'Department');
    if (!d1.ok) errs.department = d1.msg;
    const l1 = validateMaxLen(location, 500, 'Location');
    if (!l1.ok) errs.location = l1.msg;
    const desc = validateMaxLen(description, 5000, 'Description');
    if (!desc.ok) errs.description = desc.msg;
    const ach = validateMaxLen(achievements, 5000, 'Key achievements');
    if (!ach.ok) errs.achievements = ach.msg;
    const sk = validateMaxLen(skillsUsed, 2000, 'Skills used');
    if (!sk.ok) errs.skillsUsed = sk.msg;
    const sal = validateMaxLen(salaryRange, 100, 'Salary range');
    if (!sal.ok) errs.salaryRange = sal.msg;
    const sR = validateRequired(startDate, 'Start date');
    if (!sR.ok) errs.startDate = sR.msg;
    else {
      const sd = validateDate(startDate, { label: 'Start date', notFuture: true });
      if (!sd.ok) errs.startDate = sd.msg;
    }
    if (!isCurrent) {
      const ed = validateDate(endDate, { label: 'End date', notFuture: true });
      if (!ed.ok) errs.endDate = ed.msg;
      const range = validateDateRange(startDate, endDate);
      if (!range.ok) errs.endDate = range.msg;
    }
    return errs;
  }

  function blurValidate() {
    setFieldErrors(runValidation());
  }

  async function commit() {
    const errs = runValidation();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSave({
        company_name:     companyName.trim(),
        job_title:        jobTitle.trim(),
        designation_id:   designationId ? Number(designationId) : null,
        employment_type:  employmentType,
        work_mode:        workMode,
        department:       department || null,
        location:         location || null,
        start_date:       startDate,
        end_date:         isCurrent ? null : (endDate || null),
        is_current_job:   isCurrent,
        description:      description || null,
        key_achievements: achievements || null,
        skills_used:      skillsUsed || null,
        salary_range:     salaryRange || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <Group title="Role">
        <Grid>
          <Field label="Company" required>
            <input
              className={cn(inputCls, fieldErrors.companyName && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Flipkart"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onBlur={blurValidate}
              maxLength={500}
              aria-invalid={!!fieldErrors.companyName}
            />
            <FieldError message={fieldErrors.companyName} />
          </Field>
          <Field label="Job title" required>
            <input
              className={cn(inputCls, fieldErrors.jobTitle && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Senior Data Analyst"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onBlur={blurValidate}
              maxLength={500}
              aria-invalid={!!fieldErrors.jobTitle}
            />
            <FieldError message={fieldErrors.jobTitle} />
          </Field>
          <Field label="Designation (standard ladder)">
            <SearchableSelect<Designation>
              value={designationId}
              onChange={setDesignationId}
              options={designations}
              getValue={(d) => String(d.id)}
              getLabel={(d) => d.name}
              placeholder={loadingDes ? 'Loading designations…' : 'Optional · pick a standard rank'}
              searchPlaceholder="Search designations…"
              disabled={loadingDes}
              loading={loadingDes}
            />
          </Field>
          <Field label="Department">
            <input
              className={cn(inputCls, fieldErrors.department && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Analytics"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              onBlur={blurValidate}
              maxLength={300}
              aria-invalid={!!fieldErrors.department}
            />
            <FieldError message={fieldErrors.department} />
          </Field>
          <Field label="Employment type">
            <select className={inputCls} value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}>
              {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Work mode">
            <select className={inputCls} value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
              {WORK_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <input
              className={cn(inputCls, fieldErrors.location && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Bengaluru, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={blurValidate}
              maxLength={500}
              aria-invalid={!!fieldErrors.location}
            />
            <FieldError message={fieldErrors.location} />
          </Field>
        </Grid>
      </Group>

      <Group title="Dates">
        <Grid>
          <Field label="Start date" required>
            <input
              type="date"
              className={cn(inputCls, fieldErrors.startDate && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={blurValidate}
              max={new Date().toISOString().slice(0, 10)}
              aria-invalid={!!fieldErrors.startDate}
            />
            <FieldError message={fieldErrors.startDate} />
          </Field>
          <Field label="End date">
            <input
              type="date"
              className={cn(
                inputCls,
                isCurrent && 'bg-slate-50 text-slate-400',
                fieldErrors.endDate && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400',
              )}
              value={isCurrent ? '' : (endDate ?? '')}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={blurValidate}
              disabled={isCurrent}
              max={new Date().toISOString().slice(0, 10)}
              min={startDate || undefined}
              aria-invalid={!!fieldErrors.endDate}
            />
            <FieldError message={fieldErrors.endDate} />
          </Field>
        </Grid>
        <label className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-slate-700 cursor-pointer">
          <input type="checkbox" checked={isCurrent} onChange={(e) => {
            const next = e.target.checked;
            setIsCurrent(next);
            // Phase 38.1 — clear endDate state on toggle ON.
            if (next) setEndDate('');
            setFieldErrors((p) => ({ ...p, endDate: undefined }));
          }} className="rounded accent-brand-500" />
          I currently work here
        </label>
      </Group>

      <Group title="Detail">
        <div className="space-y-2">
          <Field label="Description">
            <textarea
              rows={3}
              className={cn(inputCls, 'min-h-[80px] resize-y', fieldErrors.description && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="What did you do here? (responsibilities, scope)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={blurValidate}
              maxLength={5000}
              aria-invalid={!!fieldErrors.description}
            />
            <FieldError message={fieldErrors.description} />
          </Field>
          <Field label="Key achievements">
            <textarea
              rows={3}
              className={cn(inputCls, 'min-h-[80px] resize-y', fieldErrors.achievements && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Reduced report turnaround from 5d → 1d (one per line)"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              onBlur={blurValidate}
              maxLength={5000}
              aria-invalid={!!fieldErrors.achievements}
            />
            <FieldError message={fieldErrors.achievements} />
          </Field>
          <Grid>
            <Field label="Skills used">
              <input
                className={cn(inputCls, fieldErrors.skillsUsed && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
                placeholder="Comma-separated · e.g. Python, SQL, Looker"
                value={skillsUsed}
                onChange={(e) => setSkillsUsed(e.target.value)}
                onBlur={blurValidate}
                maxLength={2000}
                aria-invalid={!!fieldErrors.skillsUsed}
              />
              <FieldError message={fieldErrors.skillsUsed} />
            </Field>
            <Field label="Salary range (optional)">
              <input
                className={cn(inputCls, fieldErrors.salaryRange && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
                placeholder="e.g. 12–15 LPA"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                onBlur={blurValidate}
                maxLength={100}
                aria-invalid={!!fieldErrors.salaryRange}
              />
              <FieldError message={fieldErrors.salaryRange} />
            </Field>
          </Grid>
        </div>
      </Group>

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-full">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void commit()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[12.5px] font-bold shadow-btn disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {initial ? 'Save changes' : 'Add experience'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Bits

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">{title}</div>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.5px] font-semibold text-slate-700 mb-1">
        {label}{required && <span className="text-rose-500"> *</span>}
      </div>
      {children}
    </label>
  );
}
function employmentLabel(v: EmploymentType): string {
  return EMPLOYMENT_TYPES.find((t) => t.value === v)?.label ?? v;
}
function workModeLabel(v: WorkMode): string {
  return WORK_MODES.find((m) => m.value === v)?.label ?? v;
}
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m[2], 10) - 1] ?? ''} ${m[1]}`;
}
const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
