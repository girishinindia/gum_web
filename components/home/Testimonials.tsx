import { Star, TrendingUp, Quote } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { TESTIMONIALS } from '@/lib/homeContent';

export function Testimonials() {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <Eyebrow className="justify-center">Success Stories</Eyebrow>
            <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-tight tracking-tight">Real Careers. Real Salary Jumps.</h2>
          </div>
        </Reveal>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 2) * 0.1}>
              <article className="relative rounded-md bg-white border border-slate-200 shadow-card p-6 hover:shadow-cardHover transition-all overflow-hidden">
                <Quote aria-hidden className="absolute top-5 right-5 h-10 w-10 text-brand-100" />
                <div className="inline-flex items-center gap-1.5 bg-success/10 text-success rounded-full px-3 py-1 text-[11px] font-bold">
                  <TrendingUp className="h-3.5 w-3.5" /> {t.salaryBefore} → {t.salaryAfter} · {t.jump}
                </div>
                <div className="mt-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-warn text-warn" />
                  ))}
                </div>
                <p className="mt-3 text-slate-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white flex items-center justify-center heading font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    <div className="text-[12px] text-slate-500">{t.role}</div>
                    <div className="text-[11px] text-brand-600 mt-0.5">{t.course}</div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
