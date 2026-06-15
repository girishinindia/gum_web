'use client';

import { Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Gradient share pill for mobile detail headers (June 2026).
 *
 * Replaces the old static, non-interactive share <span>. On tap it opens the
 * device's native share sheet via `navigator.share` — which is how Instagram,
 * WhatsApp, etc. appear on mobile — and falls back to copying the link when the
 * browser has no share sheet.
 *
 * If no `url` is passed it shares the canonical desktop URL for the current
 * page (the mobile routes mirror the desktop ones under a `/m` prefix), so a
 * shared link opens the full page on any device.
 */
export function MobileShareButton({ title, url }: { title: string; url?: string }) {
  const [abs, setAbs] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (url) {
      setAbs(/^https?:\/\//i.test(url) ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`);
    } else {
      // Strip the "/m" mobile prefix → canonical desktop URL for sharing.
      const canonicalPath = window.location.pathname.replace(/^\/m(?=\/|$)/, '') || '/';
      setAbs(`${window.location.origin}${canonicalPath}`);
    }
  }, [url]);

  const onShare = async () => {
    const shareUrl = abs || (typeof window !== 'undefined' ? window.location.href : '');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title, url: shareUrl }); } catch { /* user dismissed */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { window.prompt('Copy this link:', shareUrl); }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="Share"
      title={copied ? 'Link copied!' : 'Share'}
      className="relative h-9 w-9 inline-flex items-center justify-center rounded-full text-white shadow-sm bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 active:scale-95 transition"
    >
      <Share2 className="h-4 w-4" />
      {copied && (
        <span className="absolute -bottom-6 right-0 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white shadow">Copied!</span>
      )}
    </button>
  );
}
