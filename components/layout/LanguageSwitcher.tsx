'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Language } from '@/lib/api';

interface Props {
  languages: Language[];
  className?: string;
}

/**
 * Header language switcher.
 * Receives pre-filtered (is_active && for_material) languages from the server
 * so there's no client-side fetch flash.
 * Layout mirrors the existing PHP site: name on left, native script in a
 * lighter color on the right, current row highlighted with brand blue.
 */
export function LanguageSwitcher({ languages, className }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(() => languages[0]?.iso_code || 'en');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const current = languages.find((l) => l.iso_code === active) ?? languages[0];

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
        <span>{current?.name || 'English'}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 opacity-60 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-64 rounded-md bg-white shadow-cardHover border border-slate-200/70 overflow-hidden z-50"
        >
          <ul className="py-1.5 max-h-[340px] overflow-y-auto">
            {languages.map((l) => {
              const isActive = l.iso_code === active;
              return (
                <li key={l.id ?? l.iso_code}>
                  <button
                    type="button"
                    onClick={() => { setActive(l.iso_code); setOpen(false); }}
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
