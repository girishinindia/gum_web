import { Download, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';

const TEMPLATES = [
  { name:'Classic',     accent:'from-slate-700 to-slate-900' },
  { name:'Modern Blue', accent:'from-brand-500 to-brand-700' },
  { name:'Tech',        accent:'from-emerald-600 to-brand-500' },
  { name:'Bold',        accent:'from-violet-600 to-rose-500' },
];

export default function ResumePage() {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>Resume Builder</Eyebrow>
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">One-click resume from your profile</h1>
        </div>
        <Button variant="primary" className="rounded-full"><Download className="h-4 w-4" /> Download PDF</Button>
      </div>

      <div className="mt-6 grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Templates */}
        <aside className="rounded-md bg-white border border-slate-200 shadow-card p-4 lg:sticky lg:top-24 self-start">
          <h2 className="heading text-sm text-slate-900 mb-3">Template</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {TEMPLATES.map((t, i) => (
              <button key={t.name} className={`rounded-md overflow-hidden border-2 transition-all ${i === 1 ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'}`}>
                <div className={`aspect-[3/4] bg-gradient-to-br ${t.accent}`} />
                <div className="p-2 text-[12px] font-semibold text-slate-800">{t.name}</div>
              </button>
            ))}
          </div>

          <Button variant="outline" className="mt-4 w-full rounded-full"><Wand2 className="h-4 w-4" /> AI rewrite</Button>
        </aside>

        {/* Preview */}
        <div className="rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden aspect-[8.5/11] p-10">
          <div className="border-b-2 border-brand-500 pb-3">
            <h2 className="heading text-3xl text-slate-900">Anjali Sharma</h2>
            <p className="text-[13px] text-brand-700 font-semibold">Data Analyst</p>
            <p className="text-[12px] text-slate-500 mt-1">anjali@example.com · +91 98000 00000 · linkedin.com/in/anjali · github.com/anjali</p>
          </div>

          <section className="mt-5">
            <h3 className="heading text-sm text-brand-700 uppercase tracking-wider">Summary</h3>
            <p className="mt-1.5 text-[13px] text-slate-700 leading-relaxed">Data analyst with experience in retail recommendation systems. Hindi-first learner. Passionate about making data accessible.</p>
          </section>

          <section className="mt-4">
            <h3 className="heading text-sm text-brand-700 uppercase tracking-wider">Experience</h3>
            <div className="mt-1.5 text-[13px] text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900">Data Analyst · Flipkart <span className="text-slate-500 font-normal">· 2025 – Now</span></p>
              <p className="mt-0.5">Built recommendation pipelines, owned weekly metric reviews.</p>
            </div>
          </section>

          <section className="mt-4">
            <h3 className="heading text-sm text-brand-700 uppercase tracking-wider">Skills</h3>
            <p className="mt-1.5 text-[13px] text-slate-700">Python · pandas · SQL · dbt · Looker · Tableau · PowerBI · Statistics</p>
          </section>

          <section className="mt-4">
            <h3 className="heading text-sm text-brand-700 uppercase tracking-wider">Certificates</h3>
            <p className="mt-1.5 text-[13px] text-slate-700">Data Science with Python · Grow Up More (2026) · Generative AI Builder · Grow Up More (2026)</p>
          </section>
        </div>
      </div>
    </div>
  );
}
