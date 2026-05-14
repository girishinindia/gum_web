'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, X } from 'lucide-react';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/cn';

interface Props {
  open:    boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet style language picker for the mobile portal.
 *
 * Slides up from the bottom of the viewport with a scrim behind it. Lists
 * every active material language from the `LanguageProvider`; the currently
 * selected one is highlighted with a checkmark. Tapping a language flips
 * the cookie/context and closes the sheet — no page reload needed.
 *
 * Replaces the inline pills that used to live inside the drawer so users
 * have a dedicated, focused surface for picking a language (matches the
 * pattern most native mobile apps use).
 */
export function MobileLanguagePopup({ open, onClose }: Props) {
  const { languages, active, setActive } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Portal to <body> after hydration so neither an ancestor's `transform`,
  // `filter`, `overflow`, nor the page's `pt-[58px]` content padding can
  // hijack the sheet's viewport-bottom anchor. This was the root cause of
  // the "only the popup header shows" bug on some Android phones.
  useEffect(() => setMounted(true), []);

  // ESC closes on desktop; body-scroll-lock keeps the page from scrolling
  // behind the sheet while it's open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  function pick(iso: string) {
    setActive(iso);
    // Tiny delay so the user sees the checkmark land before the sheet
    // dismisses — feels more responsive than an instant close.
    setTimeout(onClose, 120);
  }

  const sheet = (
    <>
      {/* Scrim — z-index sits above the bottom-nav (z-60) and the top app
          bar (z-50) so taps elsewhere on the page are properly intercepted. */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-[80] bg-slate-900/45 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Sheet — z-[85] above scrim. `max-h-[85svh]` uses the small-viewport
          unit so Android Chrome's collapsing address bar can't clip the
          sheet's content area. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose language"
        className={cn(
          'fixed left-0 right-0 bottom-0 z-[85]',
          'bg-white rounded-t-3xl shadow-[0_-12px_40px_rgba(15,23,42,0.18)]',
          'max-h-[85svh] flex flex-col',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
      >
        {/* Drag affordance + header */}
        <div className="pt-2 pb-3 px-5 border-b border-slate-100 relative">
          <div aria-hidden className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-slate-200" />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <div className="heading text-[15px] font-bold text-slate-900">Choose language</div>
                <div className="text-[11px] text-slate-500">Pick the language for course names &amp; content</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Language list — scrollable if longer than the sheet's max height */}
        <ul className="flex-1 overflow-y-auto px-2 py-2">
          {languages.map((l) => {
            const isCur = l.iso_code === active?.iso_code;
            return (
              <li key={l.iso_code}>
                <button
                  type="button"
                  onClick={() => pick(l.iso_code)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-all active:scale-[0.99]',
                    isCur ? 'bg-brand-50' : 'hover:bg-slate-50',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-8 w-8 items-center justify-center rounded-md font-bold text-[11px] shrink-0',
                      isCur ? 'bg-brand-500 text-white shadow-btn' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {l.iso_code.toUpperCase()}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={cn('block text-[13.5px] font-semibold', isCur ? 'text-brand-700' : 'text-slate-800')}>
                      {l.name}
                    </span>
                    {l.native_name && l.native_name !== l.name && (
                      <span className="block text-[11px] text-slate-500 truncate">{l.native_name}</span>
                    )}
                  </span>
                  {isCur && <Check className="h-4 w-4 text-brand-600 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );

  // SSR / pre-hydration: render in-tree so server HTML matches. After
  // hydration, relocate to <body> so no ancestor can clip the sheet.
  if (!mounted) return sheet;
  if (typeof document === 'undefined') return sheet;
  return createPortal(sheet, document.body);
}
