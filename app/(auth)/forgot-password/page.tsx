import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700"><ArrowLeft className="h-3.5 w-3.5" /> Back to login</Link>
      <h1 className="mt-4 heading text-3xl text-slate-900">Reset your password</h1>
      <p className="mt-2 text-sm text-slate-600">Enter your registered email — we&apos;ll send you a link to set a new password.</p>

      <form className="mt-7 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Email</label>
          <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white">
            <Mail className="h-4 w-4 text-slate-400" />
            <input type="email" className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="you@example.com" />
          </div>
        </div>
        <Button variant="primary" className="w-full rounded-full">Send reset link</Button>
      </form>
    </div>
  );
}
