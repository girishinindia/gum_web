/**
 * Typed HTTP wrappers for the user / profile sub-resources mounted in
 * `gum_api/src/app.ts:271-305`. Every endpoint requires the Bearer
 * access token and uses the same `{ success, data, error }` envelope
 * the auth client already unwraps via `lib/auth/client.ts`.
 *
 * Endpoint coverage:
 *   /users/me                 — GET   identity + roles + max_role_level
 *   /user-profiles/me         — GET / PUT  KYC, address, bio, socials…
 *   /user-education           — list / add / update / delete
 *   /user-experience          — list / add / update / delete
 *   /user-skills              — list / add / update / delete
 *   /user-languages           — list / add / update / delete
 *   /user-projects            — list / add / update / delete
 *   /user-social-medias       — list / add / update / delete
 *   /user-documents           — list / add / delete (no update)
 *   /user-badges              — list (read-only — awarded by backend)
 *   /instructor-profiles/me   — GET / PUT  (instructor-only)
 *
 * Why a single file?
 *   These are all flat CRUDs that share the same envelope + Bearer-token
 *   plumbing. Splitting them per-resource would create 10 near-identical
 *   files. Keeping them together makes refactors (e.g. swapping the
 *   envelope shape) a single-file change.
 *
 * Patterns:
 *   • `list*()` returns an array (the API wraps it as `{ items: [...] }`
 *     on the server, but the response envelope unwraps to the items).
 *   • `add*()` returns the new row including its server-generated id.
 *   • `update*(id, patch)` returns the updated row.
 *   • `delete*(id)` returns `{ success: true }`.
 *   • All mutations are typed with `Partial<Resource>` so consumers can
 *     send only the changed fields.
 */

import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';
import type { AuthRole, AuthUser } from '@/lib/auth/session';

// ── Shared error + low-level call (mirror of lib/auth/client.ts) ──────

export class UserApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'UserApiError';
    this.status = status;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data?:   T;
  message?: string;
  error?:  string;
  details?: unknown;
}

interface CallOpts {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?:   unknown;
}

async function call<T>(path: string, opts: CallOpts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const tok = getAccessToken();
  if (tok) headers['Authorization'] = `Bearer ${tok}`;

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
  } catch (networkErr) {
    throw new UserApiError('Network error. Please check your connection.', 0, networkErr);
  }

  let json: ApiEnvelope<T>;
  try {
    json = await res.json();
  } catch {
    throw new UserApiError(`Server error (${res.status})`, res.status);
  }

  if (!res.ok || json.success === false) {
    const msg = json.error || json.message || `Request failed (${res.status})`;
    throw new UserApiError(msg, res.status, json.details);
  }
  return (json.data as T) ?? (json as unknown as T);
}

/**
 * Multipart variant of `call()` — used by the resources whose servers
 * accept `multipart/form-data` because they handle file uploads:
 *
 *   • /user-education/me   — `certificate` file
 *   • /user-documents/me   — `file` (image or PDF)
 *   • /users/me            — `avatar` file
 *
 * Caller passes a plain `Record<string, …>` of field values plus an
 * optional `_file` (the File object). Values that are `null` get
 * stringified to "null" so the server's `parseBody()` helpers can
 * detect "clear this column" semantics. Booleans → "true" / "false".
 * `undefined` is skipped entirely (don't touch the column).
 */
function buildFormData(
  fields: Record<string, unknown>,
  fileField?: string,
  file?: File | null,
): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    if (v === null) { fd.append(k, 'null'); continue; }
    if (typeof v === 'boolean') { fd.append(k, v ? 'true' : 'false'); continue; }
    if (v instanceof Date) { fd.append(k, v.toISOString()); continue; }
    fd.append(k, String(v));
  }
  if (fileField && file) fd.append(fileField, file);
  return fd;
}

async function callMultipart<T>(path: string, fd: FormData, method: 'POST' | 'PATCH' | 'PUT' = 'POST'): Promise<T> {
  const headers: Record<string, string> = {};
  // Do NOT set Content-Type — the browser must set it with the
  // multipart boundary. Same fetch error-handling as `call()`.
  const tok = getAccessToken();
  if (tok) headers['Authorization'] = `Bearer ${tok}`;

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, { method, headers, body: fd, cache: 'no-store' });
  } catch (networkErr) {
    throw new UserApiError('Network error. Please check your connection.', 0, networkErr);
  }
  let json: ApiEnvelope<T>;
  try { json = await res.json(); }
  catch { throw new UserApiError(`Server error (${res.status})`, res.status); }
  if (!res.ok || json.success === false) {
    const msg = json.error || json.message || `Request failed (${res.status})`;
    throw new UserApiError(msg, res.status, json.details);
  }
  return (json.data as T) ?? (json as unknown as T);
}

// ═══════════════════════════════════════════════════════════════════════
// /users/me — identity + roles + max_role_level
// ═══════════════════════════════════════════════════════════════════════

export interface MeResponse {
  id:                  number;
  first_name:          string;
  last_name:           string;
  full_name?:          string;
  email:               string;
  mobile:              string;
  display_name?:       string | null;   // users.display_name — added to v_user_profile in phase28
  avatar_url?:         string | null;
  status?:             string;
  locale?:             string;
  last_login_at?:      string | null;
  last_login_method?:  string | null;
  login_count?:        number;
  preferences?:        Record<string, unknown> | null;
  created_at?:         string;
  roles?:              AuthRole[];
  max_role_level?:     number;
  profile_image_url?:  string | null;
}

/** GET /api/v1/users/me — current user, joined from `v_user_profile`. */
export async function getMe(): Promise<MeResponse> {
  return call<MeResponse>('/users/me');
}

/**
 * Allowed fields that live on the `users` table itself (NOT
 * `user_profiles`). Pulled from `gum_api/.../user.controller.ts:19`:
 *   const ALLOWED_FIELDS = ['first_name', 'last_name', 'display_name',
 *                           'locale', 'preferences', 'type'];
 * The server silently ignores any keys outside this list.
 */
export interface UpdateMeBody {
  first_name?:  string | null;
  last_name?:   string | null;
  display_name?: string | null;
  locale?:      string | null;
  preferences?: Record<string, unknown> | null;
  type?:        string | null;
}

/**
 * PATCH /api/v1/users/me — update fields on the `users` row (not the
 * extended `user_profiles` row). Used for `display_name` which the
 * profile page used to send to `/user-profiles/me` by mistake — that
 * endpoint silently dropped it because the column doesn't exist there.
 */
export async function updateMe(patch: UpdateMeBody): Promise<MeResponse> {
  return call<MeResponse>('/users/me', { method: 'PATCH', body: patch });
}

// ═══════════════════════════════════════════════════════════════════════
// /user-profiles/me — extended profile (bio, address, KYC, social refs)
// ═══════════════════════════════════════════════════════════════════════

export interface UserProfile {
  id?:                    number;
  user_id?:               number;
  display_name?:          string | null;
  headline?:              string | null;
  bio?:                   string | null;
  slug?:                  string | null;
  is_public?:             boolean;
  date_of_birth?:         string | null;  // YYYY-MM-DD
  gender?:                string | null;
  // Addresses — country / state / city are FK IDs on the server (BIGINT
  // pointing at the `countries`, `states`, `cities` master tables).
  // Earlier the client sent text values which the server silently dropped;
  // phase28 audit caught it. The AddressFields cascade resolves these
  // IDs back to display names via the master-list lookups.
  current_address_line1?: string | null;
  current_address_line2?: string | null;
  current_city_id?:       number | null;
  current_state_id?:      number | null;
  current_country_id?:    number | null;
  current_postal_code?:   string | null;
  permanent_address_line1?: string | null;
  permanent_address_line2?: string | null;
  permanent_city_id?:     number | null;
  permanent_state_id?:    number | null;
  permanent_country_id?:  number | null;
  permanent_postal_code?: string | null;
  // Emergency contact
  emergency_contact_name?:     string | null;
  emergency_contact_mobile?:   string | null;
  emergency_contact_relation?: string | null;
  // KYC + bank (instructor-only typically).
  // Column names match the live `user_profiles` schema verbatim — see
  // phase28 audit. Earlier versions of this interface used
  // `aadhaar_number / bank_ifsc / bank_account_holder` which silently
  // failed server-side (unknown keys were dropped, saves looked OK).
  aadhar_number?:         string | null;   // server column spelling
  pan_number?:            string | null;
  passport_number?:       string | null;
  bank_account_name?:     string | null;   // (was bank_account_holder)
  bank_name?:             string | null;
  bank_account_number?:   string | null;
  bank_ifsc_code?:        string | null;   // (was bank_ifsc)
  upi_id?:                string | null;
  // Media
  profile_image_url?:     string | null;
  cover_image_url?:       string | null;
  created_at?:            string;
  updated_at?:            string;
}

/** GET /api/v1/user-profiles/me */
export async function getMyProfile(): Promise<UserProfile> {
  return call<UserProfile>('/user-profiles/me');
}

/** PUT /api/v1/user-profiles/me — upsert (server treats it as create-or-update). */
export async function updateMyProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  return call<UserProfile>('/user-profiles/me', { method: 'PUT', body: patch });
}

// ═══════════════════════════════════════════════════════════════════════
// /education-levels — MASTER lookup (public GET, populates the dropdown)
// ═══════════════════════════════════════════════════════════════════════

export interface EducationLevel {
  id:             number;
  name:           string;
  abbreviation?:  string | null;
  level_order?:   number | null;
  level_category?: 'pre_school' | 'school' | 'diploma' | 'undergraduate'
                 | 'postgraduate' | 'doctoral' | 'professional' | 'informal' | 'other'
                 | null;
  description?:   string | null;
  is_active?:     boolean;
  sort_order?:    number;
}

/** GET /education-levels — full ladder, sorted by level_order ascending. */
export async function listEducationLevels(): Promise<EducationLevel[]> {
  return call<EducationLevel[]>('/education-levels?is_active=true&limit=500&sort=level_order&ascending=true');
}

// ═══════════════════════════════════════════════════════════════════════
// /user-education
//
// Server schema (Zod `createUserEducationSchema`):
//   required: education_level_id, institution_name
//   optional: board_or_university, field_of_study, specialization,
//             grade_or_percentage, grade_type ('percentage'|'cgpa'|'gpa'|
//             'grade'|'pass_fail'|'other'),
//             start_date, end_date,
//             is_currently_studying (default false),
//             is_highest_qualification (default false),
//             description
//   server-populated: certificate_url (set from `req.file` on multipart POST/PATCH)
//
// Wire format is `multipart/form-data` with optional `certificate` file
// because the controller sets `certificate_url` from the uploaded file.
// To clear an existing cert: send `certificate_url=null` (string) with
// no file — the server's `parseBody()` converts the literal "null" → null.
// ═══════════════════════════════════════════════════════════════════════

export type GradeType = 'percentage' | 'cgpa' | 'gpa' | 'grade' | 'pass_fail' | 'other';

export interface UserEducation {
  id?:                       number;
  user_id?:                  number;
  education_level_id:        number;
  institution_name:          string;
  board_or_university?:      string | null;
  field_of_study?:           string | null;
  specialization?:           string | null;
  grade_or_percentage?:      string | null;
  grade_type?:               GradeType | null;
  start_date?:               string | null;  // YYYY-MM-DD
  end_date?:                 string | null;
  is_currently_studying?:    boolean;
  is_highest_qualification?: boolean;
  description?:              string | null;
  certificate_url?:          string | null;  // server-set; clear with literal null
  // Server-joined master row + audit fields (read-only on the wire):
  education_level?: Pick<EducationLevel, 'id' | 'name' | 'abbreviation'>;
  created_at?:      string;
  updated_at?:      string;
}

// All mutations hit `/me` self-service endpoints — gated by `authMiddleware`
// only (no `user_education:*` permission needed). The bare `/user-education`
// path is admin-only and 403s for students.
export async function listEducation(): Promise<UserEducation[]> {
  return call<UserEducation[]>('/user-education/me');
}

/**
 * POST /user-education/me — multipart create.
 *
 * Pass `certificate` as an optional File. All other text fields go on the
 * `payload` object. Booleans stringify to "true"/"false"; nulls stringify
 * to the literal "null" so the server can clear columns deliberately.
 */
export async function addEducation(
  payload: Omit<UserEducation, 'id' | 'user_id' | 'education_level' | 'created_at' | 'updated_at' | 'certificate_url'>,
  certificate?: File | null,
): Promise<UserEducation> {
  const fd = buildFormData(payload as unknown as Record<string, unknown>, 'certificate', certificate);
  return callMultipart<UserEducation>('/user-education/me', fd, 'POST');
}

/**
 * PATCH /user-education/me/:id — multipart update. Same shape as add.
 * Pass `certificate_url: null` in the payload to clear the existing
 * certificate without uploading a new one.
 */
export async function updateEducation(
  id: number,
  patch: Partial<Omit<UserEducation, 'id' | 'user_id' | 'education_level' | 'created_at' | 'updated_at'>>,
  certificate?: File | null,
): Promise<UserEducation> {
  const fd = buildFormData(patch as unknown as Record<string, unknown>, 'certificate', certificate);
  return callMultipart<UserEducation>(`/user-education/me/${id}`, fd, 'PATCH');
}

export async function deleteEducation(id: number): Promise<void> {
  await call(`/user-education/me/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════════════
// /designations — MASTER lookup (public GET, populates Experience dropdown)
// ═══════════════════════════════════════════════════════════════════════

export interface Designation {
  id:           number;
  name:         string;
  code?:        string | null;
  level?:       number | null;
  level_band?:  string | null;   // 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | …
  is_active?:   boolean;
  sort_order?:  number;
}

/** GET /designations — full curated list, sorted by level ascending. */
export async function listDesignations(): Promise<Designation[]> {
  return call<Designation[]>('/designations?is_active=true&limit=1000&sort=level&ascending=true');
}

// ═══════════════════════════════════════════════════════════════════════
// /user-experience
//
// Server schema (Zod `createUserExperienceSchema`):
//   required: company_name, job_title, start_date
//   optional: designation_id, employment_type ('full_time'|'part_time'|
//             'contract'|'internship'|'freelance'|'self_employed'|
//             'volunteer'|'apprenticeship'|'other'),
//             department, location,
//             work_mode ('on_site'|'remote'|'hybrid'),
//             end_date, is_current_job, description, key_achievements,
//             skills_used, salary_range,
//             reference_name, reference_phone, reference_email
//
// Wire format is JSON. No file upload.
// ═══════════════════════════════════════════════════════════════════════

export type EmploymentType =
  | 'full_time' | 'part_time' | 'contract' | 'internship'
  | 'freelance' | 'self_employed' | 'volunteer' | 'apprenticeship' | 'other';
export type WorkMode = 'on_site' | 'remote' | 'hybrid';

export interface UserExperience {
  id?:               number;
  user_id?:          number;
  company_name:      string;
  job_title:         string;
  designation_id?:   number | null;
  employment_type?:  EmploymentType;
  department?:       string | null;
  location?:         string | null;
  work_mode?:        WorkMode;
  start_date:        string;             // YYYY-MM-DD, required
  end_date?:         string | null;
  is_current_job?:   boolean;
  description?:      string | null;
  key_achievements?: string | null;
  skills_used?:      string | null;      // free-text, comma-separated
  salary_range?:     string | null;
  reference_name?:   string | null;
  reference_phone?:  string | null;
  reference_email?:  string | null;
  // Server-joined master row + audit fields (read-only on the wire):
  designation?: Pick<Designation, 'id' | 'name' | 'level_band'> | null;
  created_at?:  string;
  updated_at?:  string;
}

export async function listExperience(): Promise<UserExperience[]> {
  return call<UserExperience[]>('/user-experience/me');
}
export async function addExperience(
  payload: Omit<UserExperience, 'id' | 'user_id' | 'designation' | 'created_at' | 'updated_at'>,
): Promise<UserExperience> {
  return call<UserExperience>('/user-experience/me', { method: 'POST', body: payload });
}
export async function updateExperience(
  id: number,
  patch: Partial<Omit<UserExperience, 'id' | 'user_id' | 'designation' | 'created_at' | 'updated_at'>>,
): Promise<UserExperience> {
  return call<UserExperience>(`/user-experience/me/${id}`, { method: 'PATCH', body: patch });
}
export async function deleteExperience(id: number): Promise<void> {
  await call(`/user-experience/me/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════════════
// /skills — MASTER catalogue (used for autocomplete in the chip picker)
// ═══════════════════════════════════════════════════════════════════════

/**
 * One row in the master `skills` table. The list endpoint is public
 * (no auth required), used to populate the autocomplete popover in
 * `<SkillsChipEditor>`. The `category` enum is fixed server-side at
 * `technical | soft_skill | tool | framework | language | domain |
 *  certification | other`.
 */
export interface MasterSkill {
  id:           number;
  name:         string;
  category?:    string | null;
  description?: string | null;
  icon?:        string | null;
  is_active?:   boolean;
  sort_order?:  number;
}

/**
 * Debounced server search for the chip picker.
 *
 *   • Hits `GET /skills?search=<q>&limit=<n>&is_active=true&ascending=true`.
 *   • Server returns the paginated envelope `{ data: [...], pagination }`.
 *     The shared `call()` unwraps `data` (a flat array, not `data.items`).
 *   • `q` shorter than 1 char returns the top results sorted by `name`.
 */
export async function searchMasterSkills(q: string, limit = 20): Promise<MasterSkill[]> {
  const params = new URLSearchParams();
  if (q.trim()) params.set('search', q.trim());
  params.set('limit', String(limit));
  params.set('is_active', 'true');
  params.set('ascending', 'true');
  return call<MasterSkill[]>(`/skills?${params.toString()}`);
}

// ═══════════════════════════════════════════════════════════════════════
// /user-skills — the user's selected skills (FK to master `skills`)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Server schema: `{ skill_id (FK→skills.id), proficiency_level, years_of_experience,
 * is_primary, certificate_url, endorsement_count }`. Self-service POST goes to
 * `/user-skills/me` (server injects `user_id` from JWT); mutations use PATCH.
 *
 * The server JOINs the master `skills` table on read, so list responses
 * include `skill` as a nested object (id + name + category) for free —
 * we don't need a separate fetch to render chips.
 */
export type Proficiency =
  | 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';

export interface UserSkill {
  id?:                 number;
  user_id?:            number;
  skill_id:            number;          // FK to skills.id (required by server)
  proficiency_level?:  Proficiency;     // default 'beginner'
  years_of_experience?: number | null;
  is_primary?:         boolean;
  certificate_url?:    string | null;
  endorsement_count?:  number;
  // Server-joined master row (read-only, server-populated):
  skill?: {
    id:        number;
    name:      string;
    category?: string | null;
  };
}

export async function listSkills(): Promise<UserSkill[]> {
  return call<UserSkill[]>('/user-skills/me');
}

/**
 * Self-service add — server injects `user_id` from the JWT, body
 * carries only `skill_id` + `proficiency_level` (and optional extras).
 * Endpoint is `/user-skills/me` (NOT `/user-skills` — that's
 * admin-only). Returns the created row joined with the master skill.
 */
export async function addSkill(body: {
  skill_id:           number;
  proficiency_level?: Proficiency;
  years_of_experience?: number | null;
  is_primary?:        boolean;
  certificate_url?:   string | null;
}): Promise<UserSkill> {
  return call<UserSkill>('/user-skills/me', { method: 'POST', body });
}

/** PATCH (not PUT) per the server schema — partial update by id. */
export async function updateSkill(
  id: number,
  patch: Partial<{
    proficiency_level:   Proficiency;
    years_of_experience: number | null;
    is_primary:          boolean;
    certificate_url:     string | null;
  }>,
): Promise<UserSkill> {
  return call<UserSkill>(`/user-skills/me/${id}`, { method: 'PATCH', body: patch });
}

export async function deleteSkill(id: number): Promise<void> {
  await call(`/user-skills/me/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════════════
// /languages — MASTER lookup (public GET, used by the Languages chip picker)
// ═══════════════════════════════════════════════════════════════════════

export interface MasterLanguage {
  id:           number;
  name:         string;
  native_name?: string | null;
  iso_code?:    string | null;
  is_active?:   boolean;
  sort_order?:  number;
}

/**
 * Debounced server search for the Languages chip picker — same pattern
 * as `searchMasterSkills`. Returns top `limit` matches by name/native_name/iso.
 */
export async function searchMasterLanguages(q: string, limit = 20): Promise<MasterLanguage[]> {
  const params = new URLSearchParams();
  if (q.trim()) params.set('search', q.trim());
  params.set('limit', String(limit));
  params.set('is_active', 'true');
  params.set('ascending', 'true');
  return call<MasterLanguage[]>(`/languages?${params.toString()}`);
}

// ═══════════════════════════════════════════════════════════════════════
// /user-languages
//
// Server schema (Zod `createUserLanguageSchema`):
//   required: language_id (FK→languages.id)
//   optional with defaults:
//     proficiency_level ('basic'|'conversational'|'professional'|'fluent'|'native'),
//     can_read (false), can_write (false), can_speak (false),
//     is_primary (false), is_native (false)
//
// Wire format is JSON. Server enforces UNIQUE(user_id, language_id).
// On read, the row includes a joined `language { id, name, iso_code }`.
// ═══════════════════════════════════════════════════════════════════════

export type LanguageProficiency =
  | 'basic' | 'conversational' | 'professional' | 'fluent' | 'native';

export interface UserLanguage {
  id?:                number;
  user_id?:           number;
  language_id:        number;
  proficiency_level?: LanguageProficiency;
  can_read?:          boolean;
  can_write?:         boolean;
  can_speak?:         boolean;
  is_primary?:        boolean;
  is_native?:         boolean;
  // Server-joined master row:
  language?: Pick<MasterLanguage, 'id' | 'name' | 'native_name' | 'iso_code'>;
  created_at?: string;
  updated_at?: string;
}

export async function listLanguages(): Promise<UserLanguage[]> {
  return call<UserLanguage[]>('/user-languages/me');
}
export async function addLanguage(
  payload: Omit<UserLanguage, 'id' | 'user_id' | 'language' | 'created_at' | 'updated_at'>,
): Promise<UserLanguage> {
  return call<UserLanguage>('/user-languages/me', { method: 'POST', body: payload });
}
export async function updateLanguage(
  id: number,
  patch: Partial<Omit<UserLanguage, 'id' | 'user_id' | 'language' | 'created_at' | 'updated_at'>>,
): Promise<UserLanguage> {
  return call<UserLanguage>(`/user-languages/me/${id}`, { method: 'PATCH', body: patch });
}
export async function deleteLanguage(id: number): Promise<void> {
  await call(`/user-languages/me/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════════════
// /user-projects
//
// Server schema (Zod `createUserProjectSchema`) — large (~47 fields).
// Required: project_title.
// Type / status are inline enums (no lookup table).
//
// Wire format is JSON. `thumbnail_url` is a plain string the UI must
// populate via a separate upload route if needed (no multipart here).
// ═══════════════════════════════════════════════════════════════════════

export type ProjectType =
  | 'personal' | 'academic' | 'professional' | 'freelance' | 'open_source'
  | 'research' | 'hackathon' | 'internship' | 'client' | 'government'
  | 'ngo' | 'other';

export type ProjectStatus =
  | 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' | 'abandoned';

export interface UserProject {
  id?:                  number;
  user_id?:             number;
  project_title:        string;
  project_code?:        string | null;
  project_type?:        ProjectType;
  description?:         string | null;
  objectives?:          string | null;
  role_in_project?:     string | null;
  responsibilities?:    string | null;
  team_size?:           number | null;
  is_solo_project?:     boolean;
  organization_name?:   string | null;
  client_name?:         string | null;
  industry?:            string | null;
  technologies_used?:   string | null;   // free-text, comma-separated
  tools_used?:          string | null;
  programming_languages?: string | null;
  frameworks?:          string | null;
  databases_used?:      string | null;
  platform?:            string | null;
  start_date?:          string | null;
  end_date?:            string | null;
  is_ongoing?:          boolean;
  duration_months?:     number | null;
  project_status?:      ProjectStatus;
  key_achievements?:    string | null;
  challenges_faced?:    string | null;
  lessons_learned?:     string | null;
  impact_summary?:      string | null;
  users_served?:        number | null;
  project_url?:         string | null;
  repository_url?:      string | null;
  demo_url?:            string | null;
  documentation_url?:   string | null;
  thumbnail_url?:       string | null;
  case_study_url?:      string | null;
  is_featured?:         boolean;
  is_published?:        boolean;
  awards?:              string | null;
  certifications?:      string | null;
  reference_name?:      string | null;
  reference_email?:     string | null;
  reference_phone?:     string | null;
  display_order?:       number;
  // Audit (read-only):
  created_at?: string;
  updated_at?: string;
}

export async function listProjects(): Promise<UserProject[]> {
  return call<UserProject[]>('/user-projects/me');
}
export async function addProject(
  payload: Omit<UserProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
): Promise<UserProject> {
  return call<UserProject>('/user-projects/me', { method: 'POST', body: payload });
}
export async function updateProject(
  id: number,
  patch: Partial<Omit<UserProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
): Promise<UserProject> {
  return call<UserProject>(`/user-projects/me/${id}`, { method: 'PATCH', body: patch });
}
export async function deleteProject(id: number): Promise<void> {
  await call(`/user-projects/me/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════════════
// /user-social-medias
// ═══════════════════════════════════════════════════════════════════════

export interface UserSocialMedia {
  id?:           number;
  user_id?:      number;
  platform:      string;   // 'linkedin' | 'github' | 'twitter' | 'instagram' | 'youtube' | …
  url:           string;
  username?:     string | null;
  is_public?:    boolean;
  display_order?: number;
}

export async function listSocialMedias(): Promise<UserSocialMedia[]> {
  return call<UserSocialMedia[]>('/user-social-medias/me');
}
export async function addSocialMedia(row: UserSocialMedia): Promise<UserSocialMedia> {
  return call<UserSocialMedia>('/user-social-medias/me', { method: 'POST', body: row });
}
export async function updateSocialMedia(id: number, patch: Partial<UserSocialMedia>): Promise<UserSocialMedia> {
  return call<UserSocialMedia>(`/user-social-medias/me/${id}`, { method: 'PATCH', body: patch });
}
export async function deleteSocialMedia(id: number): Promise<void> {
  await call(`/user-social-medias/me/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════════════
// /document-types — MASTER lookup (public GET) for the Documents picker
// ═══════════════════════════════════════════════════════════════════════

export interface DocumentType {
  id:           number;
  name:         string;
  description?: string | null;
  is_active?:   boolean;
  sort_order?:  number;
}

/** GET /document-types — full active list, sorted by name. */
export async function listDocumentTypes(): Promise<DocumentType[]> {
  return call<DocumentType[]>('/document-types?is_active=true&limit=500&sort=name&ascending=true');
}

/**
 * One row in the master `documents` table — the specific document
 * (e.g. "Aadhaar Card", "PAN Card", "Passport") that belongs to a
 * `document_types` category. Used to drive the second dropdown in the
 * Documents picker cascade: pick TYPE → load DOCUMENTS for that type.
 */
export interface MasterDocument {
  id:                number;
  document_type_id:  number;
  name:              string;          // human label
  description?:      string | null;
  is_active?:        boolean;
  sort_order?:       number;
  // Server-joined master row on read:
  document_types?: { name: string } | null;
}

/**
 * GET /documents?document_type_id=X — list specific documents within a
 * given type. Returns sorted-by-name active rows. Filter is required;
 * passing 0 returns the (unfiltered) full list which is rarely useful.
 */
export async function listMasterDocuments(typeId: number): Promise<MasterDocument[]> {
  return call<MasterDocument[]>(
    `/documents?document_type_id=${typeId}&is_active=true&limit=500&sort=name&ascending=true`,
  );
}

// ═══════════════════════════════════════════════════════════════════════
// /user-documents
//
// Server schema (Zod `createUserDocumentSchema`):
//   required: document_type_id (FK→document_types.id)
//   optional: document_id (FK→documents.id — admin-managed, usually null),
//             document_number, file (multipart upload),
//             issue_date, expiry_date
//   admin-only fields the self-service controller STRIPS from PATCH body:
//             verification_status, verified_by, verified_at,
//             rejection_reason, admin_notes
//
// Wire format is `multipart/form-data` with optional `file` field. The
// server handles image files via the image pipeline (1200×1600 webp) and
// non-images (PDF) via raw upload preserving extension.
// ═══════════════════════════════════════════════════════════════════════

export type DocumentVerificationStatus =
  | 'pending' | 'under_review' | 'verified' | 'rejected' | 'expired' | 'reupload';

export interface UserDocument {
  id?:                   number;
  user_id?:              number;
  document_type_id:      number;
  /**
   * FK to `documents.id` — the specific document within the chosen type
   * (e.g. type="Identity" → document="Aadhaar Card"). The profile picker
   * now treats this as required-after-type-selection, so users always
   * upload a row tied to a real master document name.
   */
  document_id?:          number | null;
  document_number?:      string | null;
  file?:                 string | null;   // URL set by server after upload
  issue_date?:           string | null;   // YYYY-MM-DD
  expiry_date?:          string | null;
  // Admin-managed (read-only on self-service):
  verification_status?:  DocumentVerificationStatus;
  rejection_reason?:     string | null;
  admin_notes?:          string | null;
  verified_at?:          string | null;
  // Server-joined master rows + audit:
  document_type?: Pick<DocumentType, 'id' | 'name'>;
  document?:      Pick<MasterDocument, 'id' | 'name'>;
  created_at?:    string;
  updated_at?:    string;
}

export async function listDocuments(): Promise<UserDocument[]> {
  return call<UserDocument[]>('/user-documents/me');
}

/**
 * POST /user-documents/me — multipart create. `file` is required for a
 * meaningful row (otherwise you'd just have a type + number pointer).
 * `document_type_id` is required; `document_id` is the specific master
 * document FK once the user picks one.
 */
export async function addDocument(
  payload: Omit<UserDocument, 'id' | 'user_id' | 'file' | 'verification_status'
    | 'rejection_reason' | 'admin_notes' | 'verified_at'
    | 'document_type' | 'document' | 'created_at' | 'updated_at'>,
  file?: File | null,
): Promise<UserDocument> {
  const fd = buildFormData(payload as unknown as Record<string, unknown>, 'file', file);
  return callMultipart<UserDocument>('/user-documents/me', fd, 'POST');
}

/**
 * PATCH /user-documents/me/:id — multipart update. The server strips
 * verification_status / rejection_reason / admin_notes from the body
 * on self-service so admins keep control of those fields.
 */
export async function updateDocument(
  id: number,
  patch: Partial<Omit<UserDocument, 'id' | 'user_id' | 'file' | 'verification_status'
    | 'rejection_reason' | 'admin_notes' | 'verified_at'
    | 'document_type' | 'document' | 'created_at' | 'updated_at'>>,
  file?: File | null,
): Promise<UserDocument> {
  const fd = buildFormData(patch as unknown as Record<string, unknown>, 'file', file);
  return callMultipart<UserDocument>(`/user-documents/me/${id}`, fd, 'PATCH');
}

export async function deleteDocument(id: number): Promise<void> {
  await call(`/user-documents/me/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════════════
// /user-badges — read-only (awarded by the backend)
// ═══════════════════════════════════════════════════════════════════════

export interface UserBadge {
  id:          number;
  badge_name:  string;
  description?: string | null;
  icon_url?:   string | null;
  awarded_at:  string;
}

export async function listBadges(): Promise<UserBadge[]> {
  return call<UserBadge[]>('/user-badges/me');
}

// ═══════════════════════════════════════════════════════════════════════
// Public lookup tables — countries / states / cities / social_medias
//
// All four endpoints are public GETs (no auth required) used to populate
// dropdowns on the profile page. The bare list paths return paginated
// responses; pass `limit=N` and `is_active=true` to get a clean active
// set in one round-trip.
// ═══════════════════════════════════════════════════════════════════════

export interface Country {
  id:                number;
  name:              string;
  iso2?:             string | null;
  iso3?:             string | null;
  phone_code?:       string | null;
  currency?:         string | null;
  currency_symbol?:  string | null;
  flag_image?:       string | null;
  is_active?:        boolean;
  sort_order?:       number;
}
export interface State {
  id:           number;
  country_id:   number;
  name:         string;
  state_code?:  string | null;
  is_active?:   boolean;
  sort_order?:  number;
}
export interface City {
  id:        number;
  state_id:  number;
  name:      string;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * GET /countries?is_active=true — full list, sorted by name.
 *
 * Server's `maxLimit` for this endpoint is 500 (`country.controller.ts`).
 * 500 is plenty — ISO 3166-1 has ~250 territories.
 */
export async function listCountries(): Promise<Country[]> {
  return call<Country[]>('/countries?is_active=true&limit=500&sort=name&ascending=true');
}

/**
 * GET /states?country_id=X&is_active=true
 *
 * Server's `maxLimit` is 500. Even India (largest state count) has ~36.
 */
export async function listStates(countryId: number): Promise<State[]> {
  return call<State[]>(`/states?country_id=${countryId}&is_active=true&limit=500&sort=name&ascending=true`);
}

/**
 * GET /cities?state_id=X&is_active=true
 *
 * Server's `maxLimit` is 2000 to fit large states (Tamil Nadu ~891 cities,
 * UP ~688). Without this, the dropdown would silently truncate at 100 rows.
 */
export async function listCities(stateId: number): Promise<City[]> {
  return call<City[]>(`/cities?state_id=${stateId}&is_active=true&limit=2000&sort=name&ascending=true`);
}

/**
 * One row in the master `social_medias` table. Used to populate the
 * platform picker in `<SocialMediaList>`. The `code` field is the
 * canonical short identifier we send back to the server when creating
 * a `user_social_medias` row (e.g. 'linkedin', 'github').
 */
export interface SocialMediaPlatform {
  id:             number;
  name:           string;          // 'LinkedIn', 'GitHub', …
  code:           string;          // 'linkedin', 'github', …
  base_url?:      string | null;
  icon?:          string | null;
  placeholder?:   string | null;
  platform_type?: string | null;   // 'social' | 'professional' | 'code' | …
  is_active?:     boolean;
  display_order?: number;
}

/** GET /social-medias?is_active=true — master platform list for the picker. */
export async function listSocialMediaPlatforms(): Promise<SocialMediaPlatform[]> {
  return call<SocialMediaPlatform[]>('/social-medias?is_active=true&limit=50&sort=display_order&ascending=true');
}

// ═══════════════════════════════════════════════════════════════════════
// /instructor-profiles/me — instructor-only extended profile
// ═══════════════════════════════════════════════════════════════════════

export interface InstructorProfile {
  id?:                  number;
  user_id?:             number;
  expertise?:           string | null;
  teaching_languages?:  string | null;  // comma-sep or JSON array
  years_teaching?:      number | null;
  total_students?:      number;          // server-computed
  total_courses?:       number;          // server-computed
  average_rating?:      number | null;   // server-computed
  is_verified?:         boolean;
  is_featured?:         boolean;
  paypal_email?:        string | null;
  stripe_account_id?:   string | null;
  created_at?:          string;
  updated_at?:          string;
}

export async function getInstructorProfile(): Promise<InstructorProfile> {
  return call<InstructorProfile>('/instructor-profiles/me');
}
export async function updateInstructorProfile(patch: Partial<InstructorProfile>): Promise<InstructorProfile> {
  return call<InstructorProfile>('/instructor-profiles/me', { method: 'PUT', body: patch });
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

/**
 * Merge `/users/me` fields into the cached `AuthUser` shape. Keeps the
 * AuthProvider clean — instead of repeating the picking logic in two
 * places (login + hydration) we centralise it here.
 */
export function meToAuthUser(me: MeResponse, base: AuthUser): AuthUser {
  return {
    ...base,
    id:                 me.id ?? base.id,
    first_name:         me.first_name ?? base.first_name,
    last_name:          me.last_name ?? base.last_name,
    email:              me.email ?? base.email,
    mobile:             me.mobile ?? base.mobile,
    display_name:       me.display_name ?? base.display_name ?? null,
    roles:              me.roles,
    max_role_level:     me.max_role_level,
    profile_image_url:  me.profile_image_url ?? me.avatar_url ?? null,
  };
}
