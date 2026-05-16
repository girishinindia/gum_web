'use client';

import { useState } from 'react';
import {
  Plus, Save, Trash2, Pencil, Loader2, AlertCircle, FolderGit2,
  ExternalLink, Github,
} from 'lucide-react';
import {
  addProject, updateProject, deleteProject,
  type UserProject, type ProjectType, type ProjectStatus,
} from '@/lib/users/client';
import { FieldError } from '@/components/ui/FieldError';
import {
  validateRequired, validateMaxLen, validateNumberRange,
  validateUrl, validateDate, validateDateRange,
} from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * Projects list + inline expander form.
 *
 * Trimmed-down field set after profile-v4 feedback — we drop the
 * Recognition / References / extra-links / lessons-learned / impact-
 * summary / users-served fields because they were noise for most users.
 * The remaining ~21 fields are grouped into 4 labelled sub-sections:
 *
 *   Basics      — title, type, status, role, team_size, organization,
 *                 client, industry, is_solo_project
 *   Tech stack  — technologies, languages, frameworks, databases, tools, platform
 *   Timeline    — start_date, end_date, is_ongoing, duration_months
 *   Detail      — description, objectives, responsibilities, key_achievements, challenges_faced
 *   Links       — project_url, repository_url (the essentials)
 *
 * The dropped server columns still exist on the row; we just don't
 * expose them in the form. PATCH ignores unspecified keys.
 */

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'personal',     label: 'Personal' },
  { value: 'academic',     label: 'Academic' },
  { value: 'professional', label: 'Professional' },
  { value: 'freelance',    label: 'Freelance' },
  { value: 'open_source',  label: 'Open source' },
  { value: 'research',     label: 'Research' },
  { value: 'hackathon',    label: 'Hackathon' },
  { value: 'internship',   label: 'Internship' },
  { value: 'client',       label: 'Client' },
  { value: 'government',   label: 'Government' },
  { value: 'ngo',          label: 'NGO' },
  { value: 'other',        label: 'Other' },
];

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'planning',    label: 'Planning' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'on_hold',     label: 'On hold' },
  { value: 'cancelled',   label: 'Cancelled' },
  { value: 'abandoned',   label: 'Abandoned' },
];

export function ProjectsList({
  rows, onAdded, onUpdated, onRemoved,
}: {
  rows:      UserProject[];
  onAdded:   (row: UserProject) => void;
  onUpdated: (row: UserProject) => void;
  onRemoved: (id: number) => void;
}) {
  const [mode, setMode] = useState<{ kind: 'idle' } | { kind: 'add' } | { kind: 'edit'; row: UserProject }>({ kind: 'idle' });
  const [error, setError] = useState<string | null>(null);

  async function handleSave(
    payload: Parameters<typeof addProject>[0],
    editingId: number | null,
  ) {
    setError(null);
    try {
      if (editingId == null) {
        const created = await addProject(payload);
        onAdded(created);
      } else {
        const updated = await updateProject(editingId, payload);
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
      await deleteProject(id);
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
        <div className="text-sm text-slate-500 mb-3">No projects added yet.</div>
      )}

      <ul className="space-y-2">
        {rows.map((r) => {
          const editing = mode.kind === 'edit' && mode.row.id === r.id;
          return (
            <li key={r.id} className="rounded-md border border-slate-200 bg-slate-50/60">
              <div className="flex items-start gap-3 px-3 py-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  <FolderGit2 className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-semibold text-slate-900 truncate">{r.project_title}</div>
                    {r.project_status && r.project_status !== 'completed' && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-bold capitalize">
                        {r.project_status.replace('_', ' ')}
                      </span>
                    )}
                    {r.project_type && (
                      <span className="inline-flex items-center rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 text-[10px] font-bold capitalize">
                        {r.project_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <div className="text-[12.5px] text-slate-600 mt-0.5 line-clamp-2">{r.description}</div>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px]">
                    {r.project_url && (
                      <a href={r.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                        <ExternalLink className="h-3 w-3" /> Live
                      </a>
                    )}
                    {r.repository_url && (
                      <a href={r.repository_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-700 hover:text-brand-700">
                        <Github className="h-3 w-3" /> Repo
                      </a>
                    )}
                    {r.technologies_used && r.technologies_used.split(/,\s*/).filter(Boolean).slice(0, 6).map((t: string) => (
                      <span key={t} className="rounded-full bg-white border border-slate-200 text-slate-700 px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
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
                  <ProjectForm
                    initial={mode.row}
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
            <ProjectForm
              initial={null}
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
            <Plus className="h-3.5 w-3.5" /> Add project
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ProjectForm — controlled form covering ~28 user-facing fields.

function ProjectForm({
  initial, onCancel, onSave,
}: {
  initial: UserProject | null;
  onCancel: () => void;
  onSave: (payload: Parameters<typeof addProject>[0]) => Promise<void>;
}) {
  // Basics
  const [title,         setTitle]         = useState(initial?.project_title ?? '');
  const [projectType,   setProjectType]   = useState<ProjectType>(initial?.project_type ?? 'personal');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(initial?.project_status ?? 'completed');
  const [role,          setRole]          = useState(initial?.role_in_project ?? '');
  const [teamSize,      setTeamSize]      = useState<string>(initial?.team_size != null ? String(initial.team_size) : '');
  const [isSolo,        setIsSolo]        = useState(!!initial?.is_solo_project);
  const [organization,  setOrganization]  = useState(initial?.organization_name ?? '');
  const [clientName,    setClientName]    = useState(initial?.client_name ?? '');
  const [industry,      setIndustry]      = useState(initial?.industry ?? '');
  // Tech stack
  const [technologies,  setTechnologies]  = useState(initial?.technologies_used ?? '');
  const [tools,         setTools]         = useState(initial?.tools_used ?? '');
  const [languages,     setLanguages]     = useState(initial?.programming_languages ?? '');
  const [frameworks,    setFrameworks]    = useState(initial?.frameworks ?? '');
  const [databases,     setDatabases]     = useState(initial?.databases_used ?? '');
  const [platform,      setPlatform]      = useState(initial?.platform ?? '');
  // Timeline
  const [startDate,     setStartDate]     = useState(initial?.start_date ?? '');
  const [endDate,       setEndDate]       = useState(initial?.end_date ?? '');
  const [isOngoing,     setIsOngoing]     = useState(!!initial?.is_ongoing);
  const [durationMonths, setDurationMonths] = useState<string>(initial?.duration_months != null ? String(initial.duration_months) : '');
  // Detail
  const [description,      setDescription]      = useState(initial?.description ?? '');
  const [objectives,       setObjectives]       = useState(initial?.objectives ?? '');
  const [responsibilities, setResponsibilities] = useState(initial?.responsibilities ?? '');
  const [achievements,     setAchievements]     = useState(initial?.key_achievements ?? '');
  const [challenges,       setChallenges]       = useState(initial?.challenges_faced ?? '');
  // Links (just the essentials)
  const [projectUrl,       setProjectUrl]       = useState(initial?.project_url ?? '');
  const [repoUrl,          setRepoUrl]          = useState(initial?.repository_url ?? '');

  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    const t1 = validateRequired(title, 'Project title');
    if (!t1.ok) errs.title = t1.msg;
    const t2 = validateMaxLen(title, 500, 'Project title');
    if (!t2.ok) errs.title = t2.msg;
    const cap = (v: string, key: string, max: number, label: string) => {
      const r = validateMaxLen(v, max, label);
      if (!r.ok) errs[key] = r.msg;
    };
    cap(role,             'role',             300,  'Role in project');
    cap(organization,     'organization',     500,  'Organization');
    cap(clientName,       'clientName',       500,  'Client');
    cap(industry,         'industry',         300,  'Industry');
    cap(technologies,     'technologies',     2000, 'Technologies used');
    cap(tools,            'tools',            2000, 'Tools used');
    cap(languages,        'languages',        1000, 'Programming languages');
    cap(frameworks,       'frameworks',       1000, 'Frameworks');
    cap(databases,        'databases',        500,  'Databases');
    cap(platform,         'platform',         200,  'Platform');
    cap(description,      'description',      5000, 'Description');
    cap(objectives,       'objectives',       3000, 'Objectives');
    cap(responsibilities, 'responsibilities', 5000, 'Responsibilities');
    cap(achievements,     'achievements',     5000, 'Key achievements');
    cap(challenges,       'challenges',       5000, 'Challenges faced');
    const tsR = validateNumberRange(teamSize, 1, 10000, 'Team size', { integer: true });
    if (!tsR.ok) errs.teamSize = tsR.msg;
    const dmR = validateNumberRange(durationMonths, 0, 600, 'Duration', { integer: true });
    if (!dmR.ok) errs.durationMonths = dmR.msg;
    const u1 = validateUrl(projectUrl, 'Project URL');
    if (!u1.ok) errs.projectUrl = u1.msg;
    const u2 = validateUrl(repoUrl, 'Repository URL');
    if (!u2.ok) errs.repoUrl = u2.msg;
    const sd = validateDate(startDate, { label: 'Start date', notFuture: true });
    if (!sd.ok) errs.startDate = sd.msg;
    if (!isOngoing) {
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
        project_title:         title.trim(),
        project_type:          projectType,
        project_status:        projectStatus,
        role_in_project:       role || null,
        team_size:             teamSize ? Number(teamSize) : null,
        is_solo_project:       isSolo,
        organization_name:     organization || null,
        client_name:           clientName || null,
        industry:              industry || null,
        technologies_used:     technologies || null,
        tools_used:            tools || null,
        programming_languages: languages || null,
        frameworks:            frameworks || null,
        databases_used:        databases || null,
        platform:              platform || null,
        start_date:            startDate || null,
        end_date:              isOngoing ? null : (endDate || null),
        is_ongoing:            isOngoing,
        duration_months:       durationMonths ? Number(durationMonths) : null,
        description:           description || null,
        objectives:            objectives || null,
        responsibilities:      responsibilities || null,
        key_achievements:      achievements || null,
        challenges_faced:      challenges || null,
        project_url:           projectUrl || null,
        repository_url:        repoUrl || null,
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

      <Group title="Basics">
        <Grid>
          <Field label="Project title" required full>
            <input
              className={cn(inputCls, fieldErrors.title && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="e.g. Course recommender"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={blurValidate}
              maxLength={500}
              aria-invalid={!!fieldErrors.title}
            />
            <FieldError message={fieldErrors.title} />
          </Field>
          <Field label="Type">
            <select className={inputCls} value={projectType} onChange={(e) => setProjectType(e.target.value as ProjectType)}>
              {PROJECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputCls} value={projectStatus} onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}>
              {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Your role">
            <input className={inputCls} placeholder="e.g. Lead engineer" value={role} onChange={(e) => setRole(e.target.value)} />
          </Field>
          <Field label="Team size">
            <input
              type="number"
              min={1}
              max={10000}
              className={cn(inputCls, fieldErrors.teamSize && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              onBlur={blurValidate}
              aria-invalid={!!fieldErrors.teamSize}
            />
            <FieldError message={fieldErrors.teamSize} />
          </Field>
          <Field label="Organization">
            <input className={inputCls} placeholder="e.g. Flipkart" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          </Field>
          <Field label="Client / sponsor">
            <input className={inputCls} placeholder="e.g. Acme Inc" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </Field>
          <Field label="Industry">
            <input className={inputCls} placeholder="e.g. EdTech" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </Field>
        </Grid>
        <label className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-slate-700 cursor-pointer">
          <input type="checkbox" checked={isSolo} onChange={(e) => setIsSolo(e.target.checked)} className="rounded accent-brand-500" />
          Solo project
        </label>
      </Group>

      <Group title="Tech stack">
        <Grid>
          <Field label="Technologies used">
            <input className={inputCls} placeholder="Comma-separated · e.g. React, FastAPI" value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
          </Field>
          <Field label="Programming languages">
            <input className={inputCls} placeholder="e.g. TypeScript, Python" value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </Field>
          <Field label="Frameworks">
            <input className={inputCls} placeholder="e.g. Next.js, Express" value={frameworks} onChange={(e) => setFrameworks(e.target.value)} />
          </Field>
          <Field label="Databases">
            <input className={inputCls} placeholder="e.g. Postgres, Redis" value={databases} onChange={(e) => setDatabases(e.target.value)} />
          </Field>
          <Field label="Tools">
            <input className={inputCls} placeholder="e.g. Docker, GitHub Actions" value={tools} onChange={(e) => setTools(e.target.value)} />
          </Field>
          <Field label="Platform">
            <input className={inputCls} placeholder="e.g. Web, iOS, Android" value={platform} onChange={(e) => setPlatform(e.target.value)} />
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
                isOngoing && 'bg-slate-50 text-slate-400',
                fieldErrors.endDate && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400',
              )}
              value={isOngoing ? '' : (endDate ?? '')}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={blurValidate}
              disabled={isOngoing}
              max={new Date().toISOString().slice(0, 10)}
              min={startDate || undefined}
              aria-invalid={!!fieldErrors.endDate}
            />
            <FieldError message={fieldErrors.endDate} />
          </Field>
          <Field label="Duration (months)">
            <input
              type="number"
              min={0}
              max={600}
              className={cn(inputCls, fieldErrors.durationMonths && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              onBlur={blurValidate}
              aria-invalid={!!fieldErrors.durationMonths}
            />
            <FieldError message={fieldErrors.durationMonths} />
          </Field>
        </Grid>
        <label className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-slate-700 cursor-pointer">
          <input type="checkbox" checked={isOngoing} onChange={(e) => {
            const next = e.target.checked;
            setIsOngoing(next);
            // Phase 38.1 — clear endDate state on toggle ON so a later
            // submit cannot ship a stale value (server + DB enforce
            // the invariant too).
            if (next) setEndDate('');
            setFieldErrors((p) => ({ ...p, endDate: undefined }));
          }} className="rounded accent-brand-500" />
          Still in progress
        </label>
      </Group>

      <Group title="Detail">
        <div className="space-y-2">
          <Field label="Description">
            <textarea rows={3} className={cn(inputCls, 'min-h-[80px] resize-y')} placeholder="What is the project, in 2-3 sentences?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Objectives">
            <textarea rows={2} className={cn(inputCls, 'min-h-[60px] resize-y')} placeholder="What were you trying to achieve?" value={objectives} onChange={(e) => setObjectives(e.target.value)} />
          </Field>
          <Field label="Your responsibilities">
            <textarea rows={2} className={cn(inputCls, 'min-h-[60px] resize-y')} placeholder="What did you own?" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
          </Field>
          <Field label="Key achievements">
            <textarea rows={2} className={cn(inputCls, 'min-h-[60px] resize-y')} placeholder="Outcomes, metrics, recognition…" value={achievements} onChange={(e) => setAchievements(e.target.value)} />
          </Field>
          <Field label="Challenges faced">
            <textarea rows={2} className={cn(inputCls, 'min-h-[60px] resize-y')} value={challenges} onChange={(e) => setChallenges(e.target.value)} />
          </Field>
        </div>
      </Group>

      <Group title="Links">
        <Grid>
          <Field label="Project URL">
            <input
              className={cn(inputCls, fieldErrors.projectUrl && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="https://…"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              onBlur={blurValidate}
              maxLength={1000}
              aria-invalid={!!fieldErrors.projectUrl}
              inputMode="url"
            />
            <FieldError message={fieldErrors.projectUrl} />
          </Field>
          <Field label="Repository URL">
            <input
              className={cn(inputCls, fieldErrors.repoUrl && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="https://github.com/…"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onBlur={blurValidate}
              maxLength={1000}
              aria-invalid={!!fieldErrors.repoUrl}
              inputMode="url"
            />
            <FieldError message={fieldErrors.repoUrl} />
          </Field>
        </Grid>
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
          {initial ? 'Save changes' : 'Add project'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
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
function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={cn('block', full && 'sm:col-span-2')}>
      <div className="text-[11.5px] font-semibold text-slate-700 mb-1">
        {label}{required && <span className="text-rose-500"> *</span>}
      </div>
      {children}
    </label>
  );
}
const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
