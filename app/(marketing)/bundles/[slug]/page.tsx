import Link from 'next/link';
import { Layers, Users, Star, CheckCircle2, ShoppingCart, Heart, ChevronRight, Award, Sparkles, BadgeCheck, ShieldCheck, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { CourseCard } from '@/components/ui/CourseCard';

const INCLUDED = [
  { id: 1, code: 'FS101', slug: 'mern-full-stack',        name: 'MERN Full-Stack Engineer', price: 34999, original_price: 59999, rating_average: 4.7, total_lessons: 92, difficulty_level: 'intermediate' },
  { id: 2, code: 'CL101', slug: 'cloud-devops-essentials', name: 'Cloud & DevOps Essentials', price: 29999, original_price: 49999, rating_average: 4.8, total_lessons: 72, difficulty_level: 'intermediate' },
  { id: 3, code: 'SD201', slug: 'system-design-advanced', name: 'System Design Advanced',   price: 24999, rating_average: 4.9, total_lessons: 40, difficulty_level: 'advanced' },
  { id: 4, code: 'CB101', slug: 'capstone-bootcamp',      name: 'Capstone Bootcamp',        price: 19999, rating_average: 4.8, total_lessons: 24, difficulty_level: 'intermediate' },
];

export default function BundleDetailPage() {
  return (
    <>
      <section className="pt-10 sm:pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-brand-700">Home</Link><ChevronRight className="h-3 w-3" />
            <Link href="/bundles" className="hover:text-brand-700">Bundles</Link><ChevronRight className="h-3 w-3" />
            <span>Full-Stack Pro Bundle</span>
          </div>

          <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-10">
            <div>
              <Eyebrow>Bundle · Full-Stack Career</Eyebrow>
              <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                Full-Stack Pro <span className="text-gradient">Bundle</span>
              </h1>
              <p className="mt-4 text-slate-600 max-w-2xl">
                MERN + DevOps + System Design + Capstone — the complete 6-month roadmap to a Full-Stack Engineer role at a top product company.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800"><Layers className="h-4 w-4" /> 4 courses</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> 3,200+ enrolled</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-warn text-warn" /> 4.9 average</span>
              </div>

              <div className="mt-8 rounded-md bg-white border border-slate-200 shadow-card p-5">
                <h2 className="heading text-lg text-slate-900">What this bundle gets you</h2>
                <ul className="mt-3 grid sm:grid-cols-2 gap-2.5">
                  {['12-month access to all 4 courses','1:1 mentorship with senior engineers','Live placement-prep workshops','Industry-grade capstone project','Hiring partner intros','Career counsellor support'].map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Reveal>
              <div className="rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden lg:sticky lg:top-24 self-start">
                <div className="relative h-32 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 flex items-end p-5">
                  <div className="absolute top-3 right-3 bg-gradient-to-br from-rose-500 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">SAVE 54%</div>
                  <div className="text-white">
                    <div className="text-[11px] uppercase tracking-wider opacity-80">Includes</div>
                    <div className="heading text-2xl mt-0.5">4 courses</div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-baseline gap-2">
                    <span className="heading text-3xl text-slate-900">₹59,999</span>
                    <span className="text-sm text-slate-400 line-through">₹1,29,999</span>
                  </div>
                  <p className="mt-1 text-[11px] text-success font-semibold">You save ₹70,000</p>

                  <div className="mt-4 space-y-2.5">
                    <Button variant="primary" className="w-full rounded-full"><ShoppingCart className="h-4 w-4" /> Buy bundle</Button>
                    <Button variant="outline" className="w-full rounded-full"><Heart className="h-4 w-4" /> Save</Button>
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-100 text-[12px] text-slate-500 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    Bundle pricing locked for the next batch only.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Courses inside */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">Courses in this bundle</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INCLUDED.map((c, i) => <Reveal key={c.id} delay={(i % 4) * 0.05}><CourseCard course={c} index={i} /></Reveal>)}
          </div>
        </div>
      </section>

      {/* Certifications & Badges */}
      <section className="py-12 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="heading text-2xl sm:text-3xl text-slate-900">Certifications &amp; Badges</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">Complete the bundle to earn industry-recognised credentials you can showcase on LinkedIn.</p>
          </Reveal>
          <div className="mt-8 grid sm:grid-cols-3 gap-5">
            {([
              { icon: BadgeCheck,  title: 'Full-Stack Engineer Certificate', desc: 'Awarded after completing all 4 courses and the capstone project review.', color: 'text-brand-600 bg-brand-100' },
              { icon: ShieldCheck, title: 'DevOps Practitioner Badge',       desc: 'Earned by passing the Cloud & DevOps hands-on assessment.', color: 'text-emerald-600 bg-emerald-100' },
              { icon: FileCheck,   title: 'System Design Credential',       desc: 'Granted upon clearing the System Design case-study evaluation.', color: 'text-violet-600 bg-violet-100' },
            ] as const).map((b, i) => (
              <Reveal key={b.title} delay={i * 0.06}>
                <div className="rounded-md bg-white border border-slate-200 shadow-card p-5 text-center">
                  <div className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${b.color}`}>
                    <b.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 heading text-sm font-semibold text-slate-900">{b.title}</h3>
                  <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Outcome */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <Award className="h-10 w-10 text-brand-600 mx-auto" />
          <h2 className="mt-4 heading text-3xl sm:text-4xl text-slate-900">Career outcome</h2>
          <p className="mt-3 text-slate-600">95% of bundle graduates landed roles at top product companies within 4 months of completion. Average salary: ₹14.5L.</p>
        </div>
      </section>
    </>
  );
}
