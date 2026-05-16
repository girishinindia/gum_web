'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * SearchableSelect — typeahead-filtered dropdown.
 *
 * Native `<select>` is fine for short lists but breaks down for the
 * profile-page lookups (Tamil Nadu has 891 cities, the social-media
 * master list has 11 platforms with rich metadata). This component is
 * a generic combobox that:
 *
 *   • Renders as a clickable trigger button showing the current label.
 *   • Opens a popover with a search input + scrollable filtered list.
 *   • Filters client-side via case-insensitive substring on `getLabel`.
 *   • Keyboard nav: ↓↑ to move, Enter to pick, Esc to close.
 *   • Click-outside / Esc closes the popover.
 *   • Renders an optional `leading` slot per row (used by SocialMedia
 *     to put the platform icon next to the name).
 *
 * ## Why createPortal
 *
 * The popover is rendered into `document.body` via `createPortal`. Each
 * profile section is wrapped in a `Card` with `overflow: hidden` (for
 * the rounded corners), which would otherwise clip the popover. The
 * trigger's bounding rect drives the portal's `top` / `left` / `width`,
 * and we reposition on scroll + resize so the popover stays attached.
 *
 * Type parameter `T` is the option object shape. The two `get*` callbacks
 * tell the component how to extract the form value (e.g. country name,
 * platform code) and the visible label (e.g. country name, "LinkedIn").
 */
export interface SearchableSelectProps<T> {
  /** Current selected value (must match what `getValue` returns for one of the options, or '' for none). */
  value: string;
  /** Called with the new `getValue(option)` when the user picks a row. */
  onChange: (next: string) => void;
  /** Available options. */
  options: T[];
  /** Map an option → form value (what gets stored / sent to API). */
  getValue: (o: T) => string;
  /** Map an option → visible label. */
  getLabel: (o: T) => string;
  /** Optional secondary label rendered as faded text (e.g. category, sublabel). */
  getSublabel?: (o: T) => string | null | undefined;
  /** Optional leading visual (e.g. an icon) rendered to the left of the label. */
  renderLeading?: (o: T) => React.ReactNode;
  /** Placeholder text on the trigger when no value is selected. */
  placeholder?: string;
  /** Placeholder text inside the search box. */
  searchPlaceholder?: string;
  /** Disables the trigger entirely. */
  disabled?: boolean;
  /** Shows a spinner inside the trigger; usually paired with `disabled`. */
  loading?: boolean;
  /** Text shown when the filtered result set is empty. */
  emptyText?: string;
  /** Optional tailwind classes for the trigger. */
  className?: string;
}

export function SearchableSelect<T>({
  value, onChange, options,
  getValue, getLabel, getSublabel, renderLeading,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  disabled = false,
  loading = false,
  emptyText = 'No matches',
  className,
}: SearchableSelectProps<T>) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [active, setActive]   = useState(0);
  const [mounted, setMounted] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0, openUp: false });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  // Mark "mounted" so we only attempt createPortal once we have a document.
  useEffect(() => setMounted(true), []);

  // ── Filtering ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => getLabel(o).toLowerCase().includes(q)
      || (getSublabel?.(o) || '').toLowerCase().includes(q));
  }, [options, query, getLabel, getSublabel]);

  // ── Selected label for the trigger ───────────────────────────────────
  const selected = useMemo(
    () => options.find((o) => getValue(o) === value),
    [options, value, getValue],
  );

  // ── Outside-click + Escape closes ────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePopover = popoverRef.current?.contains(target);
      if (!insideTrigger && !insidePopover) {
        setOpen(false);
        setQuery('');
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // ── Position the portal popover relative to the trigger ──────────────
  // useLayoutEffect avoids a flash of mis-positioned popover before paint.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      // If the trigger is in the bottom 40% of the viewport, open upward
      // so the popover doesn't get clipped by the window edge.
      const popoverMaxH = 340; // ~= search input + 260 list + footer
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < popoverMaxH && rect.top > popoverMaxH;
      setPopoverPos({
        top: openUp
          ? rect.top + window.scrollY - 4
          : rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
        openUp,
      });
    };
    update();
    // `true` (capture phase) catches scrolls in ANY ancestor — important
    // because the profile page is inside a scrollable shell.
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // Focus the search input + reset the active row when the popover opens.
  useEffect(() => {
    if (open) {
      setActive(0);
      // setTimeout lets the portal mount before we focus.
      const id = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  function commit(o: T) {
    onChange(getValue(o));
    setOpen(false);
    setQuery('');
  }

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const choice = filtered[active];
      if (choice) commit(choice);
    }
  }

  const popover = (
    <div
      ref={popoverRef}
      role="listbox"
      style={{
        position: 'absolute',
        top: popoverPos.openUp ? undefined : popoverPos.top,
        // When opening upward, anchor `bottom` to the trigger's top.
        bottom: popoverPos.openUp
          ? document.documentElement.scrollHeight - popoverPos.top
          : undefined,
        left: popoverPos.left,
        width: popoverPos.width,
      }}
      className="z-[1000] bg-white border border-slate-200 rounded-md shadow-cardHover overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-2.5 py-2">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onSearchKey}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); searchRef.current?.focus(); }}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="max-h-[260px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-sm text-slate-500 text-center">{emptyText}</div>
        ) : (
          filtered.map((o, i) => {
            const v = getValue(o);
            const isSelected = v === value;
            const isActive   = i === active;
            return (
              <button
                key={v || `idx-${i}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => commit(o)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-l-2 transition-colors',
                  isActive ? 'bg-brand-50 border-brand-500' : 'border-transparent',
                  isSelected && !isActive && 'bg-brand-50/40',
                )}
              >
                {renderLeading && (
                  <span className="shrink-0 flex items-center">{renderLeading(o)}</span>
                )}
                <span className="flex-1 flex items-baseline gap-2 truncate">
                  <span className={cn('truncate', isSelected ? 'font-semibold text-brand-700' : 'text-slate-800')}>
                    {getLabel(o)}
                  </span>
                  {getSublabel?.(o) && (
                    <span className="text-[11px] text-slate-400 truncate">{getSublabel(o)}</span>
                  )}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-brand-600 shrink-0" />}
              </button>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <div className="px-3 py-1.5 border-t border-slate-100 text-[10.5px] uppercase tracking-wider font-bold text-slate-400 flex justify-between">
          <span>{filtered.length} {filtered.length === 1 ? 'match' : 'matches'}</span>
          <span className="font-normal normal-case tracking-normal text-slate-300 hidden sm:inline">
            ↓↑ Enter · Esc to close
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'w-full flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-left transition-colors',
          open
            ? 'border-brand-400 ring-2 ring-brand-100'
            : 'border-slate-200 hover:border-slate-300',
          disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed hover:border-slate-200',
          className,
        )}
      >
        {selected && renderLeading && (
          <span className="shrink-0 flex items-center">{renderLeading(selected)}</span>
        )}
        <span className={cn('flex-1 truncate', !selected && 'text-slate-400')}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        {loading
          ? <Loader2 className="h-3.5 w-3.5 text-slate-400 animate-spin shrink-0" />
          : <ChevronDown className={cn('h-4 w-4 text-slate-400 shrink-0 transition-transform', open && 'rotate-180')} />}
      </button>

      {/* The popover is portaled to <body> so it escapes any parent
          `overflow: hidden` (e.g. the Card wrapper on each section).
          We guard `mounted` for SSR — createPortal needs `document`. */}
      {open && mounted && createPortal(popover, document.body)}
    </>
  );
}
