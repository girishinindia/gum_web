'use client';

/**
 * Trailer preview modal (Phase 6, June 2026).
 *
 * The course detail pages used to render a decorative play button with no
 * handler. The Bunny Stream library is token-gated (raw embed URLs 403), so
 * this button asks the API for a short-lived signed embed URL via the public
 * GET /courses/:id/trailer-playback endpoint, then plays it in a modal iframe.
 */

import { useCallback, useEffect, useState } from 'react';
import { PlayCircle, X, Loader2 } from 'lucide-react';
import { apiBase } from '@/lib/api';

interface SignedTrailer { url: string; expiresAt?: string }

async function fetchSignedTrailer(courseId: number): Promise<SignedTrailer | null> {
  try {
    // apiBase() handles localhost/LAN-IP → page-hostname rewriting in one place.
    const res = await fetch(`${apiBase()}/courses/${courseId}/trailer-playback`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.trailer?.url ? (json.data.trailer as SignedTrailer) : null;
  } catch {
    return null;
  }
}

export function TrailerPlayButton({
  courseId,
  hasTrailer,
  className = '',
  iconClassName = 'h-8 w-8 text-brand-700',
}: {
  courseId: number;
  /** courses.trailer_video_url presence — when false the button hides itself. */
  hasTrailer: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const play = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    const signed = url ? { url } : await fetchSignedTrailer(courseId);
    setBusy(false);
    if (signed?.url) {
      setUrl(signed.url);
      setOpen(true);
    } else {
      setFailed(true);
    }
  }, [busy, url, courseId]);

  // Escape closes the modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!hasTrailer) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Play course trailer"
        onClick={play}
        className={className || 'relative h-16 w-16 rounded-full bg-white/95 flex items-center justify-center shadow-cardHover hover:scale-105 transition-transform'}
      >
        {busy ? <Loader2 className={`${iconClassName} animate-spin`} /> : <PlayCircle className={iconClassName} />}
      </button>
      {failed && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 text-white text-[11px] px-3 py-1">
          Trailer unavailable right now
        </span>
      )}

      {open && url && (
        <div
          className="fixed inset-0 z-[80] bg-slate-950/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Course trailer"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Close trailer"
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative w-full rounded-md overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`${url}${url.includes('?') ? '&' : '?'}autoplay=true`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Course trailer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
