'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, AlertCircle, CheckCircle2, Loader2, RotateCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/auth/OtpInput';
import { PasswordField } from '@/components/auth/PasswordField';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  AuthApiError, changePasswordConfirm, changePasswordInitiate,
  changePasswordResendOtp, changePasswordVerifyOtp,
} from '@/lib/auth/client';
import { validatePassword } from '@/lib/auth/validation';

/**
 * Three-stage change-password card:
 *   1. Confirm current password → server starts OTP session (initiate)
 *   2. User verifies both email + mobile OTPs (dual-channel)
 *   3. User sets new password (confirm)
 *
 * On success the server revokes all other sessions, so we sign out
 * locally and route to /login.
 */
export function ChangePasswordCard() {
  const { logout } = useAuth();
  const router = useRouter();

  const [stage, setStage] = useState<'old' | 'otp' | 'new'>('old');
  const [pendingId,    setPendingId]    = useState('');
  const [maskedEmail,  setMaskedEmail]  = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');

  const [oldPwd,      setOldPwd]      = useState('');
  const [emailOtp,    setEmailOtp]    = useState('');
  const [mobileOtp,   setMobileOtp]   = useState('');
  const [emailVer,    setEmailVer]    = useState(false);
  const [mobileVer,   setMobileVer]   = useState(false);
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');

  const [submitting, setSubmitting] = useState<null | 'old' | 'email' | 'mobile' | 'final'>(null);
  const [resending,  setResending]  = useState<null | 'email' | 'mobile'>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [info,       setInfo]       = useState<string | null>(null);

  async function onInitiate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setInfo(null);
    if (!oldPwd) { setError('Enter your current password.'); return; }
    setSubmitting('old');
    try {
      const r = await changePasswordInitiate({ old_password: oldPwd });
      setPendingId(r.pending_id);
      setMaskedEmail(r.email);
      setMaskedMobile(r.mobile);
      setStage('otp');
      setInfo('OTPs sent to your email and mobile.');
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Could not start password change.');
    } finally {
      setSubmitting(null);
    }
  }

  async function verify(channel: 'email' | 'mobile', otp: string) {
    setSubmitting(channel);
    setError(null); setInfo(null);
    try {
      const r = await changePasswordVerifyOtp({ pending_id: pendingId, channel, otp });
      if (channel === 'email')  setEmailVer(r.email_verified);
      if (channel === 'mobile') setMobileVer(r.mobile_verified);
      if (r.can_set_password) { setStage('new'); setInfo('Both verified — set your new password.'); }
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
    try { await changePasswordResendOtp({ pending_id: pendingId, channel }); setInfo(`OTP resent to ${channel}.`); }
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
      await changePasswordConfirm({ pending_id: pendingId, new_password: newPwd });
      await logout();
      router.replace('/login?changed=password');
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Failed to update password.');
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 shadow-card">
      <h2 className="heading text-lg text-slate-900">Change password</h2>
      <p className="mt-1 text-[12.5px] text-slate-600">Verify your current password, then both OTPs, then set the new one.</p>

      {error && <Banner kind="error" msg={error} />}
      {info  && <Banner kind="ok"    msg={info} />}

      {stage === 'old' && (
        <form onSubmit={onInitiate} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Current password</label>
            <PasswordField value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} placeholder="Your current password" />
          </div>
          <Button type="submit" variant="primary" className="rounded-full" disabled={submitting === 'old'}>
            {submitting === 'old' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTPs <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>
      )}

      {stage === 'otp' && (
        <div className="mt-5 space-y-6">
          <OtpRow label="Email OTP" icon={<Mail className="h-4 w-4" />} masked={maskedEmail}
                  value={emailOtp} onChange={setEmailOtp}
                  verified={emailVer} submitting={submitting === 'email'} resending={resending === 'email'}
                  onResend={() => resend('email')} />
          <OtpRow label="Mobile OTP" icon={<Phone className="h-4 w-4" />} masked={maskedMobile}
                  value={mobileOtp} onChange={setMobileOtp}
                  verified={mobileVer} submitting={submitting === 'mobile'} resending={resending === 'mobile'}
                  onResend={() => resend('mobile')} />
        </div>
      )}

      {stage === 'new' && (
        <form onSubmit={onFinal} className="mt-5 space-y-3.5 max-w-md">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">New password</label>
            <PasswordField value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="8–20 characters" withStrength maxLength={20} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Confirm new password</label>
            <PasswordField value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Type again" maxLength={20} />
          </div>
          <Button type="submit" variant="primary" className="rounded-full" disabled={submitting === 'final'}>
            {submitting === 'final' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Update password <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>
      )}
    </div>
  );
}

function Banner({ kind, msg }: { kind: 'error' | 'ok'; msg: string }) {
  const cls = kind === 'error'
    ? 'bg-rose-50 border-rose-200 text-rose-700'
    : 'bg-emerald-50 border-emerald-200 text-emerald-700';
  const Icon = kind === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div role={kind === 'error' ? 'alert' : undefined} className={`mt-4 flex items-start gap-2 rounded-md border px-3 py-2 text-[12.5px] ${cls}`}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" /> {msg}
    </div>
  );
}

interface OtpRowProps {
  label: string; icon: React.ReactNode; masked: string;
  value: string; onChange: (n: string) => void;
  verified: boolean; submitting: boolean; resending: boolean; onResend: () => void;
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
