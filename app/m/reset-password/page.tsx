'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Phone, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2, RotateCw } from 'lucide-react';
import { OtpInput } from '@/components/auth/OtpInput';
import { PasswordField } from '@/components/auth/PasswordField';
import {
  AuthApiError, resendResetOtp, resetPassword, verifyResetOtp,
} from '@/lib/auth/client';
import { validatePassword } from '@/lib/auth/validation';

export default function MobileResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const rid          = params?.get('rid')    || '';
  const maskedEmail  = params?.get('email')  || '';
  const maskedMobile = params?.get('mobile') || '';

  const [emailOtp,  setEmailOtp]  = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailVer,  setEmailVer]  = useState(false);
  const [mobileVer, setMobileVer] = useState(false);
  const bothVerified = emailVer && mobileVer;

  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [submitting, setSubmitting] = useState<'email' | 'mobile' | 'final' | null>(null);
  const [resending,  setResending]  = useState<'email' | 'mobile' | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [info,       setInfo]       = useState<string | null>(null);

  async function verify(channel: 'email' | 'mobile', otp: string) {
    setSubmitting(channel);
    setError(null); setInfo(null);
    try {
      const r = await verifyResetOtp({ reset_pending_id: rid, channel, otp });
      if (channel === 'email')  setEmailVer(r.email_verified);
      if (channel === 'mobile') setMobileVer(r.mobile_verified);
      setInfo(r.can_reset_password ? 'Both verified. Set your new password.' : `${channel === 'email' ? 'Email' : 'Mobile'} verified.`);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Verification failed.');
      if (channel === 'email')  setEmailOtp('');
      if (channel === 'mobile') setMobileOtp('');
    } finally {
      setSubmitting(null);
    }
  }

  useEffect(() => { if (emailOtp.length === 6 && !emailVer && submitting !== 'email') void verify('email', emailOtp);   /* eslint-disable-next-line */ }, [emailOtp]);
  useEffect(() => { if (mobileOtp.length === 6 && !mobileVer && submitting !== 'mobile') void verify('mobile', mobileOtp); /* eslint-disable-next-line */ }, [mobileOtp]);

  async function resend(channel: 'email' | 'mobile') {
    setResending(channel);
    setError(null); setInfo(null);
    try { await resendResetOtp({ reset_pending_id: rid, channel }); setInfo(`OTP resent to ${channel}.`); }
    catch (err) { setError(err instanceof AuthApiError ? err.message : 'Could not resend.'); }
    finally { setResending(null); }
  }

  async function onFinal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setInfo(null);
    const v = validatePassword(newPwd);
    if (!v.ok) { setError(v.msg!); return; }
    if (newPwd !== confirmPwd) { setError('Passwords do not match.'); return; }
    setSubmitting('final');
    try {
      await resetPassword({ reset_pending_id: rid, new_password: newPwd });
      router.replace('/m/login?reset=1');
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Password reset failed.');
    } finally {
      setSubmitting(null);
    }
  }

  if (!rid) {
    return (
      <div className="px-5 py-6 min-h-screen">
        <h1 className="heading text-xl text-slate-900">Session expired</h1>
        <p className="mt-2 text-sm text-slate-600">Start the reset flow again.</p>
        <Link href="/m/forgot-password" className="mt-4 inline-flex rounded-full bg-brand-500 text-white px-4 py-2 text-sm font-semibold">Start over</Link>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white">
      <Link href="/m/login" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </Link>
      <h1 className="mt-4 heading text-2xl font-extrabold text-slate-900">Verify and reset</h1>
      <p className="mt-1 text-[13px] text-slate-600">Codes sent to <b>{maskedEmail}</b> and <b>{maskedMobile}</b>.</p>

      {error && <Banner kind="error" msg={error} />}
      {info  && <Banner kind="ok" msg={info} />}

      <div className="mt-5 space-y-6">
        <Row label="Email OTP"  icon={<Mail  className="h-4 w-4" />} masked={maskedEmail}
             value={emailOtp}  onChange={setEmailOtp}  verified={emailVer}  submitting={submitting==='email'}  resending={resending==='email'}  onResend={() => resend('email')} />
        <Row label="Mobile OTP" icon={<Phone className="h-4 w-4" />} masked={maskedMobile}
             value={mobileOtp} onChange={setMobileOtp} verified={mobileVer} submitting={submitting==='mobile'} resending={resending==='mobile'} onResend={() => resend('mobile')} />
      </div>

      <form onSubmit={onFinal} className="mt-7 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">New password</label>
          <PasswordField value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="8–20 characters" disabled={!bothVerified} withStrength maxLength={20} />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Confirm</label>
          <PasswordField value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Type it again" disabled={!bothVerified} maxLength={20} />
        </div>
        <button
          type="submit"
          disabled={!bothVerified || submitting === 'final'}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-3 text-sm font-semibold shadow-btn active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {submitting === 'final' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Set new password <ArrowRight className="h-4 w-4" /></>}
        </button>
        {!bothVerified && (
          <p className="text-[11.5px] text-slate-500 text-center">Verify both OTPs first.</p>
        )}
      </form>
    </div>
  );
}

function Banner({ kind, msg }: { kind: 'error' | 'ok'; msg: string }) {
  const cls = kind === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700';
  const Icon = kind === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div role={kind === 'error' ? 'alert' : undefined} className={`mt-4 flex items-start gap-2 rounded-md border px-3 py-2 text-[12.5px] ${cls}`}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" /> {msg}
    </div>
  );
}

interface RowProps {
  label: string; icon: React.ReactNode; masked: string;
  value: string; onChange: (n: string) => void;
  verified: boolean; submitting: boolean; resending: boolean; onResend: () => void;
}
function Row({ label, icon, masked, value, onChange, verified, submitting, resending, onResend }: RowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
          <span className={verified ? 'text-emerald-600' : 'text-brand-700'}>{icon}</span>
          {label}
          {verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">✓ Verified</span>}
          {!verified && masked && <span className="text-slate-400 font-normal">· {masked}</span>}
        </div>
        {!verified && (
          <button type="button" onClick={onResend} disabled={resending} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 active:scale-95 disabled:opacity-50">
            {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />} Resend
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <OtpInput value={value} onChange={onChange} verified={verified} disabled={submitting} />
        {submitting && <Loader2 className="h-4 w-4 animate-spin text-brand-600" />}
      </div>
    </div>
  );
}
