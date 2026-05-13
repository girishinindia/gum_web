import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700"><ArrowLeft className="h-3.5 w-3.5" /> Back to login</Link>
      <h1 className="mt-4 heading text-3xl text-slate-900">Set a new password</h1>
      <p className="mt-2 text-sm text-slate-600">Choose a password you haven&apos;t used before — at least 8 characters.</p>

      <form className="mt-7 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">New password</label>
          <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white">
            <Lock className="h-4 w-4 text-slate-400" />
            <input type="password" className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="••••••••" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Confirm password</label>
          <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white">
            <Lock className="h-4 w-4 text-slate-400" />
            <input type="password" className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="••••••••" />
          </div>
        </div>
        <Button variant="primary" className="w-full rounded-full">Update password</Button>
      </form>
    </div>
  );
}
