import { ShieldCheck, QrCode, Fingerprint, Award, BadgeCheck } from 'lucide-react';

interface Props {
  courseName: string;
  moduleCount: number;
}

const FEATURES = [
  { icon: ShieldCheck, label: 'Verified & Shareable', desc: 'Add it to LinkedIn, your resume or portfolio' },
  { icon: QrCode, label: 'QR Code Verification', desc: 'Employers can verify it online in one scan' },
  { icon: Fingerprint, label: 'Unique Certificate ID', desc: 'Tamper-proof and individually serialised' },
  { icon: Award, label: 'Industry Recognised', desc: 'Accepted by 500+ hiring partners' },
];

export function CourseCertificatePreview({ courseName, moduleCount }: Props) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <h2 className="heading text-2xl sm:text-3xl text-slate-900">Certificate of Completion</h2>
      <p className="mt-1 text-sm text-slate-500">Earn a verified certificate when you complete the course</p>

      <div className="mt-7 grid lg:grid-cols-[1fr_340px] gap-8 items-center">
        {/* Feature list */}
        <ul className="space-y-4">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-start gap-3.5">
              <span className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-50 to-sky-50 ring-1 ring-emerald-100 text-emerald-600 flex items-center justify-center">
                <f.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-800">{f.label}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</div>
              </div>
            </li>
          ))}
        </ul>

        {/* Certificate visual */}
        <div className="relative rounded-2xl bg-gradient-to-br from-amber-100/50 via-white to-sky-100/60 p-[3px] shadow-cardHover">
          <div className="relative rounded-[14px] bg-white px-6 py-7 text-center overflow-hidden ring-1 ring-slate-100">
            {/* Corner flourishes */}
            <span aria-hidden className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-amber-300/70 rounded-tl-md" />
            <span aria-hidden className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-amber-300/70 rounded-tr-md" />
            <span aria-hidden className="absolute left-3 bottom-3 h-5 w-5 border-l-2 border-b-2 border-amber-300/70 rounded-bl-md" />
            <span aria-hidden className="absolute right-3 bottom-3 h-5 w-5 border-r-2 border-b-2 border-amber-300/70 rounded-br-md" />

            {/* Monogram */}
            <div className="mx-auto h-11 w-11 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-btn">
              <BadgeCheck className="h-6 w-6 text-white" />
            </div>
            <div className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-600">Grow Up More</div>
            <div className="mt-2 heading text-[13px] uppercase tracking-[0.18em] text-slate-900">Certificate of Completion</div>
            <div className="mx-auto mt-2.5 h-px w-16 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

            <div className="mt-3 text-[11px] text-slate-400">This certifies that</div>
            <div className="mt-1 font-serif italic text-lg text-sky-700">Your Name Here</div>
            <div className="mt-2 text-[11px] text-slate-400">has successfully completed</div>
            <div className="mt-1 heading text-sm text-slate-900 leading-snug line-clamp-2 px-2">{courseName}</div>

            <div className="mt-2.5 text-[10px] text-slate-400">
              {moduleCount > 0 ? `${moduleCount} Module${moduleCount !== 1 ? 's' : ''} · ${today}` : today}
            </div>

            {/* Footer: QR · seal · signature */}
            <div className="mt-5 flex items-end justify-between px-1">
              <div className="flex flex-col items-center gap-1">
                <div className="h-9 w-9 rounded bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-slate-300" />
                </div>
                <div className="text-[8px] text-slate-400 font-mono">GUM-XXXX-XXXX</div>
              </div>

              {/* Gold seal with ribbon */}
              <div className="relative -mt-2">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-[0_4px_14px_rgba(245,158,11,0.45)] ring-2 ring-white">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <span aria-hidden className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  <span className="block h-3.5 w-1.5 bg-amber-400 rotate-6 rounded-b-sm" />
                  <span className="block h-3.5 w-1.5 bg-amber-500 -rotate-6 rounded-b-sm" />
                </span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="font-serif italic text-[11px] text-slate-600">GrowUpMore</div>
                <div className="h-px w-14 bg-slate-300" />
                <div className="text-[8px] text-slate-400 uppercase tracking-wider">Authorised</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
