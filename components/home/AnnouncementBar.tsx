'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ANNOUNCEMENTS } from '@/lib/homeContent';
import { cn } from '@/lib/cn';

/**
 * Top sticky announcement bar — auto-rotates through the configured items.
 * Static data for now; will move to /announcements API later.
 */
export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [closed, setClosed] = useState(false);
  const n = ANNOUNCEMENTS.length;

  useEffect(() => {
    if (closed || n <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 5000);
    return () => clearInterval(t);
  }, [closed, n]);

  if (closed || n === 0) return null;
  const item = ANNOUNCEMENTS[idx];

  return (
    <div className="relative bg-gradient-to-r from-brand-600 via-brand-500 to-accent text-white text-[13px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setIdx((i) => (i - 1 + n) % n)}
              className="hidden sm:inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/15 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <Link
              href={item.href}
              className="flex items-center gap-2 min-w-0 flex-1 sm:justify-center group"
            >
              <span aria-hidden className="text-base shrink-0">{item.emoji}</span>
              <span className="truncate font-medium">{item.text}</span>
              <span className="hidden sm:inline text-white/80 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>

            <button
              type="button"
              aria-label="Next"
              onClick={() => setIdx((i) => (i + 1) % n)}
              className="hidden sm:inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/15 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 mr-2">
              {ANNOUNCEMENTS.map((_, i) => (
                <span key={i} className={cn('h-1.5 rounded-full transition-all', i === idx ? 'bg-white w-5' : 'bg-white/40 w-1.5')} />
              ))}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setClosed(true)}
              className="h-6 w-6 inline-flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
