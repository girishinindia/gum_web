import Link from 'next/link';
import { GraduationCap, Youtube, Instagram, Linkedin, Twitter, Send } from 'lucide-react';
import { FOOTER_COLUMNS } from '@/lib/homeContent';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 text-slate-300 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 overflow-hidden">
      <div aria-hidden className="glow bg-brand-500/20 w-[400px] h-[400px] -top-40 -left-20" />
      <div aria-hidden className="glow bg-accent/20 w-[400px] h-[400px] -bottom-40 -right-20" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-white">
              <span className="h-9 w-9 rounded-md bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center shadow-btn">
                <GraduationCap className="h-5 w-5 text-white" />
              </span>
              <span className="heading text-lg leading-none">Grow Up More</span>
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Empowering India&apos;s next generation of tech professionals through accessible, multilingual, job-oriented IT education.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Youtube, Instagram, Linkedin, Twitter, Send].map((Icon, i) => (
                <Link key={i} href="#" aria-label="social" className="h-9 w-9 rounded-sm flex items-center justify-center bg-white/5 hover:bg-brand-500/20 hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="heading text-white text-sm font-semibold tracking-wide uppercase">{col.heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>© {year} Grow Up More. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/terms"   className="hover:text-slate-300">Terms</Link>
            <Link href="/refund"  className="hover:text-slate-300">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
