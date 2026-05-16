/**
 * Shared client-side validation for auth + profile forms.
 *
 * Every helper returns `{ ok: true }` on success or `{ ok: false, msg: '…' }`
 * on failure. The message is user-facing — copy it straight into the UI.
 *
 * Rules align with what the gum_api server-side Zod schemas accept so
 * passes here don't get rejected at the server later:
 *
 *   • name      — letters / spaces / hyphens / apostrophes only · 2–20 chars
 *   • email     — RFC-pragmatic regex · trimmed · lowercased
 *   • mobile    — exactly 10 digits (UI requirement; server's
 *                 normalizeMobile() prepends +91 before storing)
 *   • password  — 8–20 chars  (server requires min 8 · we cap at 20 in
 *                 the UI for friendliness; server's own max is 128)
 */

export interface ValidationResult { ok: boolean; msg?: string; }

const NAME_RE   = /^[A-Za-z][A-Za-z\s'-]{0,19}$/; // first char must be a letter
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(value: string, fieldLabel = 'Name'): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: false, msg: `${fieldLabel} is required.` };
  if (v.length < 2) return { ok: false, msg: `${fieldLabel} must be at least 2 characters.` };
  if (v.length > 20) return { ok: false, msg: `${fieldLabel} must be at most 20 characters.` };
  if (!NAME_RE.test(v)) return { ok: false, msg: `${fieldLabel} can only contain letters.` };
  return { ok: true };
}

export function validateEmail(value: string): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: false, msg: 'Email is required.' };
  if (!EMAIL_RE.test(v)) return { ok: false, msg: 'Enter a valid email address.' };
  if (v.length > 255) return { ok: false, msg: 'Email is too long.' };
  return { ok: true };
}

/**
 * Mobile must be **exactly 10 digits** (Indian mobile number length).
 * The UI strips any non-digit input before reaching this validator;
 * server's `normalizeMobile()` adds the `+91` country code when storing.
 */
export function validateMobile(value: string): ValidationResult {
  const v = (value ?? '').replace(/\D/g, '');
  if (!v) return { ok: false, msg: 'Mobile number is required.' };
  if (v.length !== 10) return { ok: false, msg: 'Mobile must be exactly 10 digits.' };
  if (!/^[6-9]/.test(v)) return { ok: false, msg: 'Mobile must start with 6, 7, 8, or 9.' };
  return { ok: true };
}

export function validatePassword(value: string): ValidationResult {
  const v = value ?? '';
  if (!v) return { ok: false, msg: 'Password is required.' };
  if (v.length < 8) return { ok: false, msg: 'Password must be at least 8 characters.' };
  if (v.length > 20) return { ok: false, msg: 'Password must be at most 20 characters.' };
  return { ok: true };
}

/**
 * Strip any non-digit character and clamp to 10 digits.
 * Use as the canonical onChange transform for mobile inputs.
 */
export function sanitizeMobile(raw: string, maxLen = 10): string {
  return (raw ?? '').replace(/\D/g, '').slice(0, maxLen);
}

/**
 * Strip digits and special chars from name inputs as the user types.
 * Lets through letters, space, hyphen, apostrophe. Trims to 20 chars.
 */
export function sanitizeName(raw: string, maxLen = 20): string {
  return (raw ?? '').replace(/[^A-Za-z\s'-]/g, '').slice(0, maxLen);
}

/**
 * Combine multiple results — returns the first failing one, or `{ ok: true }`.
 */
export function combine(...checks: ValidationResult[]): ValidationResult {
  for (const c of checks) if (!c.ok) return c;
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════
// Profile-form validators (added with profile-v6 validation pass)
//
// Every helper follows the same `(value, opts?) => ValidationResult`
// contract so they compose cleanly with `combine(...)`. Most accept an
// optional `label` so the error message reads naturally for whichever
// field is calling — e.g. validateMaxLen(v, 500, 'Institution name').
// ═══════════════════════════════════════════════════════════════════════

// ── India-specific identity regex (verbatim from server Zod where they
//    exist). Centralised here so every form reads the same source.
const PAN_RE      = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_RE  = /^[0-9]{12}$/;
const IFSC_RE     = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
const UPI_RE      = /^[\w.\-]{2,256}@[\w]{2,64}$/;
const PIN_RE      = /^[1-9][0-9]{5}$/;
const PASSPORT_RE = /^[A-PR-WY][1-9]\d{6}[1-9]$/i;
const URL_RE      = /^https?:\/\/[^\s/$.?#][^\s]*$/i;

// ── Generic helpers ─────────────────────────────────────────────────

/** Trim-aware required check. Empty / whitespace-only fails. */
export function validateRequired(value: string | number | null | undefined, label = 'This field'): ValidationResult {
  if (value === null || value === undefined) return { ok: false, msg: `${label} is required.` };
  if (typeof value === 'number') return Number.isFinite(value) ? { ok: true } : { ok: false, msg: `${label} is required.` };
  return value.trim().length > 0 ? { ok: true } : { ok: false, msg: `${label} is required.` };
}

/** Caps the visible length. Empty values pass — combine with `validateRequired` for required fields. */
export function validateMaxLen(value: string | null | undefined, max: number, label = 'This field'): ValidationResult {
  const v = value ?? '';
  if (v.length > max) return { ok: false, msg: `${label} must be at most ${max} characters.` };
  return { ok: true };
}

/** Integer or numeric range. Empty / null pass (use `validateRequired` to require). */
export function validateNumberRange(
  value: number | string | null | undefined,
  min: number, max: number,
  label = 'Value',
  { integer = false }: { integer?: boolean } = {},
): ValidationResult {
  if (value === null || value === undefined || value === '') return { ok: true };
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return { ok: false, msg: `${label} must be a number.` };
  if (integer && !Number.isInteger(num)) return { ok: false, msg: `${label} must be a whole number.` };
  if (num < min || num > max) return { ok: false, msg: `${label} must be between ${min} and ${max}.` };
  return { ok: true };
}

// ── Format validators ──────────────────────────────────────────────

/** http:// or https:// URL with at least one character after the scheme. Empty passes. */
export function validateUrl(value: string | null | undefined, label = 'URL'): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  if (!URL_RE.test(v)) return { ok: false, msg: `${label} must start with http:// or https:// (e.g. https://example.com).` };
  if (v.length > 1000) return { ok: false, msg: `${label} is too long.` };
  return { ok: true };
}

/**
 * Indian PAN — `5 letters + 4 digits + 1 letter` (auto-uppercased).
 * Empty passes (so optional fields don't trip on absence).
 */
export function validatePAN(value: string | null | undefined): ValidationResult {
  const v = (value ?? '').trim().toUpperCase();
  if (!v) return { ok: true };
  if (!PAN_RE.test(v)) return { ok: false, msg: 'PAN format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F).' };
  return { ok: true };
}

/**
 * Indian Aadhaar — exactly 12 digits. Strips any whitespace the user
 * typed (Aadhaar prints in 4-4-4 groups) before validating.
 */
export function validateAadhaar(value: string | null | undefined): ValidationResult {
  const v = (value ?? '').replace(/\s/g, '');
  if (!v) return { ok: true };
  if (!AADHAAR_RE.test(v)) return { ok: false, msg: 'Aadhaar must be exactly 12 digits.' };
  return { ok: true };
}

/** Indian IFSC code — `XXXX0YYYYYY` (4 letters + 0 + 6 alphanumerics). Case-insensitive. */
export function validateIFSC(value: string | null | undefined): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  if (!IFSC_RE.test(v)) return { ok: false, msg: 'IFSC format: ABCD0123456 (4 letters + 0 + 6 chars).' };
  return { ok: true };
}

/** UPI handle `name@bank` shape. */
export function validateUPI(value: string | null | undefined): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  if (!UPI_RE.test(v)) return { ok: false, msg: 'UPI ID format: name@bank (e.g. anjali@oksbi).' };
  if (v.length > 100) return { ok: false, msg: 'UPI ID is too long.' };
  return { ok: true };
}

/** Indian PIN code — 6 digits, first digit non-zero. */
export function validatePostalCode(value: string | null | undefined, country?: string | null): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  // Only Indian PIN is regex-checked. Other countries pass length-only.
  const isIndia = (country ?? '').toLowerCase() === 'india' || (country ?? '').toUpperCase() === 'IN';
  if (isIndia) {
    if (!PIN_RE.test(v)) return { ok: false, msg: 'PIN code must be 6 digits and cannot start with 0.' };
  } else {
    if (v.length > 20) return { ok: false, msg: 'Postal code is too long.' };
  }
  return { ok: true };
}

/** Indian passport — 8 chars, first letter [A-PR-WY], then 7 digits with non-zero start+end. */
export function validatePassport(value: string | null | undefined): ValidationResult {
  const v = (value ?? '').trim().toUpperCase();
  if (!v) return { ok: true };
  if (!PASSPORT_RE.test(v)) return { ok: false, msg: 'Passport must be 8 characters (e.g. A1234567).' };
  return { ok: true };
}

/** Bank account number — digits only, 9–18 digits (covers most Indian banks). */
export function validateBankAccountNumber(value: string | null | undefined): ValidationResult {
  const v = (value ?? '').replace(/\s/g, '');
  if (!v) return { ok: true };
  if (!/^[0-9]{9,18}$/.test(v)) return { ok: false, msg: 'Account number must be 9 to 18 digits.' };
  return { ok: true };
}

// ── Date validators ────────────────────────────────────────────────

/**
 * Validate that a `YYYY-MM-DD` string is shaped correctly and falls
 * inside an optional window. All bounds are inclusive. Empty passes.
 *
 *   • `notFuture` — value cannot be after today (e.g. start_date, DOB)
 *   • `notPast`   — value cannot be before today (e.g. cert expiry)
 *   • `min` / `max` — explicit ISO date bounds
 */
export function validateDate(
  value: string | null | undefined,
  opts: { label?: string; notFuture?: boolean; notPast?: boolean; min?: string; max?: string } = {},
): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return { ok: false, msg: `${opts.label ?? 'Date'} is not a valid date.` };
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (opts.notFuture && date.getTime() > today.getTime()) {
    return { ok: false, msg: `${opts.label ?? 'Date'} cannot be in the future.` };
  }
  if (opts.notPast) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (date.getTime() < startOfToday.getTime()) {
      return { ok: false, msg: `${opts.label ?? 'Date'} cannot be in the past.` };
    }
  }
  if (opts.min && date.getTime() < new Date(opts.min).getTime()) {
    return { ok: false, msg: `${opts.label ?? 'Date'} must be on or after ${opts.min}.` };
  }
  if (opts.max && date.getTime() > new Date(opts.max).getTime()) {
    return { ok: false, msg: `${opts.label ?? 'Date'} must be on or before ${opts.max}.` };
  }
  return { ok: true };
}

/**
 * Cross-field date range — `end` must be on or after `start` when both
 * are present. If either side is empty (e.g. user is "currently
 * studying"), the check passes — call `validateDate` on each side
 * separately to enforce individual bounds.
 */
export function validateDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  { startLabel = 'Start date', endLabel = 'End date' }: { startLabel?: string; endLabel?: string } = {},
): ValidationResult {
  const s = (start ?? '').trim();
  const e = (end ?? '').trim();
  if (!s || !e) return { ok: true };
  const sd = new Date(s);
  const ed = new Date(e);
  if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) return { ok: true }; // shape errors caught by validateDate
  if (ed.getTime() < sd.getTime()) {
    return { ok: false, msg: `${endLabel} must be on or after ${startLabel.toLowerCase()}.` };
  }
  return { ok: true };
}

/** Date-of-birth sanity — between 13 and 120 years old. */
export function validateAge(
  value: string | null | undefined,
  { min = 13, max = 120 }: { min?: number; max?: number } = {},
): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  const dob = new Date(v);
  if (Number.isNaN(dob.getTime())) return { ok: false, msg: 'Date of birth is not a valid date.' };
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  if (age < min) return { ok: false, msg: `You must be at least ${min} years old.` };
  if (age > max) return { ok: false, msg: 'Date of birth looks invalid.' };
  if (dob.getTime() > today.getTime()) return { ok: false, msg: 'Date of birth cannot be in the future.' };
  return { ok: true };
}

// ── File validation ───────────────────────────────────────────────

/**
 * Validate an uploaded File against a max size (in MB) and an optional
 * MIME-type prefix allow-list (e.g. `['image/', 'application/pdf']`).
 * Pass `null` for "no file selected" — which yields ok:true so optional
 * file fields don't trip when empty.
 */
export function validateFile(
  file: File | null | undefined,
  { maxMB = 10, accept }: { maxMB?: number; accept?: string[] } = {},
): ValidationResult {
  if (!file) return { ok: true };
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) return { ok: false, msg: `File must be at most ${maxMB} MB.` };
  if (accept && accept.length > 0) {
    const ok = accept.some((prefix) => file.type.startsWith(prefix));
    if (!ok) return { ok: false, msg: 'File type not allowed.' };
  }
  return { ok: true };
}

// ── Grade helpers (Education) ─────────────────────────────────────

/**
 * Validate a grade string against the chosen grade_type. Empty passes.
 *   • percentage → 0–100, optional 1–2 decimal places
 *   • cgpa / gpa → 0–10, optional 1–2 decimal places
 *   • grade      → up to 4 chars, letters + plus/minus (e.g. A+, B-)
 *   • pass_fail  → must literally be "pass" or "fail" (case-insensitive)
 *   • other      → max 100 chars, no shape check
 */
export function validateGrade(
  value: string | null | undefined,
  gradeType: string | null | undefined,
): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  switch (gradeType) {
    case 'percentage': {
      const n = Number(v.replace('%', ''));
      if (!Number.isFinite(n) || n < 0 || n > 100) return { ok: false, msg: 'Percentage must be between 0 and 100.' };
      return { ok: true };
    }
    case 'cgpa':
    case 'gpa': {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || n > 10) return { ok: false, msg: `${gradeType.toUpperCase()} must be between 0 and 10.` };
      return { ok: true };
    }
    case 'grade': {
      if (!/^[A-Fa-f][+\-]?$/.test(v)) return { ok: false, msg: 'Grade must look like A, B+, C-, etc.' };
      return { ok: true };
    }
    case 'pass_fail': {
      if (!/^(pass|fail)$/i.test(v)) return { ok: false, msg: 'Enter "Pass" or "Fail".' };
      return { ok: true };
    }
    default:
      return validateMaxLen(v, 100, 'Grade');
  }
}

// ── Username / handle ─────────────────────────────────────────────

/** Social-media username — no whitespace, allowed `[a-zA-Z0-9._-]`, max 300. */
export function validateUsername(value: string | null | undefined): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  if (/\s/.test(v)) return { ok: false, msg: 'Username cannot contain spaces.' };
  if (!/^[A-Za-z0-9._\-@]+$/.test(v)) return { ok: false, msg: 'Username can only contain letters, digits, dots, hyphens, underscores or @.' };
  if (v.length > 300) return { ok: false, msg: 'Username is too long.' };
  return { ok: true };
}

// ── Document-number routing ───────────────────────────────────────

/**
 * Route document_number validation to the right format based on the
 * specific master document the user picked (e.g. `name === 'Aadhaar Card'`
 * → 12-digit check; PAN Card → PAN regex). Falls back to a generic
 * length check for unrecognised types. Empty passes (number is optional).
 */
export function validateDocumentNumber(
  value: string | null | undefined,
  docName: string | null | undefined,
): ValidationResult {
  const v = (value ?? '').trim();
  if (!v) return { ok: true };
  const name = (docName ?? '').toLowerCase();
  if (name.includes('pan')) return validatePAN(v);
  if (name.includes('aadhaar') || name.includes('aadhar')) return validateAadhaar(v);
  if (name.includes('passport')) return validatePassport(v);
  return validateMaxLen(v, 200, 'Document number');
}
