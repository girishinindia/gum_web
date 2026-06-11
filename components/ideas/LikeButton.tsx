'use client';

/** Like/unlike a public idea — once per user, sign-in required. */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { likeIdea, unlikeIdea } from '@/lib/ideas';
import { getAccessToken } from '@/lib/auth/session';

export default function LikeButton({ ideaId, initialCount, compact = false }: { ideaId: number; initialCount: number; compact?: boolean }) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

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
