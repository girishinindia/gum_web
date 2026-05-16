'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Phone, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/auth/OtpInput';
import { PasswordField } from '@/components/auth/PasswordField';
import {
  AuthApiError, resendResetOtp, resetPassword, verifyResetOtp,
} from '@/lib/auth/client';
import { validatePassword } from '@/lib/auth/validation';

/**
 * Step 2+3 of forgot-password — dual-OTP verification followed by a new
 * password form. The form is disabled until both OTPs are accepted.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
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
  const [emailVerified,  setEmailVerified]  = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const bothVerified = emailVerified && mobileVerified;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [submitting,  setSubmitting]  = useState<'email' | 'mobile' | 'final' | null>(null);
  const [resending,   setResending]   = useState<'email' | 'mobile' | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [info,        setInfo]        = useState<string | null>(null);

  async function verify(channel: 'email' | 'mobile', otp: string) {
    setSubmitting(channel);
    setError(null);
    setInfo(null);
    try {
      const r = await verifyResetOtp({ reset_pending_id: rid, channel, otp });
      if (channel === 'email')  setEmailVerified(r.email_verified);
      if (channel === 'mobile') setMobileVerified(r.mobile_verified);
      setInfo(r.can_reset_password
        ? 'Both verified. Set your new password below.'
        : `${channel === 'email' ? 'Email' : 'Mobile'} verified. Verify the other channel to continue.`);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Verification failed.');
      if (channel === 'email')  setEmailOtp('');
      if (channel === 'mobile') setMobileOtp('');
    } finally {
      setSubmitting(null);
    }
  }

  useEffect(() => {
    if (emailOtp.length === 6 && !emailVerified && submitting !== 'email') void verify('email', emailOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailOtp]);
  useEffect(() => {
    if (mobileOtp.length === 6 && !mobileVerified && submitting !== 'mobile') void verify('mobile', mobileOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOtp]);

  async function resend(channel: 'email' | 'mobile') {
    setResending(channel);
    setError(null);
    setInfo(null);
    try {
      await resendResetOtp({ reset_pending_id: rid, channel });
      setInfo(`OTP resent to your ${channel}.`);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : `Could not resend ${channel} OTP.`);
    } finally {
      setResending(null);
    }
  }

  async function onFinalSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const v = validatePassword(newPassword);
    if (!v.ok) { setError(v.msg!); return; }
    if (newPassword !== confirmPwd) { setError('Passwords do not match.'); return; }
    setSubmitting('final');
    try {
      await resetPassword({ reset_pending_id: rid, new_password: newPassword });
      router.replace('/login?reset=1');
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Password reset failed.');
    } finally {
      setSubmitting(null);
    }
  }

  if (!rid) {
    return (
      <div>
        <h1 className="heading text-2xl text-slate-900">Reset session expired</h1>
        <p className="mt-2 text-sm text-slate-600">Please start the reset flow again.</p>
        <Link href="/forgot-password" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-500 text-white px-4 py-2 text-sm font-semibold">Start over</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </Link>
      <h1 className="mt-4 heading text-3xl text-slate-900">Verify and reset</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter the codes we sent to <b>{maskedEmail}</b> and <b>{maskedMobile}</b>, then set your new password.
      </p>

      {error && (
        <div role="alert" className="mt-5 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {info && (
        <div className="mt-5 flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-[12.5px] text-emerald-700">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> {info}
        </div>
      )}

      <div className="mt-7 space-y-6">
        <OtpRow label="Email OTP" icon={<Mail className="h-4 w-4" />} masked={maskedEmail}
                value={emailOtp} onChange={setEmailOtp}
                verified={emailVerified} submitting={submitting === 'email'} resending={resending === 'email'}
                onResend={() => resend('email')} />
        <OtpRow label="Mobile OTP" icon={<Phone className="h-4 w-4" />} masked={maskedMobile}
                value={mobileOtp} onChange={setMobileOtp}
                verified={mobileVerified} submitting={submitting === 'mobile'} resending={resending === 'mobile'}
                onResend={() => resend('mobile')} />
      </div>

      <form onSubmit={onFinalSubmit} className="mt-8 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">New password</label>
          <PasswordField
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8–20 characters"
            disabled={!bothVerified}
            withStrength
            maxLength={20}
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Confirm password</label>
          <PasswordField
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="Type it again"
            disabled={!bothVerified}
            maxLength={20}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full rounded-full mt-2" disabled={!bothVerified || submitting === 'final'}>
          {submitting === 'final' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Set new password <ArrowRight className="h-4 w-4" /></>}
        </Button>
        {!bothVerified && (
          <p className="text-[11.5px] text-slate-500 text-center">Verify both OTPs first to unlock the password fields.</p>
        )}
      </form>
    </div>
  );
}

interface OtpRowProps {
  label:      string;
  icon:       React.ReactNode;
  masked:     string;
  value:      string;
  onChange:   (next: string) => void;
  verified:   boolean;
  submitting: boolean;
  resending:  boolean;
  onResend:   () => void;
}
function OtpRow({ label, icon, masked, value, onChange, verified, submitting, resending, onResend }: OtpRowProps) {
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
          <button type="button" onClick={onResend} disabled={resending} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 hover:underline disabled:opacity-50">
            {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
            Resend
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
