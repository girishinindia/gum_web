'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Trash2, Pencil, Save, Loader2, AlertCircle, X, GraduationCap,
  CheckCircle2, FileText, Star,
} from 'lucide-react';
import {
  addEducation, updateEducation, deleteEducation,
  listEducationLevels,
  type UserEducation, type EducationLevel, type GradeType,
} from '@/lib/users/client';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FieldError } from '@/components/ui/FieldError';
import {
  validateMaxLen, validateRequired, validateDate, validateDateRange,
  validateGrade, validateFile, validateText,
} from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * Education list + inline expander form.
 *
 * Shape per row (server schema):
 *   education_level_id, institution_name, board_or_university,
 *   field_of_study, specialization, grade_or_percentage, grade_type,
 *   start_date, end_date, is_currently_studying, is_highest_qualification,
 *   description, certificate_url
 *
 * UX
 *   • Collapsed: rows of `<level> — <field_of_study>` with the institution
 *     and a date range below. Edit / delete buttons on the right.
 *   • "+ Add" or "Edit" opens an inline expander with the full form
 *     grouped into: identity (level + institution) · subject (field +
 *     specialization) · timeline (dates + currently studying) · grade ·
 *     certificate upload · description.
 *   • Save calls POST or PATCH against `/user-education/me[/...]`
 *     (multipart — the certificate is uploaded as the `certificate` field).
 */

const GRADE_TYPES: { value: GradeType; label: string }[] = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'cgpa',       label: 'CGPA' },
  { value: 'gpa',        label: 'GPA' },
  { value: 'grade',      label: 'Letter grade' },
  { value: 'pass_fail',  label: 'Pass / Fail' },
  { value: 'other',      label: 'Other' },
];

export function EducationList({
  rows, onAdded, onUpdated, onRemoved, onRefetch,
}: {
  rows:      UserEducation[];
  onAdded:   (row: UserEducation) => void;
  onUpdated: (row: UserEducation) => void;
  onRemoved: (id: number) => void;
  // Bug 3b fix: optional callback the parent provides to re-fetch the
  // full list from the server. We call it after a save error to undo
  // any optimistic state divergence — e.g. if the user toggled
  // "currently studying" and the server rejected the patch, we want the
  // UI to revert to the persisted truth rather than show the failed
  // edits as if they had taken.
  onRefetch?: () => Promise<void> | void;
}) {
  const [mode, setMode] = useState<{ kind: 'idle' } | { kind: 'add' } | { kind: 'edit'; row: UserEducation }>({ kind: 'idle' });
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Master list of education levels — loaded once on mount, reused for
  // both the row labels and the form's level dropdown.
  useEffect(() => {
    let cancelled = false;
    listEducationLevels()
      .then((rs) => { if (!cancelled) setLevels(rs); })
      .catch((e) => { if (!cancelled) console.error('[EducationList] listEducationLevels', e); })
      .finally(() => { if (!cancelled) setLoadingLevels(false); });
    return () => { cancelled = true; };
  }, []);

  // Fast lookup: education_level_id → master row.
  const levelById = useMemo(() => {
    const m = new Map<number, EducationLevel>();
    for (const l of levels) m.set(l.id, l);
    return m;
  }, [levels]);

  async function handleSave(
    payload: Omit<UserEducation, 'id' | 'user_id' | 'education_level' | 'created_at' | 'updated_at' | 'certificate_url'>,
    certificate: File | null,
    editingId: number | null,
  ) {
    setError(null);
    try {
      if (editingId == null) {
        const created = await addEducation(payload, certificate);
        onAdded(created);
      } else {
        const updated = await updateEducation(editingId, payload, certificate);
        onUpdated(updated);
      }
      setMode({ kind: 'idle' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
      // Bug 3b fix: on error, ask the parent to re-fetch from the server so
      // the visible row reflects what's actually persisted. Without this,
      // a 400 (e.g. "currently studying" toggling end_date to "null") would
      // leave the optimistically-updated row in place, which the user reads
      // as "my edits don't persist."
      if (onRefetch) {
        try { await onRefetch(); } catch { /* surface the original error */ }
      }
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteEducation(id);
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

      {/* List */}
      {rows.length === 0 && mode.kind === 'idle' && (
        <div className="text-sm text-slate-500 mb-3">No education added yet. Click <b>Add</b> to start.</div>
      )}

      <ul className="space-y-2">
        {rows.map((r) => {
          const level = (r.education_level && r.education_level.name)
            || (r.education_level_id ? levelById.get(r.education_level_id)?.name : null)
            || null;
          const abbrev = (r.education_level && (r.education_level as { abbreviation?: string | null }).abbreviation)
            || (r.education_level_id ? levelById.get(r.education_level_id)?.abbreviation : null)
            || null;
          const editing = mode.kind === 'edit' && mode.row.id === r.id;
          return (
            <li key={r.id} className="rounded-md border border-slate-200 bg-slate-50/60">
              <div className="flex items-start gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {abbrev ? `${abbrev} · ` : ''}{r.field_of_study || level || 'Programme'}
                    </div>
                    {r.is_highest_qualification && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
                        <Star className="h-2.5 w-2.5 fill-amber-400 stroke-amber-500" /> highest
                      </span>
                    )}
                    {r.is_currently_studying && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 px-2 py-0.5 text-[10px] font-bold">in progress</span>
                    )}
                  </div>
                  <div className="text-[12.5px] text-slate-600 truncate mt-0.5">
                    {r.institution_name}
                    {r.board_or_university ? ` · ${r.board_or_university}` : ''}
                    {r.start_date ? ` · ${formatDate(r.start_date)}` : ''}
                    {r.end_date ? ` – ${formatDate(r.end_date)}` : (r.is_currently_studying ? ' – present' : '')}
                    {r.grade_or_percentage ? ` · ${r.grade_or_percentage}${r.grade_type ? ` ${gradeTypeShort(r.grade_type)}` : ''}` : ''}
                  </div>
                  {r.certificate_url && (
                    <a href={r.certificate_url} target="_blank" rel="noreferrer noopener"
                       className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-brand-700 hover:underline">
                      <FileText className="h-3 w-3" /> View certificate
                    </a>
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
                  <EducationForm
                    initial={mode.row}
                    levels={levels}
                    loadingLevels={loadingLevels}
                    onCancel={() => setMode({ kind: 'idle' })}
                    onSave={(payload, file) => handleSave(payload, file, mode.row.id ?? null)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add button + add form */}
      <div className="mt-3">
        {mode.kind === 'add' ? (
          <div className="rounded-md border border-brand-200 bg-brand-50/40 p-3">
            <EducationForm
              initial={null}
              levels={levels}
              loadingLevels={loadingLevels}
              onCancel={() => setMode({ kind: 'idle' })}
              onSave={(payload, file) => handleSave(payload, file, null)}
            />
          </div>
        ) : mode.kind === 'idle' && (
          <button
            type="button"
            onClick={() => setMode({ kind: 'add' })}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[12.5px] font-bold shadow-btn"
          >
            <Plus className="h-3.5 w-3.5" /> Add education
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// EducationForm — used for both create AND edit. Pure UI; the parent
// owns the actual POST/PATCH so error / list state lives in one place.
// ─────────────────────────────────────────────────────────────────────

function EducationForm({
  initial, levels, loadingLevels, onCancel, onSave,
}: {
  initial: UserEducation | null;
  levels: EducationLevel[];
  loadingLevels: boolean;
  onCancel: () => void;
  onSave: (
    payload: Omit<UserEducation, 'id' | 'user_id' | 'education_level' | 'created_at' | 'updated_at' | 'certificate_url'>,
    certificate: File | null,
  ) => Promise<void>;
}) {
  const [educationLevelId, setEducationLevelId] = useState<string>(
    initial?.education_level_id ? String(initial.education_level_id) : '',
  );
  const [institutionName, setInstitutionName] = useState(initial?.institution_name ?? '');
  const [board,           setBoard]           = useState(initial?.board_or_university ?? '');
  const [fieldOfStudy,    setFieldOfStudy]    = useState(initial?.field_of_study ?? '');
  const [specialization,  setSpecialization]  = useState(initial?.specialization ?? '');
  const [grade,           setGrade]           = useState(initial?.grade_or_percentage ?? '');
  const [gradeType,       setGradeType]       = useState<GradeType | ''>(initial?.grade_type ?? '');
  const [startDate,       setStartDate]       = useState(initial?.start_date ?? '');
  const [endDate,         setEndDate]         = useState(initial?.end_date ?? '');
  const [currentlyStudying, setCurrentlyStudying] = useState(!!initial?.is_currently_studying);
  const [isHighest,       setIsHighest]       = useState(!!initial?.is_highest_qualification);
  const [certificate,     setCertificate]     = useState<File | null>(null);
  const [clearCert,       setClearCert]       = useState(false);

  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  /**
   * Run every field check. Mirrors `createUserEducationSchema` on the
   * server side, plus cross-field date range and grade-per-type rules
   * that the Zod schema doesn't enforce.
   */
  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    const r1 = validateRequired(educationLevelId, 'Education level');
    if (!r1.ok) errs.educationLevelId = r1.msg;
    const r2 = validateRequired(institutionName, 'Institution name');
    if (!r2.ok) errs.institutionName = r2.msg;
    // Phase 43.9 — `validateText` rejects pure-special-char garbage
    // ("@#$%^", "$%^&*"), enforces min length, and caps max length.
    // Order matters: required first, then content/shape.
    const r3 = validateText(institutionName, { label: 'Institution name', minLen: 2, maxLen: 500 });
    if (!r3.ok && !errs.institutionName) errs.institutionName = r3.msg;
    const r4 = validateText(board, { label: 'Board / University', minLen: 2, maxLen: 500 });
    if (!r4.ok) errs.board = r4.msg;
    const r5 = validateText(fieldOfStudy, { label: 'Field of study', minLen: 2, maxLen: 500 });
    if (!r5.ok) errs.fieldOfStudy = r5.msg;
    const r6 = validateText(specialization, { label: 'Specialization', minLen: 2, maxLen: 500 });
    if (!r6.ok) errs.specialization = r6.msg;
    const gradeR = validateGrade(grade, gradeType || null);
    if (!gradeR.ok) errs.grade = gradeR.msg;
    const sd = validateDate(startDate, { label: 'Start date', notFuture: true });
    if (!sd.ok) errs.startDate = sd.msg;
    if (!currentlyStudying) {
      const ed = validateDate(endDate, { label: 'End date', notFuture: true });
      if (!ed.ok) errs.endDate = ed.msg;
      const range = validateDateRange(startDate, endDate);
      if (!range.ok) errs.endDate = range.msg;
    }
    const cert = validateFile(certificate, { maxMB: 10, accept: ['image/', 'application/pdf'] });
    if (!cert.ok) errs.certificate = cert.msg;
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
        education_level_id:       Number(educationLevelId),
        institution_name:         institutionName.trim(),
        board_or_university:      board || null,
        field_of_study:           fieldOfStudy || null,
        specialization:           specialization || null,
        grade_or_percentage:      grade || null,
        grade_type:               gradeType || null,
        start_date:               startDate || null,
        end_date:                 currentlyStudying ? null : (endDate || null),
        is_currently_studying:    currentlyStudying,
        is_highest_qualification: isHighest,
        // If the user clicked "Remove" on an existing cert and didn't pick a
        // new one, send null so the server clears the column.
        ...(clearCert && !certificate ? { certificate_url: null } : {}),
      }, certificate);
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

      <Group title="Programme">
        <Grid>
          <Field label="Education level" required>
            <SearchableSelect<EducationLevel>
              value={educationLevelId}
              onChange={(v) => { setEducationLevelId(v); setFieldErrors((p) => ({ ...p, educationLevelId: undefined })); }}
              options={levels}
              getValue={(l) => String(l.id)}
              getLabel={(l) => l.abbreviation ? `${l.abbreviation} · ${l.name}` : l.name}
              getSublabel={(l) => l.level_category || null}
              placeholder={loadingLevels ? 'Loading levels…' : 'Select level (e.g. B.Tech, M.Sc, PhD)'}
              searchPlaceholder="Search levels…"
              disabled={loadingLevels}
              loading={loadingLevels}
            />
            <FieldError message={fieldErrors.educationLevelId} />
          </Field>
          <Field label="Institution name" required>
            <input
              className={cn(inputCls, fieldErrors.institutionName && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Anna University"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              onBlur={blurValidate}
              maxLength={500}
              aria-invalid={!!fieldErrors.institutionName}
            />
            <FieldError message={fieldErrors.institutionName} />
          </Field>
          <Field label="Board / University">
            <input
              className={cn(inputCls, fieldErrors.board && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. CBSE, AICTE, Anna University"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              onBlur={blurValidate}
              maxLength={500}
              aria-invalid={!!fieldErrors.board}
            />
            <FieldError message={fieldErrors.board} />
          </Field>
        </Grid>
      </Group>

      <Group title="Subject">
        <Grid>
          <Field label="Field of study">
            <input
              className={cn(inputCls, fieldErrors.fieldOfStudy && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Computer Science"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              onBlur={blurValidate}
              maxLength={500}
              aria-invalid={!!fieldErrors.fieldOfStudy}
            />
            <FieldError message={fieldErrors.fieldOfStudy} />
          </Field>
          <Field label="Specialization">
            <input
              className={cn(inputCls, fieldErrors.specialization && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Artificial Intelligence (optional)"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              onBlur={blurValidate}
              maxLength={500}
              aria-invalid={!!fieldErrors.specialization}
            />
            <FieldError message={fieldErrors.specialization} />
          </Field>
        </Grid>
      </Group>

      <Group title="Timeline">
        <Grid>
          <Field label="Start date">
            <input
              type="date"
              className={cn(inputCls, fieldErrors.startDate && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              value={startDate ?? ''}
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
                currentlyStudying && 'bg-slate-50 text-slate-400',
                fieldErrors.endDate && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400',
              )}
              value={currentlyStudying ? '' : (endDate ?? '')}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={blurValidate}
              disabled={currentlyStudying}
              max={new Date().toISOString().slice(0, 10)}
              min={startDate || undefined}
              aria-invalid={!!fieldErrors.endDate}
            />
            <FieldError message={fieldErrors.endDate} />
          </Field>
        </Grid>
        <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-slate-700">
          <Check label="Currently studying" checked={currentlyStudying} onChange={(v) => {
            setCurrentlyStudying(v);
            // When toggling ON, also clear the local endDate state so a
            // subsequent submit cannot accidentally ship a stale value
            // (the Server enforces the invariant too, but cleaning up
            // the local state keeps the UI honest if the user toggles
            // back OFF later).
            if (v) setEndDate('');
            setFieldErrors((p) => ({ ...p, endDate: undefined }));
          }} />
          <Check label="Highest qualification" checked={isHighest} onChange={setIsHighest} />
        </div>
      </Group>

      <Group title="Grade">
        <Grid>
          <Field label="Grade or percentage">
            <input
              className={cn(inputCls, fieldErrors.grade && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. 8.4 or 92"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              onBlur={blurValidate}
              maxLength={100}
              aria-invalid={!!fieldErrors.grade}
            />
            <FieldError message={fieldErrors.grade} />
          </Field>
          <Field label="Grade type">
            <select
              className={inputCls}
              value={gradeType}
              onChange={(e) => { setGradeType((e.target.value || '') as GradeType | ''); setFieldErrors((p) => ({ ...p, grade: undefined })); }}
            >
              <option value="">— select —</option>
              {GRADE_TYPES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </Field>
        </Grid>
      </Group>

      <Group title="Certificate">
        <CertificateField
          existingUrl={initial?.certificate_url ?? null}
          file={certificate}
          onFile={(f) => { setCertificate(f); setFieldErrors((p) => ({ ...p, certificate: undefined })); }}
          cleared={clearCert}
          onClear={() => { setClearCert(true); setCertificate(null); }}
        />
        <FieldError message={fieldErrors.certificate} />
      </Group>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-full"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void commit()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[12.5px] font-bold shadow-btn disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {initial ? 'Save changes' : 'Add education'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Bits

function CertificateField({
  existingUrl, file, onFile, cleared, onClear,
}: {
  existingUrl: string | null;
  file: File | null;
  onFile: (f: File | null) => void;
  cleared: boolean;
  onClear: () => void;
}) {
  const showExisting = !!existingUrl && !cleared && !file;
  return (
    <div>
      {showExisting && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12.5px]">
          <FileText className="h-3.5 w-3.5 text-slate-500" />
          <a href={existingUrl} target="_blank" rel="noreferrer noopener" className="flex-1 text-brand-700 hover:underline truncate">
            View existing certificate
          </a>
          <button type="button" onClick={onClear} className="text-rose-500 hover:bg-rose-50 rounded-md p-1" aria-label="Remove">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {file ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px]">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="flex-1 text-emerald-700 truncate">{file.name}</span>
          <button type="button" onClick={() => onFile(null)} className="text-rose-500 hover:bg-rose-100 rounded-md p-1" aria-label="Remove">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-200 hover:border-brand-300 bg-white px-3 py-4 text-[12.5px] text-slate-500 cursor-pointer">
          <GraduationCap className="h-4 w-4 text-slate-400" />
          {showExisting ? 'Replace certificate (image or PDF)' : 'Click to attach certificate (image or PDF, optional)'}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );
}

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
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded accent-brand-500" />
      {label}
    </label>
  );
}
function formatDate(iso: string): string {
  // YYYY-MM-DD → MMM YYYY (e.g. Aug 2018)
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mi = parseInt(m[2], 10) - 1;
  return `${months[mi] ?? ''} ${m[1]}`.trim();
}
function gradeTypeShort(t: GradeType): string {
  switch (t) {
    case 'percentage': return '%';
    case 'cgpa': return 'CGPA';
    case 'gpa':  return 'GPA';
    case 'grade': return 'grade';
    case 'pass_fail': return 'P/F';
    default: return '';
  }
}
const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
