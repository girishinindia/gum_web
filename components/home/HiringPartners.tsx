import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { HIRING_PARTNERS } from '@/lib/homeContent';

export function HiringPartners() {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <Eyebrow className="justify-center">Hiring Partners</Eyebrow>
            <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-tight tracking-tight">250+ Companies Hiring Our Learners</h2>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {HIRING_PARTNERS.map((p, i) => (
            <Reveal key={p} delay={(i % 6) * 0.04}>
              <div className="rounded-md bg-white border border-slate-200 shadow-card h-16 flex items-center justify-center font-semibold text-slate-600 hover:text-brand-700 hover:border-brand-200 hover:-translate-y-0.5 transition-all text-sm">
                {p}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
