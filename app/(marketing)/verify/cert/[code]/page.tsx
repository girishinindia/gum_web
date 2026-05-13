import Link from 'next/link';
import { ShieldCheck, QrCode, CheckCircle2, Calendar, User, Award, Download, Share2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export default function CertVerifyPage() {
  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden">
            {/* Status banner */}
            <div className="bg-gradient-to-r from-success/95 via-success to-emerald-600 text-white p-5 flex items-center gap-4">
              <CheckCircle2 className="h-10 w-10 shrink-0" />
              <div>
                <div className="text-[11px] uppercase tracking-wider opacity-90">VERIFIED</div>
                <div className="heading text-xl mt-0.5">This certificate is authentic</div>
              </div>
              <div className="ml-auto inline-flex items-center gap-1 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-[11px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> Blockchain anchored
              </div>
            </div>

            {/* Certificate body */}
            <div className="p-8 sm:p-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-700">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="heading text-sm tracking-wider">CERTIFICATE</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">GUM-2026-A1B2C3</span>
              </div>

              <h1 className="mt-8 heading text-3xl sm:text-4xl text-slate-900">Certificate of Completion</h1>
              <p className="mt-2 text-sm text-slate-500">Awarded to</p>
              <p className="mt-1 heading text-2xl text-slate-900">Anjali Sharma</p>
              <p className="mt-3 text-sm text-slate-600">For successfully completing</p>
              <p className="mt-1 font-semibold text-slate-900 text-lg">Data Science with Python — Cohort 12</p>

              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> Issued</div>
                  <div className="mt-1 font-semibold text-slate-900">15 Apr 2026</div>
                </div>
                <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1"><Award className="h-3 w-3" /> Grade</div>
                  <div className="mt-1 font-semibold text-slate-900">Distinction · 91%</div>
                </div>
                <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1"><User className="h-3 w-3" /> Verified by</div>
                  <div className="mt-1 font-semibold text-slate-900">GUM Director</div>
                </div>
              </div>

              <div className="mt-10 flex items-end justify-between gap-6">
                <div>
                  <div className="h-px w-36 bg-slate-300" />
                  <div className="mt-1 text-[11px] text-slate-500">Director, Grow Up More</div>
                </div>
                <div className="h-20 w-20 rounded-md bg-slate-100 flex items-center justify-center"><QrCode className="h-12 w-12 text-slate-600" /></div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <Button variant="primary" className="rounded-full"><Download className="h-4 w-4" /> Download PDF</Button>
                <Button variant="outline" className="rounded-full"><Share2 className="h-4 w-4" /> Share on LinkedIn</Button>
                <span className="ml-auto text-xs text-slate-500">
                  Verify any cert at <Link href="/verify" className="text-brand-700 font-semibold hover:underline">growupmore.com/verify</Link>
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 text-center text-sm text-slate-500">
          Need to verify another certificate?{' '}
          <ButtonLink href="/" variant="ghost" size="sm">Back to home</ButtonLink>
        </div>
      </div>
    </section>
  );
}
