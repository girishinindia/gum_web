import { Star, ThumbsUp, TrendingUp, Quote } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { STUDENT_REVIEWS } from '@/lib/homeContent';

export function StudentReviews() {
  return (
    <section id="reviews" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <Eyebrow className="justify-center">Real Student Reviews</Eyebrow>
            <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-tight tracking-tight">
              50,000+ learners. <span className="text-gradient">4.8 average rating.</span>
            </h2>
            <p className="mt-4 text-slate-600">
              Every review is from a verified, course-completed student. No edits, no curation.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STUDENT_REVIEWS.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 0.06}>
              <article className="relative h-full rounded-md bg-white border border-slate-200 shadow-card p-6 hover:shadow-cardHover transition-all overflow-hidden">
                <Quote aria-hidden className="absolute top-5 right-5 h-9 w-9 text-brand-100" />

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className={k < r.rating ? 'h-4 w-4 fill-warn text-warn' : 'h-4 w-4 text-slate-200'} />
                  ))}
                  <span className="ml-2 text-[11px] text-slate-400">{r.date}</span>
                </div>

                <p className="mt-3 text-[14px] text-slate-700 leading-relaxed">&ldquo;{r.text}&rdquo;</p>

                <div className="mt-4 inline-flex items-center gap-1.5 bg-success/10 text-success rounded-full px-2.5 py-1 text-[11px] font-bold">
                  <TrendingUp className="h-3 w-3" /> Salary jump {r.jump}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white flex items-center justify-center heading font-bold text-sm shrink-0">
                      {r.initial}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{r.name}</div>
                      <div className="text-[11px] text-brand-600 truncate">{r.course}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-brand-700 transition-colors shrink-0"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> {r.helpful}
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
