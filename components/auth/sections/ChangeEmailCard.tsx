'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, AlertCircle, CheckCircle2, Loader2, RotateCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/auth/OtpInput';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  AuthApiError, updateEmailInitiate, updateEmailResendOtp, updateEmailVerifyOtp,
} from '@/lib/auth/client';
import { validateEmail } from '@/lib/auth/validation';

/**
 * Change email — two stages:
 *   1. User types new email → server sends a single OTP to the NEW address
 *      (with a heads-up SMS to the current mobile)
 *   2. User enters the OTP → server swaps the column + revokes sessions
 *
 * On success: logout locally, route to /login.
 */
export function ChangeEmailCard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [stage, setStage] = useState<'enter' | 'otp'>('enter');
  const [pendingId,  setPendingId]  = useState('');
  const [maskedNew,  setMaskedNew]  = useState('');
  const [newEmail,   setNewEmail]   = useState('');
  const [otp,        setOtp]        = useState('');

  const [submitting, setSubmitting] = useState<null | 'init' | 'otp'>(null);
  const [resending,  setResending]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [info,       setInfo]       = useState<string | null>(null);

  async function onInitiate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setInfo(null);
    const v = validateEmail(newEmail);
    if (!v.ok) { setError(v.msg!); return; }
    setSubmitting('init');
    try {
      const r = await updateEmailInitiate({ new_email: newEmail.trim().toLowerCase() });
      setPendingId(r.pending_id);
      setMaskedNew(r.new_email);
      setStage('otp');
      setInfo(`OTP sent to ${r.new_email}.`);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Could not start email update.');
    } finally {
      setSubmitting(null);
    }
  }

  async function verify(code: string) {
    setSubmitting('otp');
    setError(null); setInfo(null);
    try {
      await updateEmailVerifyOtp({ pending_id: pendingId, otp: code });
      await logout();
      router.replace('/login?changed=email');
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : 'Verification failed.');
      setOtp('');
    } finally {
      setSubmitting(null);
    }
  }

  useEffect(() => {
    if (otp.length === 6 && submitting !== 'otp') void verify(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  async function resend() {
    setResending(true);
    setError(null); setInfo(null);
    try { await updateEmailResendOtp({ pending_id: pendingId }); setInfo('OTP resent.'); }
    catch (err) { setError(err instanceof AuthApiError ? err.message : 'Could not resend.'); }
    finally { setResending(false); }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 shadow-card">
      <h2 className="heading text-lg text-slate-900">Change email</h2>
      <p className="mt-1 text-[12.5px] text-slate-600">
        Current email: <b className="text-slate-800">{user?.email ?? '—'}</b>. We&apos;ll send an OTP to the new address; once verified, you&apos;ll sign back in with the new email.
      </p>

      {error && <Banner kind="error" msg={error} />}
      {info  && <Banner kind="ok"    msg={info} />}

      {stage === 'enter' && (
        <form onSubmit={onInitiate} className="mt-5 space-y-3.5 max-w-md">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">New email</label>
            <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400">
              <Mail className="h-4 w-4 text-slate-400" />
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} maxLength={255} className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="newaddress@example.com" />
            </div>
          </div>
          <Button type="submit" variant="primary" className="rounded-full" disabled={submitting === 'init'}>
            {submitting === 'init' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>
      )}

      {stage === 'otp' && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[12px] font-semibold text-slate-700 inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-700" /> OTP sent to {maskedNew}
            </div>
            <button type="button" onClick={resend} disabled={resending} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 hover:underline disabled:opacity-50">
              {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
              Resend
            </button>
          </div>
          <div className="flex items-center gap-3">
            <OtpInput value={otp} onChange={setOtp} disabled={submitting === 'otp'} />
            {submitting === 'otp' && <Loader2 className="h-4 w-4 animate-spin text-brand-600" />}
          </div>
        </div>
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
