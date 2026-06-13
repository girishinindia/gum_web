'use client';

/** Like/unlike a public idea — once per user, sign-in required. */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { likeIdea, unlikeIdea, fetchMyLikedIdeaIds } from '@/lib/ideas';
import { getAccessToken } from '@/lib/auth/session';

/**
 * BUG-80: the public showcase is ISR/anonymous, so the signed-in user's
 * liked-state can't be baked into the static page (that would leak per-user
 * data into the shared cache). Instead, every LikeButton hydrates client-side
 * on mount. Multiple buttons render per page (the showcase grid), so we share
 * a single `GET /ideas/my-likes` request via this module-level memoized promise
 * — "fetch once", then each button reads its own id out of the resulting set.
 */
let likedIdsPromise: Promise<Set<number>> | null = null;
function loadMyLikedIds(): Promise<Set<number>> {
  if (!likedIdsPromise) {
    likedIdsPromise = fetchMyLikedIdeaIds()
      .then((ids) => new Set(ids ?? []))
      .catch(() => new Set<number>()); // signed-out / error → nothing liked
  }
  return likedIdsPromise;
}

// `initialLiked` lets a parent seed the filled/red heart directly; when omitted
// the button self-hydrates from the shared liked-ids fetch above.
export default function LikeButton({ ideaId, initialCount, initialLiked = false, compact = false }: { ideaId: number; initialCount: number; initialLiked?: boolean; compact?: boolean }) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  // Keep state in sync if a parent later passes an explicit `initialLiked`
  // (initial useState only reads the prop once).
  useEffect(() => { setLiked(initialLiked); }, [initialLiked]);

  // BUG-80: hydrate the heart from the server for signed-in users. Skipped
  // entirely when signed-out so the ISR cache and anonymous visitors are
  // unaffected. Guards against post-unmount setState.
  useEffect(() => {
    if (initialLiked || !getAccessToken()) return;
    let alive = true;
    loadMyLikedIds().then((ids) => { if (alive && ids.has(ideaId)) setLiked(true); });
    return () => { alive = false; };
  }, [ideaId, initialLiked]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!getAccessToken()) { router.push('/auth/sign-in'); return; }
    if (busy) return;
    setBusy(true);
    try {
      const res = liked ? await unlikeIdea(ideaId) : await likeIdea(ideaId);
      setLiked(res.liked);
      setCount(res.likes_count);
    } catch { /* keep state */ }
    setBusy(false);
  };

  return (
    <button onClick={toggle} disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'} font-semibold ${
        liked ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-500'}`}
      aria-label={liked ? 'Unlike' : 'Like'}>
      <Heart className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
      {count.toLocaleString('en-IN')}
    </button>
  );
}
