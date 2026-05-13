import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, ShieldCheck, Sparkles, Globe } from 'lucide-react';

/**
 * Auth shell — split-pane: form on the left, brand panel on the right.
 * Used for /login, /signup, /forgot-password, /reset-password, /verify-email.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — form column */}
      <div className="flex flex-col p-6 sm:p-8 lg:p-12">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="h-10 w-10 rounded-md bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center shadow-btn group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <Image src="/images/GM_Logo_Dark.svg" alt="Grow Up More" width={210} height={50} className="h-11 w-auto" />
        </Link>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <footer className="text-[12px] text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Grow Up More</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-brand-700">Privacy</Link>
            <Link href="/terms"   className="hover:text-brand-700">Terms</Link>
            <Link href="/help"    className="hover:text-brand-700">Help</Link>
          </div>
        </footer>
      </div>

      {/* Right — brand panel */}
      <div className="hidden lg:block relative bg-gradient-to-br from-brand-700 via-brand-600 to-accent text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <div aria-hidden className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative h-full flex flex-col p-12 justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 rounded-full px-3 py-1 text-[11px] font-semibold">
              <Sparkles className="h-3 w-3" /> 50,000+ learners trust us
            </div>
            <h2 className="mt-6 heading text-5xl leading-[1.05]">
              India&apos;s most accessible <br /> IT-skilling platform.
            </h2>
            <p className="mt-5 text-white/85 text-lg max-w-md leading-relaxed">
              Industry-grade courses · Multilingual · 95% placement rate · From ₹20,000.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-md bg-white/10 backdrop-blur border border-white/20 p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-white/20 flex items-center justify-center shrink-0"><Globe className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-semibold">12+ Indian languages</div>
                <div className="text-[12px] text-white/75">Hindi · Tamil · Telugu · Marathi · Bengali · Gujarati · Kannada and more.</div>
              </div>
            </div>
            <div className="rounded-md bg-white/10 backdrop-blur border border-white/20 p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-white/20 flex items-center justify-center shrink-0"><ShieldCheck className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-semibold">Blockchain-verified certificates</div>
                <div className="text-[12px] text-white/75">Recognised by 250+ hiring partners across India.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
