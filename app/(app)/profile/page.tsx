'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Camera, Save, GraduationCap, Sparkles, Award,
  Loader2, AlertCircle, Plus, Trash2, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getMyProfile, updateMyProfile, updateMyProfileWithImages, updateMe,
  listEducation,
  listSkills,
  listLanguages,
  listExperience,
  listProjects,
  listSocialMedias,
  listDocuments,
  listBadges,
  type UserProfile, type UserEducation, type UserSkill, type UserLanguage,
  type UserExperience, type UserProject, type UserSocialMedia, type UserDocument,
  type UserBadge,
} from '@/lib/users/client';
import {
  buildSectionList, roleLabel, hasFullEditor, type SectionMeta,
} from '@/lib/users/profile-sections';
// New section components — extracted to avoid bloating this file past
// 1 000 lines. Each one owns its own loading / save / error state.
import { SkillsChipEditor }   from '@/components/profile/SkillsChipEditor';
import { ContactCard }        from '@/components/profile/ContactCard';
import { AddressFields }      from '@/components/profile/AddressFields';
import { EducationList }      from '@/components/profile/EducationList';
import { DocumentsList }      from '@/components/profile/DocumentsList';
import { LanguagesEditor }    from '@/components/profile/LanguagesEditor';
import { SocialMediaList }    from '@/components/profile/SocialMediaList';
import { ExperienceList }     from '@/components/profile/ExperienceList';
import { ProjectsList }       from '@/components/profile/ProjectsList';
import { InstructorBioCard }  from '@/components/profile/InstructorBioCard';
import { KycBankCard }        from '@/components/profile/KycBankCard';
import { FieldError }         from '@/components/ui/FieldError';
import { ImageEditorModal }   from '@/components/profile/ImageEditorModal';
import { validateMaxLen, validateAge, validateRequired } from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * Edit-profile page — single client component (intentionally), pulling
 * real data from `/user-profiles/me`, `/user-education`, `/user-skills`,
 * `/user-badges`, etc.
 *
 * Section visibility is driven by the user's `max_role_level`:
 *   • student   (level 20)  → Basic, Contact, Address, Education,
 *                              Skills, Languages, Social, Badges, Security
 *   • instructor (level 60) → above PLUS Experience, Projects,
 *                              Instructor bio, KYC + Bank, Documents
 *   • admin     (level 80)  → trimmed to Basic, Contact, Address,
 *                              Security, Admin shortcut
 *
 * Implementation notes
 * — kept as ONE file so the data-flow is obvious; sub-cards are local
 *   functions. We can split into `components/profile/sections/*` later
 *   if any single card grows past ~80 lines.
 * — Auth-gated by `(app)/layout.tsx` (RequireAuth) so we can assume
 *   `user` is non-null once `loading === false`.
 * — Every mutation is optimistic-update-friendly: the on-disk row is
 *   refetched after successful PUT/POST/DELETE so the UI always shows
 *   what the server saved.
 */
export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const roleLevel = user?.max_role_level ?? 20; // default to student

  // Visible section list — drives both the left-rail nav and the body.
  // Tuned by role: instructors get the income-related cards, admins
  // see only the bits they actually need.
  const sections = useMemo(() => buildSectionList(roleLevel), [roleLevel]);

  // ── Active tab state ───────────────────────────────────────────────
  // Profile-v5: each rail item is a tab — only the active section
  // renders below the IdentityCard. State syncs to `window.location.hash`
  // so deep links (`/profile#experience`) and the browser back-button
  // both restore the right section. Unknown / role-gated hashes fall
  // back to the first allowed section ('basic').
  const [active, setActive] = useState<string>('basic');
  useEffect(() => {
    if (sections.length === 0) return;
    const allowed = new Set(sections.map((s) => s.id));
    const fromHash = (typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '');
    setActive(allowed.has(fromHash) ? fromHash : sections[0].id);
    // Track back/forward navigation so the page re-renders the right tab.
    function onHashChange() {
      const next = window.location.hash.replace(/^#/, '');
      setActive(allowed.has(next) ? next : sections[0].id);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [sections]);

  function selectSection(id: string) {
    if (id === active) return;
    setActive(id);
    if (typeof window !== 'undefined') {
      // `replaceState` would silently swap — we want pushState so the
      // back button restores the previous tab.
      window.history.pushState(null, '', `#${id}`);
    }
  }

  // ── Data state ─────────────────────────────────────────────────────
  // One slice per `/user-*` collection. Sections that don't render for
  // the active role simply leave their slice as the default [] — the
  // unused fetches are cheap so we don't bother gating them.
  const [profile,    setProfile]    = useState<UserProfile | null>(null);
  const [education,  setEducation]  = useState<UserEducation[]>([]);
  const [skills,     setSkills]     = useState<UserSkill[]>([]);
  const [languages,  setLanguages]  = useState<UserLanguage[]>([]);
  const [experience, setExperience] = useState<UserExperience[]>([]);
  const [projects,   setProjects]   = useState<UserProject[]>([]);
  const [social,     setSocial]     = useState<UserSocialMedia[]>([]);
  const [documents,  setDocuments]  = useState<UserDocument[]>([]);
  const [badges,     setBadges]     = useState<UserBadge[]>([]);
  const [hydrating, setHydrating] = useState(true);
  const [hydrateError, setHydrateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fan out reads in parallel — independent routes, single round-
        // trip wait. Failures of individual sub-resources don't break
        // the page; the section just renders empty.
        const [p, ed, sk, ln, ex, pr, sm, dc, bg] = await Promise.allSettled([
          getMyProfile(),
          listEducation(),
          listSkills(),
          listLanguages(),
          listExperience(),
          listProjects(),
          listSocialMedias(),
          listDocuments(),
          listBadges(),
        ]);
        if (cancelled) return;
        if (p.status  === 'fulfilled') setProfile(p.value);
        if (ed.status === 'fulfilled') setEducation(ed.value);
        if (sk.status === 'fulfilled') setSkills(sk.value);
        if (ln.status === 'fulfilled') setLanguages(ln.value);
        if (ex.status === 'fulfilled') setExperience(ex.value);
        if (pr.status === 'fulfilled') setProjects(pr.value);
        if (sm.status === 'fulfilled') setSocial(sm.value);
        if (dc.status === 'fulfilled') setDocuments(dc.value);
        if (bg.status === 'fulfilled') setBadges(bg.value);
        // Surface a hydrate error only if the *primary* profile fetch
        // failed — sub-resources we let silently default to empty.
        if (p.status === 'rejected') {
          setHydrateError('Could not load your profile. Try refreshing.');
        }
      } catch (e) {
        if (!cancelled) setHydrateError('Could not load your profile.');
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }
    if (!authLoading && user) void load();
    return () => { cancelled = true; };
  }, [authLoading, user]);

  if (authLoading || hydrating) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your profile…
        </div>
      </div>
    );
  }

  if (!user) {
    // RequireAuth in the layout should have bounced us already; this
    // is a defensive fallback.
    return null;
  }

  const displayName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    || user.email?.split('@')[0]
    || 'User';
  const headline = profile?.headline?.trim() || roleLabel(roleLevel);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Eyebrow>Your profile</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">
        {displayName} <span className="text-gradient">· {roleLabel(roleLevel)}</span>
      </h1>

      {hydrateError && (
        <div className="mt-5 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {hydrateError}
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-[220px_1fr] gap-6">
        {/* ── Left-rail nav — generated from `sections` so anchors
            always match what's rendered (the old static list had dead
            anchors for sections that didn't exist in the DOM). */}
        <aside className="rounded-md bg-white border border-slate-200 shadow-card p-2 lg:sticky lg:top-24 self-start">
          {sections.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSection(s.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full text-left flex items-center gap-2 px-3 py-2 rounded-sm text-sm transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-700 hover:bg-brand-50/50',
                )}
              >
                <span className="flex-1">{s.label}</span>
                {s.tinted && (
                  <span className="text-[9.5px] text-indigo-600">·</span>
                )}
              </button>
            );
          })}
        </aside>

        <div className="space-y-5">
          {/* Avatar + identity card — always visible. */}
          <IdentityCard
            displayName={displayName}
            email={user.email}
            mobile={user.mobile}
            avatarUrl={profile?.profile_image_url || user.profile_image_url || null}
            headline={headline}
            onAvatarUpdated={(next) => {
              setProfile(next);
              // Mirror new URL into AuthProvider so the header avatar
              // (which reads from AuthProvider state) refreshes too.
              if (next.profile_image_url !== undefined) {
                updateUser({ profile_image_url: next.profile_image_url ?? null });
              }
            }}
          />

          {/* ── BASIC INFO ── */}
          {active === 'basic' && (
            <BasicInfoCard
              user={user}
              profile={profile}
              onSave={async (patch) => {
                // `display_name` lives on `users`, not `user_profiles`.
                // Split the patch into two parallel calls so it actually
                // lands. Without this split the API silently swallows
                // the field (200 OK, value never persists).
                const { display_name, ...profilePatch } = patch;
                const [saved] = await Promise.all([
                  Object.keys(profilePatch).length
                    ? updateMyProfile(profilePatch)
                    : Promise.resolve(profile!),
                  display_name !== undefined
                    ? updateMe({ display_name })
                    : Promise.resolve(null),
                ]);
                setProfile(saved);
                // Mirror the new display_name into the AuthProvider's
                // cached user so navigating away and back keeps the
                // saved value visible without waiting for a refresh.
                // (After a refresh, /users/me re-reads from v_user_profile
                //  which now exposes display_name — phase28.1.)
                if (display_name !== undefined) {
                  updateUser({ display_name: (display_name as string | null) ?? null });
                }
              }}
            />
          )}

          {/* ── CONTACT ── */}
          {active === 'contact' && (
            <Card id="contact" title="Contact" icon={GraduationCap}>
              <ContactCard user={user} />
            </Card>
          )}

          {/* ── ADDRESS ── */}
          {active === 'address' && (
            <Card id="address" title="Address" icon={GraduationCap}>
              <AddressFields profile={profile} onSaved={setProfile} />
            </Card>
          )}

          {/* ── EDUCATION ── */}
          {active === 'education' && (
            <Card id="education" title="Education" icon={GraduationCap}>
              <EducationList
                rows={education}
                onAdded={(row) => setEducation((prev) => [...prev, row])}
                onUpdated={(row) =>
                  setEducation((prev) => prev.map((r) => (r.id === row.id ? row : r)))
                }
                onRemoved={(id) => setEducation((prev) => prev.filter((r) => r.id !== id))}
                onRefetch={async () => {
                  const fresh = await listEducation();
                  setEducation(fresh);
                }}
              />
            </Card>
          )}

          {/* ── EXPERIENCE (instructor + optional student) ── */}
          {active === 'experience' && (
            <Card id="experience" title="Experience" icon={GraduationCap}>
              <ExperienceList
                rows={experience}
                onAdded={(row) => setExperience((prev) => [...prev, row])}
                onUpdated={(row) =>
                  setExperience((prev) => prev.map((r) => (r.id === row.id ? row : r)))
                }
                onRemoved={(id) => setExperience((prev) => prev.filter((r) => r.id !== id))}
              />
            </Card>
          )}

          {/* ── SKILLS — master-list chip picker ── */}
          {active === 'skills' && (
            <Card id="skills" title="Skills" icon={Award}>
              <SkillsChipEditor
                rows={skills}
                onAdded={(row) => setSkills((prev) => [...prev, row])}
                onUpdated={(row) =>
                  setSkills((prev) => prev.map((r) => (r.id === row.id ? row : r)))
                }
                onRemoved={(id) => setSkills((prev) => prev.filter((r) => r.id !== id))}
              />
            </Card>
          )}

          {/* ── LANGUAGES ── */}
          {active === 'languages' && (
            <Card id="languages" title="Languages" icon={GraduationCap}>
              <LanguagesEditor
                rows={languages}
                onAdded={(row) => setLanguages((prev) => [...prev, row])}
                onUpdated={(row) =>
                  setLanguages((prev) => prev.map((r) => (r.id === row.id ? row : r)))
                }
                onRemoved={(id) => setLanguages((prev) => prev.filter((r) => r.id !== id))}
              />
            </Card>
          )}

          {/* ── PROJECTS (instructor + optional student) ── */}
          {active === 'projects' && (
            <Card id="projects" title="Projects" icon={GraduationCap}>
              <ProjectsList
                rows={projects}
                onAdded={(row) => setProjects((prev) => [...prev, row])}
                onUpdated={(row) =>
                  setProjects((prev) => prev.map((r) => (r.id === row.id ? row : r)))
                }
                onRemoved={(id) => setProjects((prev) => prev.filter((r) => r.id !== id))}
              />
            </Card>
          )}

          {/* ── SOCIAL ── */}
          {active === 'social' && (
            <Card id="social" title="Social profiles" icon={GraduationCap}>
              <SocialMediaList
                rows={social}
                onAdded={(row) => setSocial((prev) => [...prev, row])}
                onRemoved={(id) => setSocial((prev) => prev.filter((r) => r.id !== id))}
              />
            </Card>
          )}

          {/* ── DOCUMENTS — Aadhaar, PAN, certificates etc. ── */}
          {active === 'documents' && (
            <Card id="documents" title="Documents" icon={GraduationCap}>
              <DocumentsList
                rows={documents}
                onAdded={(row) => setDocuments((prev) => [...prev, row])}
                onUpdated={(row) =>
                  setDocuments((prev) => prev.map((r) => (r.id === row.id ? row : r)))
                }
                onRemoved={(id) => setDocuments((prev) => prev.filter((r) => r.id !== id))}
              />
            </Card>
          )}

          {/* ── BADGES — read-only ── */}
          {active === 'badges' && (
            <BadgesCard rows={badges} />
          )}

          {/* ── INSTRUCTOR BIO (instructor only) ── */}
          {active === 'instructor' && (
            <Card id="instructor" title="Instructor profile" icon={GraduationCap}>
              <InstructorBioCard />
            </Card>
          )}

          {/* ── KYC + BANK (instructor required · admin visible) ── */}
          {active === 'kyc' && (
            <Card id="kyc" title="KYC + Bank" icon={GraduationCap}>
              <KycBankCard profile={profile} onSaved={setProfile} />
            </Card>
          )}

          {/* ── Stubs — only sections without a real editor yet
              (security only — points out to the OTP-gated /profile/security
              page rather than re-implementing). Like everything else,
              it now only renders when its tab is active. */}
          {sections.filter((s) => s.id === active && needsStub(s)).map((s) => (
            <StubCard key={s.id} id={s.id} label={s.label} icon={s.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Section list + role label live in `lib/users/profile-sections.ts` so
// the desktop page and the mobile editor (`app/m/profile/edit`) stay
// in sync. `hasFullEditor` keeps the stub-vs-real distinction.

/** True for section IDs that don't yet have a real editor on this page. */
function needsStub(s: SectionMeta): boolean {
  return !hasFullEditor(s.id);
}

// ═══════════════════════════════════════════════════════════════════════
// Identity card
// ═══════════════════════════════════════════════════════════════════════

function IdentityCard({
  displayName, email, mobile, avatarUrl, headline, onAvatarUpdated,
}: {
  displayName: string; email: string; mobile: string;
  avatarUrl: string | null; headline: string;
  onAvatarUpdated: (next: UserProfile) => void;
}) {
  // Avatar upload state. Flow:
  //   pick file → open editor (crop / filters / resize) → user clicks Save
  //   → edited File goes to upload. Local preview is shown the instant the
  //   user confirms in the editor, so they get feedback even while the
  //   multipart PUT is in flight. After save we drop the blob URL —
  //   `avatarUrl` from props picks up the CDN URL the server stored.
  const [busy, setBusy]       = useState(false);
  const [err,  setErr]        = useState<string | null>(null);
  const [previewUrl, setPreview] = useState<string | null>(null);
  // `pendingFile` drives the editor modal — non-null means the editor is open.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // Cleanup any leftover blob URL on unmount or when preview clears, so
  // we don't leak memory across re-renders.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  function onPicked(file: File | null) {
    if (!file) return;
    if (!/^image\/(jpe?g|png|gif|webp|svg\+xml)$/i.test(file.type)) {
      setErr('Please pick an image (JPG, PNG, GIF, WebP, or SVG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // Tolerate larger originals — the editor will downscale on export.
      setErr('Image is too large — please pick one under 10 MB.');
      return;
    }
    setErr(null);
    // Defer to the editor modal — actual upload happens in `onEditComplete`.
    setPendingFile(file);
  }

  async function onEditComplete(editedFile: File) {
    setPendingFile(null);
    const blob = URL.createObjectURL(editedFile);
    setPreview(blob);
    setBusy(true);
    try {
      // Empty patch + file = "just update the photo" (server ignores
      // missing JSON fields). The route is wrapped with the multipart
      // coerceNullStrings middleware so we don't need to worry about
      // accidentally clearing other columns.
      const next = await updateMyProfileWithImages({}, editedFile, null);
      onAvatarUpdated(next);
      // Hold the preview for a beat so there's no flicker — the new
      // `avatarUrl` prop will take over on the next render.
      setTimeout(() => { setPreview(null); URL.revokeObjectURL(blob); }, 800);
    } catch (e) {
      URL.revokeObjectURL(blob);
      setPreview(null);
      setErr(e instanceof Error ? e.message : 'Could not upload.');
    } finally {
      setBusy(false);
    }
  }

  // Use the local preview while uploading; fall back to the persisted URL
  // (or the initial-letter placeholder) the rest of the time.
  const shownUrl = previewUrl ?? avatarUrl;

  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card p-6 flex items-center gap-5">
      <div className="relative">
        {shownUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shownUrl}
            alt={displayName}
            className={cn('h-24 w-24 rounded-full object-cover shadow-cardHover', busy && 'opacity-60')}
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-3xl flex items-center justify-center shadow-cardHover">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Hidden file input + clickable camera badge. */}
        <label className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-brand-700 hover:bg-brand-50 cursor-pointer">
          {busy
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Camera className="h-4 w-4" />}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => onPicked(e.target.files?.[0] ?? null)}
            aria-label="Change profile photo"
          />
        </label>
      </div>
      <div className="flex-1">
        <h2 className="heading text-xl text-slate-900">{displayName}</h2>
        <div className="text-sm text-slate-600 mt-0.5">{headline}</div>
        <div className="text-[12px] text-slate-500 mt-1 truncate">{email} · {mobile}</div>
        {err && (
          <div className="mt-2 text-[12px] text-rose-600">{err}</div>
        )}
      </div>

      {/* Editor modal — only renders when the user has just picked a
          file. Filerobot does its own crop / filters / resize UI; on
          Save we get back the edited File and start the upload. */}
      {pendingFile && (
        <ImageEditorModal
          file={pendingFile}
          onClose={() => setPendingFile(null)}
          onEditComplete={onEditComplete}
          aspectRatio={1}
          title="Edit profile photo"
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Section card primitive
// ═══════════════════════════════════════════════════════════════════════

function Card({
  id, title, icon: Icon, action, children,
}: {
  id: string; title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden scroll-mt-24"
    >
      <header className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-brand-600" />}
        <h3 className="heading text-base text-slate-900">{title}</h3>
        <div className="flex-1" />
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Basic info card — name / dob / gender / headline / bio
// ═══════════════════════════════════════════════════════════════════════

function BasicInfoCard({
  user, profile, onSave,
}: {
  // `display_name` lives on `users` (read via /users/me → v_user_profile),
  // every other basic-info field lives on `user_profiles`. We accept both
  // so each value seeds from its actual source-of-truth on first render
  // and on refetch after save.
  user: { display_name?: string | null } | null;
  profile: UserProfile | null;
  onSave: (patch: Partial<UserProfile>) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [headline,    setHeadline]    = useState(profile?.headline    ?? '');
  const [dob,         setDob]         = useState(profile?.date_of_birth ?? '');
  const [gender,      setGender]      = useState(profile?.gender ?? '');
  const [bio,         setBio]         = useState(profile?.bio ?? '');
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Per-field error map (profile-v6 validation pass). Field-level errors
  // surface on blur + on save; the rose banner above stays for
  // server-side failures only.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  // Sync into local state when either source changes (refetch).
  useEffect(() => {
    setDisplayName(user?.display_name ?? '');
  }, [user?.display_name]);
  useEffect(() => {
    setHeadline(profile?.headline ?? '');
    setDob(profile?.date_of_birth ?? '');
    setGender(profile?.gender ?? '');
    setBio(profile?.bio ?? '');
  }, [profile]);

  /**
   * Run every field check and return the next error map. Pure — call
   * it both on blur (single-field) and on save (full pass). Server-side
   * Zod also enforces these (see `userProfile.schema.ts`); the client
   * version saves a network round-trip for obvious bad input.
   */
  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    // display_name is optional but if present must look like a name (2-60).
    if (displayName.trim()) {
      if (displayName.trim().length < 2) errs.displayName = 'Display name must be at least 2 characters.';
      else if (displayName.length > 60)  errs.displayName = 'Display name must be at most 60 characters.';
    }
    const headlineCheck = validateMaxLen(headline, 200, 'Headline');
    if (!headlineCheck.ok) errs.headline = headlineCheck.msg;
    const bioCheck = validateMaxLen(bio, 2000, 'Bio');
    if (!bioCheck.ok) errs.bio = bioCheck.msg;
    const dobCheck = validateAge(dob, { min: 13, max: 120 });
    if (!dobCheck.ok) errs.dob = dobCheck.msg;
    return errs;
  }

  async function handleSave() {
    const errs = runValidation();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        display_name:  displayName || null,
        headline:      headline || null,
        date_of_birth: dob || null,
        gender:        gender || null,
        bio:           bio || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  // Convenience: revalidate just one field on blur so the user sees
  // feedback immediately without waiting for save.
  function blurValidate() {
    setFieldErrors(runValidation());
  }

  return (
    <Card
      id="basic"
      title="Basic info"
      icon={Sparkles}
      action={
        <Button onClick={handleSave} variant="primary" size="sm" disabled={saving} className="rounded-full">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? 'Saved' : 'Save'}
        </Button>
      }
    >
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
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Display name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={blurValidate}
            maxLength={60}
            aria-invalid={!!fieldErrors.displayName}
            aria-describedby={fieldErrors.displayName ? 'basic-display-name-error' : undefined}
            className={cn(inputCls, fieldErrors.displayName && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            placeholder="How your name appears publicly"
          />
          <FieldError id="basic-display-name-error" message={fieldErrors.displayName} />
        </Field>
        <Field label="Headline">
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            onBlur={blurValidate}
            maxLength={200}
            aria-invalid={!!fieldErrors.headline}
            aria-describedby={fieldErrors.headline ? 'basic-headline-error' : undefined}
            className={cn(inputCls, fieldErrors.headline && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            placeholder="One-line summary (e.g. Data Analyst @ Flipkart)"
          />
          <FieldError id="basic-headline-error" message={fieldErrors.headline} />
        </Field>
        <Field label="Date of birth">
          <input
            type="date"
            value={dob ?? ''}
            onChange={(e) => setDob(e.target.value)}
            onBlur={blurValidate}
            max={new Date().toISOString().slice(0, 10)}
            aria-invalid={!!fieldErrors.dob}
            aria-describedby={fieldErrors.dob ? 'basic-dob-error' : undefined}
            className={cn(inputCls, fieldErrors.dob && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
          />
          <FieldError id="basic-dob-error" message={fieldErrors.dob} />
        </Field>
        {/* Gender — `non-binary` removed because the server Zod enum
            only accepts 'male' | 'female' | 'other' | 'prefer_not_to_say'.
            'Other' covers it without silently failing on save. */}
        <Field label="Gender">
          <select
            value={gender ?? ''}
            onChange={(e) => setGender(e.target.value)}
            className={inputCls}
          >
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Bio" full>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onBlur={blurValidate}
            maxLength={2000}
            aria-invalid={!!fieldErrors.bio}
            aria-describedby={fieldErrors.bio ? 'basic-bio-error' : undefined}
            rows={3}
            className={cn(inputCls, 'min-h-[80px] resize-y', fieldErrors.bio && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            placeholder="A few sentences about you — visible on your public profile."
          />
          <div className="mt-0.5 flex justify-between gap-2 text-[10.5px] text-slate-400">
            <FieldError id="basic-bio-error" message={fieldErrors.bio} className="mt-0 flex-1" />
            <span className={cn('shrink-0', bio.length > 2000 && 'text-rose-600 font-semibold')}>
              {bio.length}/2000
            </span>
          </div>
        </Field>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Education — full form moved to `components/profile/EducationList.tsx`
// (multipart upload + master education_levels lookup). The inline
// card here was replaced by `<EducationList />` in the section block.
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// Skills — moved to `components/profile/SkillsChipEditor.tsx` so
// desktop + mobile share the master-list autocomplete + chip UI.
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// Badges card — read-only
// ═══════════════════════════════════════════════════════════════════════

function BadgesCard({ rows }: { rows: UserBadge[] }) {
  return (
    <Card id="badges" title="Badges" icon={Award}>
      {rows.length === 0 ? (
        <div className="text-sm text-slate-500">No badges yet — complete lessons and quizzes to earn them.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {rows.map((b) => (
            <div key={b.id} className="rounded-md bg-white border border-slate-200 shadow-sm p-3 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-btn">
                <Award className="h-5 w-5" />
              </div>
              <div className="mt-2 text-[12px] font-semibold text-slate-800 leading-tight truncate">{b.badge_name}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Stub card — placeholder for sections whose full editor lands next
// ═══════════════════════════════════════════════════════════════════════

function StubCard({
  id, label, icon: Icon,
}: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card id={id} title={label} icon={Icon}>
      <div className="text-sm text-slate-500 flex items-center justify-between">
        <span>This section will surface its full editor next — the API endpoints are already wired.</span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Field shell — keeps form layout consistent
// ═══════════════════════════════════════════════════════════════════════

function Field({
  label, children, full = false,
}: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={cn('block', full && 'sm:col-span-2')}>
      <div className="text-[12px] font-semibold text-slate-700 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
