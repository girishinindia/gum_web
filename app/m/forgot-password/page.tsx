'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { forgotPassword, AuthApiError } from '@/lib/auth/client';
import { sanitizeMobile, validateEmail, validateMobile } from '@/lib/auth/validation';

export default function MobileForgotPasswordPage() {
  const router = useRouter();
  const [email,  setEmail]  = useState('');
  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const eOk = validateEmail(email);
    if (!eOk.ok) { setError(eOk.msg!); return; }
    const mOk = validateMobile(mobile);
    if (!mOk.ok) { setError(mOk.msg!); return; }
    setSubmitting(true);
    try {
      const r = await forgotPassword({ email: email.trim().toLowerCase(), mobile: mobile.trim() });
      const qs = new URLSearchParams({ rid: r.reset_pending_id ?? '', email: r.email, mobile: r.mobile });
      router.push(`/m/reset-password?${qs.toString()}`);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 py-6 min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white">
      <Link href="/m/login" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </Link>
      <h1 className="mt-4 heading text-2xl font-extrabold text-slate-900">Reset your password</h1>
      <p className="mt-1 text-[13px] text-slate-600">Enter the email AND mobile on your account. We&apos;ll send a 6-digit code to each.</p>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Email</label>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400">
            <Mail className="h-4 w-4 text-slate-400" />
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Mobile</label>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400">
            <Phone className="h-4 w-4 text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-500 pr-1 select-none">+91</span>
            <input type="tel" inputMode="numeric" autoComplete="tel-national" value={mobile} onChange={(e) => setMobile(sanitizeMobile(e.target.value))} maxLength={10} className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="10-digit mobile number" />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-3 text-sm font-semibold shadow-btn active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTPs <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </div>
  );
}
