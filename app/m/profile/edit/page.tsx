'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Camera, Save, Loader2, AlertCircle, CheckCircle2,
  Plus, Trash2, Award, Sparkles, GraduationCap, ChevronRight,
} from 'lucide-react';
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
  buildSectionList, roleLabel, hasFullEditor,
} from '@/lib/users/profile-sections';
// Shared section components — same set the desktop profile uses.
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
import { cn } from '@/lib/cn';

/**
 * Mobile profile editor — mobile-optimised counterpart to
 * `app/(app)/profile/page.tsx`.
 *
 * Layout differences from desktop
 *   • Single column — no left-rail nav (the in-section section nav
 *     is replaced by stacked cards; a sticky chips strip lets the
 *     user jump between sections without scrolling).
 *   • Touch-friendly tap targets (44 px min) and rounded-full save
 *     buttons matched to the rest of the mobile portal.
 *   • Inputs are full-width and stack vertically rather than the
 *     two-column grid the desktop card uses.
 *
 * What's reused
 *   • Section-visibility logic comes from `buildSectionList()` so
 *     mobile and desktop show the same sections for the same role.
 *   • All HTTP plumbing is `lib/users/client.ts` — same endpoints,
 *     same payloads, same envelope unwrapping.
 *   • Role detection reads `user.max_role_level` populated by
 *     `AuthProvider.enrichWithMe()` on login + hydrate.
 *
 * What's stubbed
 *   • Same set as desktop (Contact / Address / Languages / Social /
 *     Projects / Experience / Instructor bio / KYC / Documents).
 *     The data layer is wired; only the UI editors are next-batch.
 */
export default function MobileProfileEditPage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const roleLevel = user?.max_role_level ?? 20;

  const sections = useMemo(() => buildSectionList(roleLevel), [roleLevel]);

  // ── Active tab state ───────────────────────────────────────────────
  // Mirrors the desktop profile page (profile-v5): only the active
  // section's card renders below the header. Hash-synced so deep links
  // and back/forward navigation behave correctly.
  const [active, setActive] = useState<string>('basic');
  useEffect(() => {
    if (sections.length === 0) return;
    const allowed = new Set(sections.map((s) => s.id));
    const fromHash = (typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '');
    setActive(allowed.has(fromHash) ? fromHash : sections[0].id);
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
      window.history.pushState(null, '', `#${id}`);
    }
  }

  // ── Data state ─────────────────────────────────────────────────────
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
        if (p.status === 'rejected')   setHydrateError('Could not load your profile.');
      } catch {
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
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your profile…
        </div>
      </div>
    );
  }

  if (!user) {
    // Unauthed users should never reach this page (RequireAuth at the
    // (app)-group level would have bounced) but the mobile group has
    // no shared gate, so we bounce manually.
    if (typeof window !== 'undefined') window.location.href = '/m/login?next=%2Fm%2Fprofile%2Fedit';
    return null;
  }

  const displayName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    || user.email?.split('@')[0]
    || 'User';
  const headline = profile?.headline?.trim() || roleLabel(roleLevel);

  return (
    <div>
      {/* ── Compact top bar — back to profile hub + page title.
          Matches the rest of the /m/* portal's header pattern. */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-2 h-12 flex items-center gap-2">
        <Link
          href="/m/profile"
          aria-label="Back"
          className="h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-700 active:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="heading text-[15px] text-slate-900">Edit profile</div>
      </header>

      <div className="px-3 pt-3 pb-12">
        {hydrateError && (
          <div className="mb-3 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {hydrateError}
          </div>
        )}

        {/* ── Identity strip — name + role chip + change-photo button.
            Phase 32.3 wires the multipart upload UI; tapping the Camera
            badge opens the system picker and PUTs `/user-profiles/me`
            multipart with the chosen image. Local blob preview keeps
            feedback instant while the network round-trip runs. */}
        <IdentityStrip
          displayName={displayName}
          headline={headline}
          email={user.email}
          avatarUrl={profile?.profile_image_url || user.profile_image_url || null}
          onAvatarUpdated={(next) => {
            setProfile(next);
            if (next.profile_image_url !== undefined) {
              updateUser({ profile_image_url: next.profile_image_url ?? null });
            }
          }}
        />

        {/* ── Sticky section nav — horizontal pill tab strip. Tapping
            a pill swaps the active section below (profile-v5 tabbed
            behaviour). Hash-synced so deep links + back/forward work. */}
        <div className="sticky top-12 z-20 -mx-3 mt-3 bg-gradient-to-b from-white via-white to-white/0 px-3 py-2">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {sections.map((s) => {
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSection(s.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors active:scale-95',
                    isActive
                      ? 'bg-gradient-to-br from-brand-500 to-brand-600 border border-brand-600 text-white shadow-btn'
                      : s.tinted
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 active:bg-brand-50',
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── BASIC INFO ── */}
        {active === 'basic' && (
          <BasicInfoCard
            user={user}
            profile={profile}
            onSave={async (patch) => {
              // display_name lives on `users`, not `user_profiles`. Split
              // the patch so it actually persists. See desktop profile
              // page for the full reasoning.
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
              if (display_name !== undefined) {
                updateUser({ display_name: (display_name as string | null) ?? null });
              }
            }}
          />
        )}

        {/* ── CONTACT ── */}
        {active === 'contact' && (
          <Card id="contact" title="Contact" icon={Sparkles}>
            <ContactCard user={user} />
          </Card>
        )}

        {/* ── ADDRESS ── */}
        {active === 'address' && (
          <Card id="address" title="Address" icon={Sparkles}>
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
              // Bug 3b fix: on save error, re-fetch from server so the UI
              // matches what's actually persisted (matches desktop wiring).
              onRefetch={async () => {
                const fresh = await listEducation();
                setEducation(fresh);
              }}
            />
          </Card>
        )}
        {/* ── EXPERIENCE ── */}
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

        {/* ── PROJECTS ── */}
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

        {/* ── BADGES (read-only) ── */}
        {active === 'badges' && (
          <BadgesCard rows={badges} />
        )}

        {/* ── INSTRUCTOR BIO (role ≥ 60) ── */}
        {active === 'instructor' && (
          <Card id="instructor" title="Instructor profile" icon={GraduationCap}>
            <InstructorBioCard />
          </Card>
        )}

        {/* ── KYC + BANK ── */}
        {active === 'kyc' && (
          <Card id="kyc" title="KYC + Bank" icon={GraduationCap}>
            <KycBankCard profile={profile} onSaved={setProfile} />
          </Card>
        )}

        {/* ── Stubs — only sections without a real editor yet
            (documents + security). Security points out to the existing
            OTP-gated page rather than re-implementing. */}
        {sections.filter((s) => s.id === active && !hasFullEditor(s.id)).map((s) => (
          <StubCard key={s.id} id={s.id} label={s.label} icon={s.icon} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Card primitive — touch-friendly mobile spacing
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
      className="mt-3 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden scroll-mt-28"
    >
      <header className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-brand-600" />}
        <h3 className="heading text-[15px] text-slate-900">{title}</h3>
        <div className="flex-1" />
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Basic info — single-column form
// ═══════════════════════════════════════════════════════════════════════

function BasicInfoCard({
  user, profile, onSave,
}: {
  user: { display_name?: string | null } | null;
  profile: UserProfile | null;
  onSave: (patch: Partial<UserProfile>) => Promise<void>;
}) {
  // display_name lives on `users` (read via /users/me → v_user_profile),
  // every other field on `user_profiles`. Same split as desktop.
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [headline,    setHeadline]    = useState(profile?.headline    ?? '');
  const [dob,         setDob]         = useState(profile?.date_of_birth ?? '');
  const [gender,      setGender]      = useState(profile?.gender ?? '');
  const [bio,         setBio]         = useState(profile?.bio ?? '');
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user?.display_name ?? '');
  }, [user?.display_name]);
  useEffect(() => {
    setHeadline(profile?.headline ?? '');
    setDob(profile?.date_of_birth ?? '');
    setGender(profile?.gender ?? '');
    setBio(profile?.bio ?? '');
  }, [profile]);

  async function handleSave() {
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

  return (
    <Card
      id="basic"
      title="Basic info"
      icon={Sparkles}
      action={
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-3.5 py-1.5 text-[12.5px] font-bold shadow-btn active:scale-95 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? 'Saved' : 'Save'}
        </button>
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
      <div className="space-y-3">
        <Field label="Display name">
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} placeholder="How your name appears publicly" />
        </Field>
        <Field label="Headline">
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputCls} placeholder="One-line summary" />
        </Field>
        <Field label="Date of birth">
          <input type="date" value={dob ?? ''} onChange={(e) => setDob(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Gender">
          <select value={gender ?? ''} onChange={(e) => setGender(e.target.value)} className={inputCls}>
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={cn(inputCls, 'min-h-[88px] resize-y')}
            placeholder="A few sentences about you — visible on your public profile."
          />
        </Field>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// IdentityStrip — mobile avatar + name card with photo picker
//
// Mirrors the desktop IdentityCard upload flow. The hidden <input
// type="file"> lives inside a <label>, so tapping the Camera badge opens
// the system picker without any extra refs. We show a local blob URL
// preview the moment the user picks, then swap it for the persisted CDN
// URL once the multipart PUT comes back. Errors render inline below.
// ═══════════════════════════════════════════════════════════════════════

function IdentityStrip({
  displayName, headline, email, avatarUrl, onAvatarUpdated,
}: {
  displayName: string;
  headline:    string;
  email:       string;
  avatarUrl:   string | null;
  onAvatarUpdated: (next: UserProfile) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);
  const [previewUrl, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  async function onPicked(file: File | null) {
    if (!file) return;
    if (!/^image\/(jpe?g|png|gif|webp|svg\+xml)$/i.test(file.type)) {
      setErr('Please pick an image (JPG, PNG, GIF, WebP, or SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('Image is too large — please pick one under 5 MB.');
      return;
    }
    setErr(null);
    const blob = URL.createObjectURL(file);
    setPreview(blob);
    setBusy(true);
    try {
      const next = await updateMyProfileWithImages({}, file, null);
      onAvatarUpdated(next);
      setTimeout(() => { setPreview(null); URL.revokeObjectURL(blob); }, 800);
    } catch (e) {
      URL.revokeObjectURL(blob);
      setPreview(null);
      setErr(e instanceof Error ? e.message : 'Could not upload.');
    } finally {
      setBusy(false);
    }
  }

  const shownUrl = previewUrl ?? avatarUrl;

  return (
    <div className="rounded-md bg-white border border-slate-200 p-4 flex items-center gap-3 shadow-card">
      {shownUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shownUrl}
          alt={displayName}
          className={cn('h-16 w-16 rounded-full object-cover', busy && 'opacity-60')}
        />
      ) : (
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-2xl flex items-center justify-center">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="heading text-base text-slate-900 truncate">{displayName}</div>
        <div className="text-[12px] text-slate-600 truncate">{headline}</div>
        <div className="text-[11px] text-slate-500 truncate">{email}</div>
        {err && <div className="mt-1 text-[11px] text-rose-600">{err}</div>}
      </div>
      <label
        aria-label="Change photo"
        className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 inline-flex items-center justify-center active:scale-95 cursor-pointer"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={(e) => onPicked(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Education — full form moved to `components/profile/EducationList.tsx`
// (multipart upload + master education_levels lookup). The mobile
// section now mounts the same shared component as desktop.
// ═══════════════════════════════════════════════════════════════════════

// Skills inline editor removed — replaced by the shared
// `components/profile/SkillsChipEditor` so the master-list chip picker
// behaviour is identical on mobile and desktop.

// ═══════════════════════════════════════════════════════════════════════
// Badges — read-only
// ═══════════════════════════════════════════════════════════════════════

function BadgesCard({ rows }: { rows: UserBadge[] }) {
  return (
    <Card id="badges" title="Badges" icon={Award}>
      {rows.length === 0 ? (
        <div className="text-sm text-slate-500">No badges yet — complete lessons and quizzes to earn them.</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {rows.map((b) => (
            <div key={b.id} className="rounded-md bg-white border border-slate-200 shadow-sm p-3 text-center">
              <div className="mx-auto h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-btn">
                <Award className="h-5 w-5" />
              </div>
              <div className="mt-2 text-[11.5px] font-semibold text-slate-800 leading-tight truncate">{b.badge_name}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Stub — placeholder for sections whose full editor lands next
// ═══════════════════════════════════════════════════════════════════════

function StubCard({
  id, label, icon: Icon,
}: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card id={id} title={label} icon={Icon}>
      <div className="text-sm text-slate-500 flex items-center justify-between">
        <span>This section's full editor lands next — the API is already wired.</span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Field shell
// ═══════════════════════════════════════════════════════════════════════

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.5px] font-semibold text-slate-700 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
