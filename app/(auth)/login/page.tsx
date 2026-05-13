import Link from 'next/link';
import { Mail, Lock, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <div>
      <h1 className="heading text-3xl text-slate-900">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in to continue your learning.</p>

      <form className="mt-7 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Email</label>
          <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400">
            <Mail className="h-4 w-4 text-slate-400" />
            <input type="email" className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[12px] font-semibold text-slate-700">Password</label>
            <Link href="/forgot-password" className="text-[11.5px] text-brand-700 font-semibold hover:underline">Forgot password?</Link>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400">
            <Lock className="h-4 w-4 text-slate-400" />
            <input type="password" className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400" placeholder="••••••••" />
            <button type="button" className="text-slate-400 hover:text-brand-700"><Eye className="h-4 w-4" /></button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-slate-700 cursor-pointer">
          <input type="checkbox" className="rounded accent-brand-500" defaultChecked /> Keep me signed in
        </label>
        <Button variant="primary" className="w-full rounded-full mt-3">Sign in <ArrowRight className="h-4 w-4" /></Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[11px] text-slate-400">
        <span className="flex-1 h-px bg-slate-200" /> OR CONTINUE WITH <span className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="rounded-sm border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Google</button>
        <button className="rounded-sm border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">LinkedIn</button>
      </div>

      <p className="mt-7 text-center text-sm text-slate-600">
        New here? <Link href="/signup" className="text-brand-700 font-semibold hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
