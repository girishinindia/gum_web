'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, GraduationCap, Users, BookOpen, Star } from 'lucide-react';
import {
  getInstructorProfile, updateInstructorProfile,
  type InstructorProfile,
} from '@/lib/users/client';
import { FieldError } from '@/components/ui/FieldError';
import { validateMaxLen, validateNumberRange } from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * Instructor bio card — single editable card mapped to
 * `instructor_profiles` (the Phase 13.4 trimmed-down 28-column table).
 *
 * Editable fields (instructor controls):
 *   • expertise — free-text headline-style summary
 *   • teaching_languages — comma-separated
 *   • years_teaching — integer
 *
 * Read-only computed stats (server-populated, refreshed by cron):
 *   • total_students
 *   • total_courses
 *   • average_rating
 *   • is_verified / is_featured (admin-controlled — shown as badges)
 *
 * Loads lazily on mount (instructor table is only queried for users
 * with role≥60 — the parent page gates the section visibility).
 */
export function InstructorBioCard() {
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [expertise,         setExpertise]   = useState('');
  const [teachingLanguages, setTeaching]    = useState('');
  const [yearsTeaching,     setYears]       = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getInstructorProfile();
        if (cancelled) return;
        setProfile(p);
        setExpertise(p.expertise ?? '');
        setTeaching(p.teaching_languages ?? '');
        setYears(p.years_teaching ?? '');
      } catch (e) {
        if (!cancelled) {
          // 404 is expected the first time — the API auto-creates the
          // row on first PUT, so we just show the empty form.
          setError(e instanceof Error && /404/.test(e.message)
            ? null
            : (e instanceof Error ? e.message : 'Could not load instructor profile.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    const ex = validateMaxLen(expertise, 300, 'Headline');
    if (!ex.ok) errs.expertise = ex.msg;
    const tl = validateMaxLen(teachingLanguages, 500, 'Teaching languages');
    if (!tl.ok) errs.teachingLanguages = tl.msg;
    const yr = validateNumberRange(yearsTeaching, 0, 60, 'Years teaching', { integer: true });
    if (!yr.ok) errs.yearsTeaching = yr.msg;
    return errs;
  }

  function blurValidate() {
    setFieldErrors(runValidation());
  }

  async function save() {
    const errs = runValidation();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const next = await updateInstructorProfile({
        expertise:           expertise || null,
        teaching_languages:  teachingLanguages || null,
        years_teaching:      yearsTeaching === '' ? null : Number(yearsTeaching),
      });
      setProfile(next);
      setSaved(true); setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading instructor profile…
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-[12.5px] text-emerald-700">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> Saved.
        </div>
      )}

      {/* Read-only computed stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat icon={Users}    label="Students" value={profile?.total_students ?? 0} />
        <Stat icon={BookOpen} label="Courses"  value={profile?.total_courses ?? 0} />
        <Stat icon={Star}     label="Rating"   value={profile?.average_rating?.toFixed(1) ?? '—'} />
      </div>
      {(profile?.is_verified || profile?.is_featured) && (
        <div className="flex gap-2 mb-3">
          {profile.is_verified && <Badge label="Verified" tone="emerald" />}
          {profile.is_featured && <Badge label="Featured" tone="amber" />}
        </div>
      )}

      <div className="space-y-3">
        <Field label="Expertise / headline">
          <input
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            onBlur={blurValidate}
            maxLength={300}
            aria-invalid={!!fieldErrors.expertise}
            placeholder="e.g. AI / ML · Deep learning · 10y industry"
            className={cn(inputCls, fieldErrors.expertise && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
          />
          <FieldError message={fieldErrors.expertise} />
        </Field>
        <Field label="Teaching languages">
          <input
            value={teachingLanguages}
            onChange={(e) => setTeaching(e.target.value)}
            onBlur={blurValidate}
            maxLength={500}
            aria-invalid={!!fieldErrors.teachingLanguages}
            placeholder="Comma-separated (e.g. English, Hindi)"
            className={cn(inputCls, fieldErrors.teachingLanguages && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
          />
          <FieldError message={fieldErrors.teachingLanguages} />
        </Field>
        <Field label="Years teaching">
          <input
            type="number"
            min={0}
            max={60}
            value={yearsTeaching}
            onChange={(e) => setYears(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={blurValidate}
            aria-invalid={!!fieldErrors.yearsTeaching}
            className={cn(inputCls, fieldErrors.yearsTeaching && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
          />
          <FieldError message={fieldErrors.yearsTeaching} />
        </Field>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[13px] font-bold shadow-btn disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? 'Saved' : 'Save instructor profile'}
        </button>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-white border border-slate-200 p-3 text-center">
      <Icon className="h-4 w-4 text-brand-600 mx-auto" />
      <div className="mt-1 heading text-xl text-slate-900">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
    </div>
  );
}
function Badge({ label, tone }: { label: string; tone: 'emerald' | 'amber' }) {
  const cls = tone === 'emerald'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-amber-50 border-amber-200 text-amber-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold ${cls}`}>
      <GraduationCap className="h-3 w-3" /> {label}
    </span>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.5px] font-semibold text-slate-700 mb-1">{label}</div>
      {children}
    </label>
  );
}
const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
