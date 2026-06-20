'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { markHelpful } from '@/lib/reviews';

/**
 * Small client island that lets a signed-in learner mark a review "Helpful".
 * Safe to drop inside server components (e.g. ReviewSection). Toggles the vote
 * and reflects the live helpful_count returned by the API.
 */
export function HelpfulButton({
  reviewId, initialCount = 0, initialVoted = false, basePath = '',
}: {
  reviewId: number;
  initialCount?: number;
  initialVoted?: boolean;
  basePath?: '' | '/m';
}) {
  const { signedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!signedIn) { router.push(`${basePath}/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    if (busy) return;
    setBusy(true);
    try {
      const res = await markHelpful(reviewId);
      setVoted(res.viewer_has_voted);
      setCount(res.helpful_count);
    } catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={voted}
      className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${voted ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
    >
      <ThumbsUp className={`h-3.5 w-3.5 ${voted ? 'fill-brand-600 text-brand-600' : ''}`} />
      Helpful{count ? ` · ${count}` : ''}
    </button>
  );
}
