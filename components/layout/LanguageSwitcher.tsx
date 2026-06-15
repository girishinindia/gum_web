'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLanguage } from './LanguageProvider';

/**
 * Header language switcher — now driven by <LanguageProvider> so the mega-menu
 * and any other section can react to language changes.
 */
/**
 * Public wrapper — the inner component reads `useSearchParams`, which Next.js
 * requires to sit under a <Suspense> boundary or the production build bails out
 * ("useSearchParams() should be wrapped in a suspense boundary"). Wrapping here
 * means every call site (the shared HeaderShell, etc.) is safe automatically.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <LanguageSwitcherInner className={className} />
    </Suspense>
  );
}

function LanguageSwitcherInner({ className }: { className?: string }) {
  const { languages, active, setActive } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /**
   * BUG-18 / BUG-55: changing language must also update `?language_id=<id>` so
   * server-rendered, language-aware pages (legal/[code], faq) re-fetch in the
   * chosen language — previously this only flipped React state, leaving the
   * already-rendered policy/FAQ content stuck on the old language. We persist
   * the iso (existing behaviour, drives the mega-menu via `active.id`) AND
   * rewrite the URL, preserving the current path + other query params.
   */
  function chooseLanguage(iso: string, id?: number) {
    setActive(iso);
    setOpen(false);
    if (id == null) return;
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('language_id', String(id));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!languages.length) return null;

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium',
          'text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-300 bg-white/60 transition-colors',
          open && 'text-brand-700 border-brand-300 ring-2 ring-brand-200',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span>{active?.name || 'English'}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 opacity-60 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-64 rounded-md bg-white shadow-cardHover border border-slate-200/70 overflow-hidden z-50"
        >
          <ul className="py-1.5 max-h-[340px] overflow-y-auto">
            {languages.map((l) => {
              const isActive = l.iso_code === active?.iso_code;
              return (
                <li key={l.id ?? l.iso_code}>
                  <button
                    type="button"
                    onClick={() => chooseLanguage(l.iso_code, l.id)}
                    className={cn(
                      'group w-full flex items-center justify-between gap-4 px-4 py-2.5 text-sm transition-colors text-left',
                      isActive
                        ? 'text-brand-700 font-semibold bg-brand-50/60'
                        : 'text-slate-800 hover:bg-brand-50/40 hover:text-brand-700',
                    )}
                  >
                    <span className="truncate">{l.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {l.native_name && l.native_name !== l.name && (
                        <span className={cn(
                          'text-[13px]',
                          isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500',
                        )}>
                          {l.native_name}
                        </span>
                      )}
                      {isActive && <Check className="h-4 w-4 text-brand-600 shrink-0" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
