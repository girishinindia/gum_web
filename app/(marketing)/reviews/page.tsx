import { Star, ThumbsUp } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { STUDENT_REVIEWS } from '@/lib/homeContent';

export default function ReviewsPage() {
  const avg = (STUDENT_REVIEWS.reduce((s, r) => s + r.rating, 0) / STUDENT_REVIEWS.length).toFixed(1);

  return (
    <>
      <PageHero
        eyebrow="Student Reviews"
        title={<>Real stories from <span className="text-gradient">real learners</span></>}
        subtitle="See how Grow Up More has helped thousands of students advance their careers."
      />

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Aggregate strip */}
          <Reveal>
            <div className="rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white p-6 shadow-cardHover flex items-center gap-5">
              <div className="text-5xl heading">{avg}</div>
              <div>
                <div className="inline-flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-white text-white" />
                  ))}
                </div>
                <div className="mt-1 text-sm opacity-90">Based on {STUDENT_REVIEWS.length * 250}+ verified reviews</div>
              </div>
            </div>
          </Reveal>

          {/* Reviews grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STUDENT_REVIEWS.map((r, i) => (
              <Reveal key={r.id} delay={(i % 3) * 0.06}>
                <article className="rounded-md bg-white border border-slate-200 shadow-card p-5 hover:shadow-cardHover transition-all">
                  <header className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-sm font-bold flex items-center justify-center">
                      {r.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{r.name}</div>
                      <div className="text-[11px] text-brand-700 truncate">{r.course}</div>
                    </div>
                    <div className="text-[11px] text-slate-400">{r.date}</div>
                  </header>

                  <div className="mt-3 inline-flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star
                        key={k}
                        className={k < r.rating ? 'h-3.5 w-3.5 fill-warn text-warn' : 'h-3.5 w-3.5 text-slate-200'}
                      />
                    ))}
                    <span className="ml-2 text-[11px] font-semibold text-emerald-600">Salary {r.jump} jump</span>
                  </div>

                  <p className="mt-3 text-[13px] text-slate-700 leading-relaxed">&ldquo;{r.text}&rdquo;</p>

                  <footer className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> {r.helpful} found this helpful
                    </span>
                    <button type="button" className="font-semibold text-brand-700 hover:text-brand-800 transition-colors">
                      Helpful
                    </button>
                  </footer>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
