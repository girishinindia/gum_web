import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700"><ArrowLeft className="h-3.5 w-3.5" /> Back to login</Link>
      <h1 className="mt-4 heading text-3xl text-slate-900">Verify your email</h1>
      <p className="mt-2 text-sm text-slate-600">We&apos;ve sent a 6-digit code to <span className="font-semibold text-slate-900">you@example.com</span>. Enter it below to continue.</p>

      <form className="mt-7">
        <label className="block text-[12px] font-semibold text-slate-700 mb-2">One-time code</label>
        <div className="flex items-center justify-between gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              maxLength={1}
              inputMode="numeric"
              className="h-14 w-12 text-center heading text-2xl border border-slate-200 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
            />
          ))}
        </div>
        <Button variant="primary" className="w-full rounded-full mt-5">Verify</Button>
      </form>

      <button className="mt-5 mx-auto flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-brand-700">
        <RefreshCw className="h-3.5 w-3.5" /> Resend code in 0:42
      </button>
    </div>
  );
}
