'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PasswordField } from '@/components/auth/PasswordField';
import { RolePicker, type SignupRole } from '@/components/auth/RolePicker';
import { register, AuthApiError } from '@/lib/auth/client';
import {
  validateName, validateEmail, validateMobile, validatePassword,
  sanitizeName, sanitizeMobile, combine,
} from '@/lib/auth/validation';

/**
 * Signup page — three logical sections in one screen:
 *   1. Role picker (Student / Instructor) — UI-only hint today (API
 *      doesn't yet differentiate; everyone lands as `users.type='student'`).
 *   2. Profile fields with live validation.
 *   3. Submit → POST /auth/register → /verify-email?pid=…&role=…
 */
// `useSearchParams()` suspends — Next 14+ requires the consumer be
// wrapped in <Suspense>. We keep the original implementation as
// `<SignupInner>` and add a thin top-level wrapper.
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  // Preserve `?next=` across the signup → login round-trip so a user
  // who landed on /signup from /courses can flip to "Sign in" and
  // still come back to /courses after they authenticate.
  const params  = useSearchParams();
  const next    = params?.get('next') || '';
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
  const [role, setRole]             = useState<SignupRole>('student');
  const [firstName, setFirstName]   = useState('');
  const [lastName,  setLastName]    = useState('');
  const [email,     setEmail]       = useState('');
  const [mobile,    setMobile]      = useState('');
  const [password,  setPassword]    = useState('');
  const [agree,     setAgree]       = useState(false);
  const [error,     setError]       = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Per-field errors surface only after the user blurs / submits — avoids
  // shouting "required" the instant the form appears.
  const [fieldErr, setFieldErr] = useState<Record<string, string | undefined>>({});

  function check(): boolean {
    const errs: Record<string, string | undefined> = {};
    const r = combine(
      validateName(firstName, 'First name'),
      validateName(lastName,  'Last name'),
      validateEmail(email),
      validateMobile(mobile),
      validatePassword(password),
    );
    if (!validateName(firstName, 'First name').ok) errs.firstName = validateName(firstName, 'First name').msg;
    if (!validateName(lastName,  'Last name').ok)  errs.lastName  = validateName(lastName, 'Last name').msg;
    if (!validateEmail(email).ok)                  errs.email     = validateEmail(email).msg;
    if (!validateMobile(mobile).ok)                errs.mobile    = validateMobile(mobile).msg;
    if (!validatePassword(password).ok)            errs.password  = validatePassword(password).msg;
    setFieldErr(errs);
    if (!r.ok) { setError(r.msg ?? 'Please fix the highlighted fields.'); return false; }
    if (!agree) { setError('Please accept the Terms and Privacy Policy.'); return false; }
    setError(null);
    return true;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!check()) return;
    setSubmitting(true);
    try {
      const r = await register({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        email:      email.trim().toLowerCase(),
        mobile:     mobile.trim(),  // 10-digit; server normalizes to +91…
        password,
        role,
      });
      const qs = new URLSearchParams({ pid: r.pending_id, email: r.email, mobile: r.mobile, role });
      router.push(`/verify-email?${qs.toString()}`);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="heading text-3xl text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Choose how you&apos;ll use the platform, then fill in your details.</p>

      {error && (
        <div role="alert" className="mt-5 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-2">I am joining as a</label>
          <RolePicker value={role} onChange={setRole} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field icon={<User className="h-4 w-4 text-slate-400" />} label="First name" error={fieldErr.firstName}>
            <input
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(sanitizeName(e.target.value))}
              onBlur={() => setFieldErr((p) => ({ ...p, firstName: validateName(firstName, 'First name').msg }))}
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              placeholder="First name"
              maxLength={20}
            />
          </Field>
          <Field icon={<User className="h-4 w-4 text-slate-400" />} label="Last name" error={fieldErr.lastName}>
            <input
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(sanitizeName(e.target.value))}
              onBlur={() => setFieldErr((p) => ({ ...p, lastName: validateName(lastName, 'Last name').msg }))}
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              placeholder="Last name"
              maxLength={20}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field icon={<Mail className="h-4 w-4 text-slate-400" />} label="Email" error={fieldErr.email}>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setFieldErr((p) => ({ ...p, email: validateEmail(email).msg }))}
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              placeholder="you@example.com"
              maxLength={255}
            />
          </Field>
          <Field icon={<Phone className="h-4 w-4 text-slate-400" />} label="Mobile" error={fieldErr.mobile}>
            <span className="text-[12px] font-semibold text-slate-500 pr-1 select-none">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={mobile}
              onChange={(e) => setMobile(sanitizeMobile(e.target.value))}
              onBlur={() => setFieldErr((p) => ({ ...p, mobile: validateMobile(mobile).msg }))}
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              placeholder="10-digit mobile number"
              maxLength={10}
            />
          </Field>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Password</label>
          <PasswordField
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setFieldErr((p) => ({ ...p, password: validatePassword(password).msg }))}
            placeholder="8–20 characters"
            withStrength
            maxLength={20}
          />
          {fieldErr.password && (
            <div className="mt-1 text-[11.5px] text-rose-600">{fieldErr.password}</div>
          )}
        </div>

        <label className="flex items-start gap-2 text-[12.5px] text-slate-600 cursor-pointer">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="rounded accent-brand-500 mt-0.5" />
          I agree to the <Link href="/terms" className="text-brand-700 hover:underline">Terms</Link> and <Link href="/privacy" className="text-brand-700 hover:underline">Privacy Policy</Link>.
        </label>

        <Button type="submit" variant="primary" className="w-full rounded-full mt-3" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send verification OTPs <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        Already have an account? <Link href={loginHref} className="text-brand-700 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

function Field({
  icon, label, error, children,
}: {
  icon:     React.ReactNode;
  label:    string;
  error?:   string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className={`flex items-center gap-2 rounded-sm border ${error ? 'border-rose-300 focus-within:ring-rose-200 focus-within:border-rose-400' : 'border-slate-200 focus-within:ring-brand-200 focus-within:border-brand-400'} bg-white px-3 focus-within:ring-2`}>
        {icon}
        {children}
      </div>
      {error && <div className="mt-1 text-[11.5px] text-rose-600">{error}</div>}
    </div>
  );
}
