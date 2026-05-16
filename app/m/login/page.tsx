'use client';

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { PasswordField } from '@/components/auth/PasswordField';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthApiError } from '@/lib/auth/client';

export default function MobileLoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const next   = params?.get('next') || '/m';
  // ?registered=1 → success banner after fresh signup (mobile twin of
  // the desktop login behaviour).
  const justRegistered = params?.get('registered') === '1';
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const id = identifier.trim();
    if (!id) { setError('Enter your email or mobile.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    const digitsOnly = id.replace(/\D/g, '');
    if (!id.includes('@') && digitsOnly.length > 0 && digitsOnly.length !== 10 && digitsOnly.length !== 12) {
      setError('Mobile must be 10 digits.'); return;
    }
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 py-6 min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white">
      <h1 className="heading text-2xl font-extrabold text-slate-900 leading-tight">
        Welcome <span className="text-gradient">back</span>
      </h1>
      <p className="mt-1 text-[13px] text-slate-600">Sign in to continue learning.</p>

      {justRegistered && !error && (
        <div className="mt-5 flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-[12.5px] text-emerald-700">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Account verified. Log in to continue.</span>
        </div>
      )}
      {error && (
        <div role="alert" className="mt-5 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Email or mobile</label>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              placeholder="you@example.com or 10-digit mobile"
              maxLength={255}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[12px] font-semibold text-slate-700">Password</label>
            <Link href="/m/forgot-password" className="text-[11.5px] text-brand-700 font-semibold">Forgot?</Link>
          </div>
          <PasswordField
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-3 text-sm font-semibold shadow-btn active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-slate-600">
        New here? <Link href="/m/signup" className="text-brand-700 font-semibold">Create account</Link>
      </p>
    </div>
  );
}
