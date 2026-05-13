import Link from 'next/link';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  return (
    <div>
      <h1 className="heading text-3xl text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Start learning in minutes — no credit card required.</p>

      <form className="mt-7 space-y-3.5">
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Full name</label>
          <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400">
            <User className="h-4 w-4 text-slate-400" />
            <input className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="Your name" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Email</label>
            <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white">
              <Mail className="h-4 w-4 text-slate-400" />
              <input type="email" className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Mobile</label>
            <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white">
              <Phone className="h-4 w-4 text-slate-400" />
              <input type="tel" className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="+91 …" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Password</label>
          <div className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white">
            <Lock className="h-4 w-4 text-slate-400" />
            <input type="password" className="flex-1 bg-transparent py-2.5 text-sm outline-none" placeholder="At least 8 characters" />
          </div>
        </div>
        <label className="flex items-start gap-2 text-[12.5px] text-slate-600 cursor-pointer">
          <input type="checkbox" className="rounded accent-brand-500 mt-0.5" />
          I agree to the <Link href="/terms" className="text-brand-700 hover:underline">Terms</Link> and <Link href="/privacy" className="text-brand-700 hover:underline">Privacy Policy</Link>.
        </label>
        <Button variant="primary" className="w-full rounded-full mt-3">Create account <ArrowRight className="h-4 w-4" /></Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        Already have an account? <Link href="/login" className="text-brand-700 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
