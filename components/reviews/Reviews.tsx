'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Star, ThumbsUp, BadgeCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  fetchItemReviews, fetchMyReview, submitReview, markHelpful, fetchMyHelpful,
  type ReviewItemType, type PublicReview, type ReviewSummary, type MyReview,
} from '@/lib/reviews';

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
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

function fmtDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
}

/**
 * Self-contained ratings & reviews block — reused on every detail page
 * (desktop + mobile) for all reviewable item types. Reads the public review
 * feed; lets any signed-in user post / update their own review.
 */
export function Reviews({
  itemType, itemId, basePath = '', heading = 'Ratings & reviews',
  initialReviews, initialSummary, noun = 'item',
}: {
  itemType: ReviewItemType;
  itemId: number;
  basePath?: '' | '/m';
  heading?: string;
  initialReviews?: PublicReview[];
  initialSummary?: ReviewSummary;
  noun?: string;
}) {
  const { signedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [summary, setSummary] = useState<ReviewSummary>(initialSummary || { average: 0, total: 0, breakdown: {} });
  const [reviews, setReviews] = useState<PublicReview[]>(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews);
  const [mine, setMine] = useState<MyReview | null>(null);
  const [voted, setVoted] = useState<Set<number>>(new Set());

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [titleText, setTitleText] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetchItemReviews(itemType, itemId)
      .then((r) => { setSummary(r.summary); setReviews(r.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (!initialReviews) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [itemType, itemId]);

  useEffect(() => {
    if (!signedIn) { setMine(null); return; }
    let off = false;
    fetchMyReview(itemType, itemId).then((m) => {
      if (off || !m) return;
      setMine(m); setRating(m.rating); setTitleText(m.title || ''); setText(m.review_text || '');
    }).catch(() => {});
    return () => { off = true; };
  }, [signedIn, itemType, itemId]);

  // Which of these reviews the signed-in user has already marked helpful.
  useEffect(() => {
    if (!signedIn) { setVoted(new Set()); return; }
    let off = false;
    fetchMyHelpful(itemType, itemId).then((ids) => { if (!off) setVoted(new Set(ids || [])); }).catch(() => {});
    return () => { off = true; };
  }, [signedIn, itemType, itemId]);

  async function onHelpful(reviewId: number) {
    if (!signedIn) { router.push(`${basePath}/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    try {
      const res = await markHelpful(reviewId);
      setVoted((prev) => { const n = new Set(prev); if (res.viewer_has_voted) n.add(reviewId); else n.delete(reviewId); return n; });
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, helpful_count: res.helpful_count } : r)));
    } catch { /* ignore */ }
  }

  async function onSubmit() {
    if (!signedIn) { router.push(`${basePath}/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    if (rating < 1) { setError('Please pick a star rating.'); return; }
    setSubmitting(true); setError(null);
    try {
      await submitReview({ itemType, itemId, rating, title: titleText.trim() || null, review_text: text.trim() || null });
      setJustSaved(true);
      load();
      fetchMyReview(itemType, itemId).then(setMine).catch(() => {});
      setTimeout(() => setJustSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your review.');
    } finally { setSubmitting(false); }
  }

  function goToWrite() {
    if (!signedIn) { router.push(`${basePath}/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    const el = typeof document !== 'undefined' ? document.getElementById('gum-write-review') : null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const activeStars = hover || rating;

  return (
    <div>
      {/* Summary */}
      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-7 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
          <div className="text-center shrink-0">
            <div className="heading text-[3.5rem] font-extrabold text-slate-900 leading-none">{summary.average.toFixed(1)}</div>
            <Stars rating={Math.round(summary.average)} size="md" />
            <p className="mt-1.5 text-xs text-slate-500 font-medium">{summary.total} rating{summary.total === 1 ? '' : 's'}</p>
          </div>
          <div className="flex-1 space-y-2 w-full max-w-md">
            {[5, 4, 3, 2, 1].map((star) => (
              <BreakdownBar key={star} star={star} count={summary.breakdown?.[star] ?? 0} total={summary.total} />
            ))}
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[12.5px] text-slate-600">{mine ? `You've reviewed this ${noun}.` : `Share your experience with this ${noun}.`}</span>
          <button onClick={goToWrite} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm active:scale-95 transition-all">
            <Star className="h-4 w-4" /> {mine ? 'Edit your review' : 'Write a review'}
          </button>
        </div>
      </div>

      {/* Write a review */}
      <div id="gum-write-review" className="rounded-2xl border border-slate-200 bg-white p-5 mb-6 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">{mine ? 'Update your review' : 'Write a review'}</h4>
          {mine?.is_verified_purchase && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium"><BadgeCheck className="h-3.5 w-3.5" /> Verified purchase</span>
          )}
        </div>

        {!signedIn ? (
          <button
            onClick={() => router.push(`${basePath}/login?next=${encodeURIComponent(pathname || '/')}`)}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Sign in to write a review
          </button>
        ) : (
          <div className="mt-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s} type="button"
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}
                  aria-label={`${s} star${s > 1 ? 's' : ''}`} className="p-0.5"
                >
                  <Star className={`h-7 w-7 transition-colors ${activeStars >= s ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                </button>
              ))}
            </div>
            <input
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="Add a title (optional)"
              maxLength={120}
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Share what you liked about this ${noun}…`}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 resize-y"
            />
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={onSubmit} disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-sm active:scale-95 transition-all disabled:opacity-70"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mine ? 'Update review' : 'Submit review'}
              </button>
              {justSaved && (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium"><CheckCircle2 className="h-4 w-4" /> Saved — thank you!</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <h4 className="text-sm font-bold text-slate-900 mb-3">{heading}</h4>
      {loading ? (
        <div className="py-6 text-center text-slate-400 text-sm inline-flex items-center gap-2 w-full justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-sm">No reviews yet. Be the first to review this {noun}!</div>
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
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium"><BadgeCheck className="h-3 w-3" /> Verified</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars rating={r.rating} />
                    <span className="text-[11px] text-slate-400">{fmtDate(r.created_at)}</span>
                  </div>
                  {r.title && <h5 className="mt-2 text-sm font-semibold text-slate-800">{r.title}</h5>}
                  {r.review_text && <p className="mt-1 text-sm text-slate-600 leading-relaxed">{r.review_text}</p>}
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => onHelpful(r.id)}
                      aria-pressed={voted.has(r.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${voted.has(r.id) ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${voted.has(r.id) ? 'fill-brand-600 text-brand-600' : ''}`} />
                      Helpful{r.helpful_count ? ` · ${r.helpful_count}` : ''}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
