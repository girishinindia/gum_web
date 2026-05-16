'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Phone, AlertCircle, CheckCircle2, Loader2, RotateCw } from 'lucide-react';
import { OtpInput } from '@/components/auth/OtpInput';
import {
  AuthApiError, assignMyRole, isOtpComplete, resendRegisterOtp,
  verifyRegisterOtp, type SelfAssignableRole,
} from '@/lib/auth/client';
import { setTokens, clearTokens } from '@/lib/auth/session';

/**
 * Post-register dual-OTP screen. The API requires BOTH email AND mobile
 * OTPs to be verified before it issues tokens. We submit each channel
 * independently as soon as the user types 6 digits in that cell, so the
 * UX is "fill, auto-submit, see green, fill the other".
 *
 * Wrapped in <Suspense> because useSearchParams suspends.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  // Note: `setSession` is intentionally NOT pulled from useAuth — see the
  // success branch in `submit()` below. We want the user to log in fresh
  // after verification, so we never write tokens to localStorage here.

  const pendingId    = params?.get('pid') || '';
  const maskedEmail  = params?.get('email') || '';
  const maskedMobile = params?.get('mobile') || '';
  // Role chosen on the signup page (RolePicker). Defaults to 'student' if
  // anything is missing or malformed — keeps the user funnel intact even
  // if someone landed here with a stripped URL.
  const roleParam    = params?.get('role');
  const selectedRole: SelfAssignableRole =
    roleParam === 'instructor' ? 'instructor' : 'student';

  const [emailOtp,  setEmailOtp]  = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailVerified,  setEmailVerified]  = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [submitting, setSubmitting] = useState<'email' | 'mobile' | null>(null);
  const [resending,  setResending]  = useState<'email' | 'mobile' | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [info,       setInfo]       = useState<string | null>(null);

  async function submit(channel: 'email' | 'mobile', otp: string) {
    setSubmitting(channel);
    setError(null);
    setInfo(null);
    try {
      const r = await verifyRegisterOtp({ pending_id: pendingId, channel, otp });
      if (isOtpComplete(r)) {
        // Both OTPs verified — the API just minted fresh tokens for the
        // new user. Before we hand off to /login we must call
        // POST /users/me/roles to write the chosen role into `user_roles`.
        // Without that row the admin portal can't tell student from
        // instructor and role-gated features won't be visible.
        //
        // We briefly persist the tokens to localStorage so the shared
        // `assignMyRole()` client (which reads `getAccessToken()`) Just
        // Works, then clear them so the user lands on /login fresh.
        setTokens({ access_token: r.access_token, refresh_token: r.refresh_token });
        try {
          await assignMyRole(selectedRole);
        } catch (roleErr) {
          // User account exists; only the role row failed. Log to console
          // but don't block — they can sign in and an admin can fix the
          // role later. (The endpoint is idempotent so a retry would work.)
          console.error('[verify-email] assignMyRole failed:', roleErr);
        } finally {
          clearTokens();
        }
        // Don't auto-sign-in: the user just verified their account, but
        // we want them to log in explicitly. Send them to /login with a
        // ?registered=1 flag so the page can show a green confirmation
        // banner ("Account verified — log in to continue").
        router.replace('/login?registered=1');
        return;
      }
      if (channel === 'email')  setEmailVerified(r.email_verified);
      if (channel === 'mobile') setMobileVerified(r.mobile_verified);
      setInfo(channel === 'email' ? 'Email verified. Now verify your mobile.' : 'Mobile verified. Now verify your email.');
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : 'Verification failed.';
      setError(msg);
      if (channel === 'email')  setEmailOtp('');
      if (channel === 'mobile') setMobileOtp('');
    } finally {
      setSubmitting(null);
    }
  }

  // Auto-submit when a channel has all 6 digits AND isn't already verified.
  useEffect(() => {
    if (emailOtp.length === 6 && !emailVerified && submitting !== 'email') {
      void submit('email', emailOtp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailOtp]);

  useEffect(() => {
    if (mobileOtp.length === 6 && !mobileVerified && submitting !== 'mobile') {
      void submit('mobile', mobileOtp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOtp]);

  async function resend(channel: 'email' | 'mobile') {
    setResending(channel);
    setError(null);
    setInfo(null);
    try {
      await resendRegisterOtp({ pending_id: pendingId, channel });
      setInfo(`OTP resent to your ${channel}.`);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : `Could not resend ${channel} OTP.`);
    } finally {
      setResending(null);
    }
  }

  if (!pendingId) {
    return (
      <div>
        <h1 className="heading text-2xl text-slate-900">Hmm — we lost your session</h1>
        <p className="mt-2 text-sm text-slate-600">Please restart the sign-up.</p>
        <Link href="/signup" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-500 text-white px-4 py-2 text-sm font-semibold">Back to sign up</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="heading text-3xl text-slate-900">Verify both channels</h1>
      <p className="mt-2 text-sm text-slate-600">
        We&apos;ve sent a 6-digit code to <b>{maskedEmail || 'your email'}</b> and <b>{maskedMobile || 'your mobile'}</b>. Both must be verified to finish creating your account.
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
        <OtpRow
          label="Email OTP"
          icon={<Mail className="h-4 w-4" />}
          masked={maskedEmail}
          value={emailOtp}
          onChange={setEmailOtp}
          verified={emailVerified}
          submitting={submitting === 'email'}
          resending={resending === 'email'}
          onResend={() => resend('email')}
        />
        <OtpRow
          label="Mobile OTP"
          icon={<Phone className="h-4 w-4" />}
          masked={maskedMobile}
          value={mobileOtp}
          onChange={setMobileOtp}
          verified={mobileVerified}
          submitting={submitting === 'mobile'}
          resending={resending === 'mobile'}
          onResend={() => resend('mobile')}
        />
      </div>

      <div className="mt-7 text-center text-sm text-slate-600">
        Wrong details? <Link href="/signup" className="text-brand-700 font-semibold hover:underline">Restart sign-up</Link>
      </div>
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
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 hover:underline disabled:opacity-50"
          >
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
