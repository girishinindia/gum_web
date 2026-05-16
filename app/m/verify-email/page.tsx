'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Phone, AlertCircle, CheckCircle2, Loader2, RotateCw, ArrowLeft } from 'lucide-react';
import { OtpInput } from '@/components/auth/OtpInput';
import {
  AuthApiError, assignMyRole, isOtpComplete, resendRegisterOtp,
  verifyRegisterOtp, type SelfAssignableRole,
} from '@/lib/auth/client';
import { setTokens, clearTokens } from '@/lib/auth/session';

export default function MobileVerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  // `setSession` deliberately not used — after verification we send the
  // user to /m/login so they sign in fresh (same policy as desktop).

  const pendingId    = params?.get('pid') || '';
  const maskedEmail  = params?.get('email') || '';
  const maskedMobile = params?.get('mobile') || '';
  // Role chosen on /m/signup. Defaults to 'student' if param missing.
  const roleParam    = params?.get('role');
  const selectedRole: SelfAssignableRole =
    roleParam === 'instructor' ? 'instructor' : 'student';

  const [emailOtp,  setEmailOtp]  = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailVer,  setEmailVer]  = useState(false);
  const [mobileVer, setMobileVer] = useState(false);
  const [submitting, setSubmitting] = useState<'email' | 'mobile' | null>(null);
  const [resending,  setResending]  = useState<'email' | 'mobile' | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [info,       setInfo]       = useState<string | null>(null);

  async function verify(channel: 'email' | 'mobile', otp: string) {
    setSubmitting(channel);
    setError(null); setInfo(null);
    try {
      const r = await verifyRegisterOtp({ pending_id: pendingId, channel, otp });
      if (isOtpComplete(r)) {
        // Both OTPs verified — write the chosen role into `user_roles`
        // before redirecting to login. Mirrors the desktop flow. See
        // gum_web/app/(auth)/verify-email/page.tsx for full reasoning.
        setTokens({ access_token: r.access_token, refresh_token: r.refresh_token });
        try {
          await assignMyRole(selectedRole);
        } catch (roleErr) {
          console.error('[m/verify-email] assignMyRole failed:', roleErr);
        } finally {
          clearTokens();
        }
        // No auto-sign-in. Send the user to the mobile login page with
        // ?registered=1 so it can surface a confirmation banner.
        router.replace('/m/login?registered=1');
        return;
      }
      if (channel === 'email')  setEmailVer(r.email_verified);
      if (channel === 'mobile') setMobileVer(r.mobile_verified);
      setInfo(channel === 'email' ? 'Email verified.' : 'Mobile verified.');
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
    try { await resendRegisterOtp({ pending_id: pendingId, channel }); setInfo(`OTP resent to ${channel}.`); }
    catch (err) { setError(err instanceof AuthApiError ? err.message : 'Could not resend.'); }
    finally { setResending(null); }
  }

  if (!pendingId) {
    return (
      <div className="px-5 py-6 min-h-screen">
        <h1 className="heading text-xl text-slate-900">Session expired</h1>
        <p className="mt-2 text-sm text-slate-600">Restart the sign-up.</p>
        <Link href="/m/signup" className="mt-4 inline-flex rounded-full bg-brand-500 text-white px-4 py-2 text-sm font-semibold">Back to sign up</Link>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white">
      <Link href="/m/signup" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Restart sign-up
      </Link>
      <h1 className="mt-4 heading text-2xl font-extrabold text-slate-900">Verify both channels</h1>
      <p className="mt-1 text-[13px] text-slate-600">Codes sent to <b>{maskedEmail}</b> and <b>{maskedMobile}</b>. Both must be verified.</p>

      {error && <Banner kind="error" msg={error} />}
      {info  && <Banner kind="ok" msg={info} />}

      <div className="mt-6 space-y-6">
        <Row label="Email OTP"  icon={<Mail  className="h-4 w-4" />} masked={maskedEmail}
             value={emailOtp}  onChange={setEmailOtp}  verified={emailVer}  submitting={submitting==='email'}  resending={resending==='email'}  onResend={() => resend('email')} />
        <Row label="Mobile OTP" icon={<Phone className="h-4 w-4" />} masked={maskedMobile}
             value={mobileOtp} onChange={setMobileOtp} verified={mobileVer} submitting={submitting==='mobile'} resending={resending==='mobile'} onResend={() => resend('mobile')} />
      </div>
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
