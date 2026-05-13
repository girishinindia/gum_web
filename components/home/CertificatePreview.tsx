import { CheckCircle2, ShieldCheck, QrCode, Stamp } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';

const POINTS = [
  'Blockchain-verified — every certificate has a unique on-chain ID',
  'QR-code authenticity check — recruiters verify in 3 seconds',
  'NSDC + Govt-of-India industry recognition',
  'Embeddable on LinkedIn with a single click',
];

export function CertificatePreview() {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <div>
              <Eyebrow>Certificate</Eyebrow>
              <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">A Certificate That Means Something</h2>
              <p className="mt-4 text-slate-600 max-w-lg">
                Each Grow Up More certificate is QR-verifiable, blockchain-anchored, and recognised by 250+ hiring partners across India.
              </p>
              <ul className="mt-6 space-y-3">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div aria-hidden className="glow bg-brand-300/40 w-[360px] h-[360px] -top-12 -right-12" />
              <div className="relative rounded-md bg-white border border-slate-200 shadow-cardHover p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 via-white to-accent/5 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-brand-600" />
                      <span className="heading text-sm tracking-wider text-brand-700">CERTIFICATE</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">GUM-{new Date().getFullYear()}-A1B2C3</span>
                  </div>
                  <h3 className="mt-7 heading text-2xl text-slate-900">Certificate of Completion</h3>
                  <p className="mt-2 text-sm text-slate-500">Awarded to</p>
                  <p className="mt-1 heading text-xl text-slate-900">Anjali Sharma</p>
                  <p className="mt-3 text-sm text-slate-600">For successfully completing</p>
                  <p className="mt-1 font-semibold text-slate-900">Data Science with Python — Cohort 12</p>

                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <div className="h-px w-28 bg-slate-300" />
                      <div className="mt-1 text-[11px] text-slate-500">Director, GUM</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-md bg-slate-100 flex items-center justify-center"><QrCode className="h-9 w-9 text-slate-500" /></div>
                      <div className="h-16 w-16 rounded-full bg-brand-50 border-2 border-dashed border-brand-300 flex items-center justify-center text-brand-700"><Stamp className="h-7 w-7" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
