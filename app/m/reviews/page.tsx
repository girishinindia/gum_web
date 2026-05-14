import { Star, ThumbsUp } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { STUDENT_REVIEWS } from '@/lib/homeContent';

/**
 * Mobile student-reviews listing — uses STUDENT_REVIEWS seed until a real
 * /reviews endpoint exists.
 */
export default function MobileReviewsPage() {
  const avg = (STUDENT_REVIEWS.reduce((s, r) => s + r.rating, 0) / STUDENT_REVIEWS.length).toFixed(1);

  return (
    <div>
      <MobilePageHeader title="Student Reviews" />

      {/* Aggregate strip */}
      <div className="px-3 pt-3">
        <div className="rounded-md bg-gradient-to-br from-brand-500 to-accent text-white p-4 shadow-cardHover">
          <div className="flex items-center gap-3">
            <div className="text-3xl heading">{avg}</div>
            <div>
              <div className="inline-flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-white text-white" />
                ))}
              </div>
              <div className="text-[11.5px] opacity-90 mt-0.5">Based on {STUDENT_REVIEWS.length * 250}+ verified reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="px-3 pt-3 pb-4 space-y-2.5">
        {STUDENT_REVIEWS.map((r) => (
          <article key={r.id} className="rounded-md bg-white border border-slate-200 p-3.5 shadow-card">
            <header className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-[12px] font-bold flex items-center justify-center">
                {r.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-slate-900 truncate">{r.name}</div>
                <div className="text-[10.5px] text-brand-700 truncate">{r.course}</div>
              </div>
              <div className="text-[10px] text-slate-400">{r.date}</div>
            </header>

            <div className="mt-2 inline-flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star
                  key={k}
                  className={k < r.rating ? 'h-3 w-3 fill-warn text-warn' : 'h-3 w-3 text-slate-200'}
                />
              ))}
              <span className="ml-2 text-[10.5px] font-semibold text-emerald-600">Salary {r.jump} jump</span>
            </div>

            <p className="mt-2 text-[12px] text-slate-700 leading-snug">&ldquo;{r.text}&rdquo;</p>

            <footer className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="h-2.5 w-2.5" /> {r.helpful} found this helpful
              </span>
              <button type="button" className="font-semibold text-brand-700 active:scale-95 transition-all">
                Helpful
              </button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
