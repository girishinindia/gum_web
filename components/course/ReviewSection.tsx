import { Star, BadgeCheck } from 'lucide-react';
import type { CourseReview, ReviewSummary } from '@/lib/api';
import { HelpfulButton } from '@/components/reviews/HelpfulButton';

interface Props {
  reviews: CourseReview[];
  summary: ReviewSummary;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </span>
  );
}

function BreakdownBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-3 text-right text-slate-500 font-medium">{star}</span>
      <div className="flex-1 h-2.5 bg-sky-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-slate-400 text-right">{pct}%</span>
    </div>
  );
}

function formatReviewDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function ReviewSection({ reviews, summary }: Props) {
  return (
    <div>
      {/* Course Rating card — always shown, even with 0 reviews (matches live site) */}
      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-7 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
          {/* Left: big average score */}
          <div className="text-center shrink-0">
            <div className="heading text-[3.5rem] font-extrabold text-slate-900 leading-none">{summary.average.toFixed(1)}</div>
            <StarRating rating={Math.round(summary.average)} size="md" />
            <p className="mt-1.5 text-xs text-slate-500 font-medium">Course Rating</p>
          </div>
          {/* Right: breakdown bars */}
          <div className="flex-1 space-y-2 w-full max-w-md">
            {[5, 4, 3, 2, 1].map((star) => (
              <BreakdownBar key={star} star={star} count={summary.breakdown[star] ?? 0} total={summary.total} />
            ))}
          </div>
        </div>
      </div>

      {/* Empty state or individual reviews */}
      {reviews.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-sm">
          No reviews yet. Be the first to review this course!
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {r.reviewer_image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={r.reviewer_image} alt={r.reviewer_name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-sm flex items-center justify-center shrink-0">
                    {initials(r.reviewer_name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{r.reviewer_name}</span>
                    {r.is_verified_purchase && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={r.rating} />
                    <span className="text-[11px] text-slate-400">{formatReviewDate(r.created_at)}</span>
                  </div>
                  {r.title && <h4 className="mt-2 text-sm font-semibold text-slate-800">{r.title}</h4>}
                  {r.review_text && <p className="mt-1 text-sm text-slate-600 leading-relaxed">{r.review_text}</p>}
                  <HelpfulButton reviewId={r.id} initialCount={r.helpful_count ?? 0} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
