'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { updateMyProfile, type UserProfile } from '@/lib/users/client';
import { FieldError } from '@/components/ui/FieldError';
import {
  validateAadhaar, validatePAN, validatePassport,
  validateIFSC, validateUPI, validateBankAccountNumber,
  validateMaxLen,
} from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * KYC + Bank card — sensitive instructor/admin-only fields stored on
 * `user_profiles`. Reveal-confirmation gate prevents shoulder-surfing
 * (someone glancing at the screen can't read the Aadhaar / PAN /
 * account number without an explicit tap).
 *
 * UX
 *   • Each sensitive field shows a masked preview (last 4 chars).
 *   • Tapping "Reveal" flips the input to its real value AND focuses it
 *     so the user can immediately edit.
 *   • Per-field validation via the shared `lib/auth/validation` helpers:
 *     Aadhaar (12 digits) · PAN (5L+4D+1L) · Passport (Indian)
 *     · IFSC (`XXXX0YYYYYY`) · UPI (`name@bank`) · bank account (9-18 digits).
 *   • A "Save KYC + Bank" button at the bottom PUTs the whole patch
 *     in one round-trip (server treats `/user-profiles/me` as upsert).
 */

export function KycBankCard({
  profile, onSaved,
}: { profile: UserProfile | null; onSaved: (next: UserProfile) => void }) {
  // KYC
  const [aadhaar, setAadhaar]   = useState(profile?.aadhar_number ?? '');
  const [pan,     setPan]       = useState(profile?.pan_number ?? '');
  const [passport,setPassport]  = useState(profile?.passport_number ?? '');
  // Bank
  const [holder,  setHolder]    = useState(profile?.bank_account_name ?? '');
  const [bankName,setBankName]  = useState(profile?.bank_name ?? '');
  const [account, setAccount]   = useState(profile?.bank_account_number ?? '');
  const [ifsc,    setIfsc]      = useState(profile?.bank_ifsc_code ?? '');
  const [upi,     setUpi]       = useState(profile?.upi_id ?? '');

  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!profile) return;
    setAadhaar(profile.aadhar_number ?? '');
    setPan(profile.pan_number ?? '');
    setPassport(profile.passport_number ?? '');
    setHolder(profile.bank_account_name ?? '');
    setBankName(profile.bank_name ?? '');
    setAccount(profile.bank_account_number ?? '');
    setIfsc(profile.bank_ifsc_code ?? '');
    setUpi(profile.upi_id ?? '');
  }, [profile]);

  function toggle(key: string) {
    setRevealed((r) => ({ ...r, [key]: !r[key] }));
  }

  /**
   * Run the full validation pass. Every field is optional (this card
   * is filled out gradually as KYC documents arrive), so empty values
   * always pass — only malformed ones flag.
   */
  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    const a = validateAadhaar(aadhaar); if (!a.ok) errs.aadhaar = a.msg;
    const p = validatePAN(pan);         if (!p.ok) errs.pan = p.msg;
    const pp = validatePassport(passport); if (!pp.ok) errs.passport = pp.msg;
    const acct = validateBankAccountNumber(account); if (!acct.ok) errs.account = acct.msg;
    const i = validateIFSC(ifsc);       if (!i.ok) errs.ifsc = i.msg;
    const u = validateUPI(upi);         if (!u.ok) errs.upi = u.msg;
    const h = validateMaxLen(holder, 100, 'Account holder name'); if (!h.ok) errs.holder = h.msg;
    const bn = validateMaxLen(bankName, 100, 'Bank name'); if (!bn.ok) errs.bankName = bn.msg;
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
      const next = await updateMyProfile({
        aadhar_number:       aadhaar.replace(/\s/g, '') || null,
        pan_number:          pan?.toUpperCase() || null,
        passport_number:     passport?.toUpperCase() || null,
        bank_account_name:   holder || null,
        bank_name:           bankName || null,
        bank_account_number: account || null,
        bank_ifsc_code:      ifsc?.toUpperCase() || null,
        upi_id:              upi || null,
      });
      onSaved(next);
      setSaved(true); setTimeout(() => setSaved(false), 2200);
      setRevealed({}); // re-mask after save
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally { setSaving(false); }
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

      <div className="mb-3 flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[12.5px] text-amber-800">
        <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
        <span>These details are required for instructor payouts (Phase 9 — TDS 194-O compliance). They're masked by default; reveal each field to edit.</span>
      </div>

      <Group title="Identity">
        <Sensitive
          label="Aadhaar number"
          value={aadhaar}
          onChange={(v) => setAadhaar(v.replace(/[^\d\s]/g, ''))}
          onBlur={blurValidate}
          revealed={!!revealed['aadhaar']}
          onReveal={() => toggle('aadhaar')}
          error={fieldErrors.aadhaar}
          placeholder="12 digits, e.g. 1234 5678 9012"
        />
        <Sensitive
          label="PAN"
          value={pan}
          onChange={(v) => setPan(v.toUpperCase())}
          onBlur={blurValidate}
          revealed={!!revealed['pan']}
          onReveal={() => toggle('pan')}
          error={fieldErrors.pan}
          placeholder="ABCDE1234F"
          maxLength={10}
        />
        <Sensitive
          label="Passport number"
          value={passport}
          onChange={(v) => setPassport(v.toUpperCase())}
          onBlur={blurValidate}
          revealed={!!revealed['passport']}
          onReveal={() => toggle('passport')}
          error={fieldErrors.passport}
          placeholder="A1234567 (optional)"
          maxLength={20}
        />
      </Group>

      <Group title="Bank account">
        <Field label="Account holder name">
          <input
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            onBlur={blurValidate}
            maxLength={100}
            aria-invalid={!!fieldErrors.holder}
            className={cn(inputCls, fieldErrors.holder && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            placeholder="As per bank records"
          />
          <FieldError message={fieldErrors.holder} />
        </Field>
        <Field label="Bank name">
          <input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            onBlur={blurValidate}
            maxLength={100}
            aria-invalid={!!fieldErrors.bankName}
            className={cn(inputCls, fieldErrors.bankName && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            placeholder="e.g. HDFC Bank"
          />
          <FieldError message={fieldErrors.bankName} />
        </Field>
        <Sensitive
          label="Account number"
          value={account}
          onChange={(v) => setAccount(v.replace(/\D/g, ''))}
          onBlur={blurValidate}
          revealed={!!revealed['account']}
          onReveal={() => toggle('account')}
          error={fieldErrors.account}
          placeholder="9 to 18 digits"
          maxLength={18}
        />
        <Field label="IFSC code">
          <input
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
            onBlur={blurValidate}
            maxLength={11}
            aria-invalid={!!fieldErrors.ifsc}
            className={cn(inputCls, 'uppercase tracking-wider', fieldErrors.ifsc && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            placeholder="ABCD0123456"
          />
          <FieldError message={fieldErrors.ifsc} />
        </Field>
        <Field label="UPI ID">
          <input
            value={upi}
            onChange={(e) => setUpi(e.target.value)}
            onBlur={blurValidate}
            maxLength={100}
            aria-invalid={!!fieldErrors.upi}
            className={cn(inputCls, fieldErrors.upi && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            placeholder="name@bank"
          />
          <FieldError message={fieldErrors.upi} />
        </Field>
      </Group>

      <div className="mt-4 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[13px] font-bold shadow-btn disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? 'Saved' : 'Save KYC + Bank'}
        </button>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">{title}</div>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
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

function Sensitive({
  label, value, onChange, onBlur, revealed, onReveal,
  placeholder, error, maxLength,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  onBlur?:     () => void;
  revealed:    boolean;
  onReveal:    () => void;
  placeholder?: string;
  error?:      string;
  maxLength?:  number;
}) {
  const masked = value && !revealed
    ? '•'.repeat(Math.max(0, value.length - 4)) + value.slice(-4)
    : '';
  return (
    <Field label={label}>
      <div className="relative">
        <input
          value={revealed ? value : masked}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          maxLength={maxLength}
          aria-invalid={!!error}
          placeholder={placeholder}
          readOnly={!revealed && !!value}
          className={cn(
            inputCls,
            !revealed && value && 'text-slate-400 font-mono tracking-widest pr-10',
            error && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400',
          )}
        />
        <button
          type="button"
          onClick={onReveal}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          aria-label={revealed ? 'Hide' : 'Reveal'}
          title={revealed ? 'Hide' : 'Reveal'}
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <FieldError message={error} />
    </Field>
  );
}

const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
