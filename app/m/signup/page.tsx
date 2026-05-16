'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { PasswordField } from '@/components/auth/PasswordField';
import { RolePicker, type SignupRole } from '@/components/auth/RolePicker';
import { register, AuthApiError } from '@/lib/auth/client';
import {
  validateName, validateEmail, validateMobile, validatePassword,
  sanitizeName, sanitizeMobile, combine,
} from '@/lib/auth/validation';

// `useSearchParams()` suspends — wrap the implementation in <Suspense>.
export default function MobileSignupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  // Same `?next=` forwarding as the desktop signup page — keeps the
  // post-signup → login → original-page chain intact.
  const params  = useSearchParams();
  const next    = params?.get('next') || '';
  const loginHref = next ? `/m/login?next=${encodeURIComponent(next)}` : '/m/login';
  const [role,      setRole]      = useState<SignupRole>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [mobile,    setMobile]    = useState('');
  const [password,  setPassword]  = useState('');
  const [agree,     setAgree]     = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErr,  setFieldErr]  = useState<Record<string, string | undefined>>({});

  function check(): boolean {
    const errs: Record<string, string | undefined> = {};
    errs.firstName = validateName(firstName, 'First name').msg;
    errs.lastName  = validateName(lastName, 'Last name').msg;
    errs.email     = validateEmail(email).msg;
    errs.mobile    = validateMobile(mobile).msg;
    errs.password  = validatePassword(password).msg;
    setFieldErr(errs);
    const r = combine(
      validateName(firstName, 'First name'),
      validateName(lastName, 'Last name'),
      validateEmail(email),
      validateMobile(mobile),
      validatePassword(password),
    );
    if (!r.ok) { setError(r.msg!); return false; }
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
        mobile:     mobile.trim(),
        password,
        role,
      });
      const qs = new URLSearchParams({ pid: r.pending_id, email: r.email, mobile: r.mobile, role });
      router.push(`/m/verify-email?${qs.toString()}`);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 py-6 min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white">
      <h1 className="heading text-2xl font-extrabold text-slate-900 leading-tight">Create your account</h1>
      <p className="mt-1 text-[13px] text-slate-600">Pick how you&apos;ll use the platform.</p>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-3.5">
        <RolePicker value={role} onChange={setRole} compact />

        <div className="grid grid-cols-2 gap-2.5">
          <FieldGroup error={fieldErr.firstName}>
            <Field icon={<User className="h-4 w-4 text-slate-400" />}>
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
          </FieldGroup>
          <FieldGroup error={fieldErr.lastName}>
            <Field icon={<User className="h-4 w-4 text-slate-400" />}>
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
          </FieldGroup>
        </div>

        <FieldGroup error={fieldErr.email}>
          <Field icon={<Mail className="h-4 w-4 text-slate-400" />}>
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
        </FieldGroup>

        <FieldGroup error={fieldErr.mobile}>
          <Field icon={<Phone className="h-4 w-4 text-slate-400" />}>
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
        </FieldGroup>

        <FieldGroup error={fieldErr.password}>
          <PasswordField
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setFieldErr((p) => ({ ...p, password: validatePassword(password).msg }))}
            placeholder="Password (8–20 chars)"
            withStrength
            maxLength={20}
          />
        </FieldGroup>

        <label className="flex items-start gap-2 text-[11.5px] text-slate-600">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="rounded accent-brand-500 mt-0.5" />
          I agree to the <Link href="/m/help" className="text-brand-700">Terms</Link> and <Link href="/m/help" className="text-brand-700">Privacy</Link>.
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-3 text-sm font-semibold shadow-btn active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTPs <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-slate-600">
        Already have an account? <Link href={loginHref} className="text-brand-700 font-semibold">Sign in</Link>
      </p>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400">
      {icon}
      {children}
    </div>
  );
}

function FieldGroup({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div>
      <div className={error ? '[&_div]:!border-rose-300 [&_div]:focus-within:!ring-rose-200 [&_div]:focus-within:!border-rose-400' : ''}>
        {children}
      </div>
      {error && <div className="mt-1 text-[11px] text-rose-600">{error}</div>}
    </div>
  );
}
