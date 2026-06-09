'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SortOption } from './SortDropdown';

// ─── Types ──────────────────────────────────────────────────────────────

interface Props {
  /** Total items across all pages */
  total: number;
  /** Currently displayed count */
  showing: number;
  /** Current page */
  page: number;
  /** Items per page */
  pageSize: number;
  loading?: boolean;
  /** Sort controls */
  sortOptions: SortOption[];
  sortValue: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sort: string, order: 'asc' | 'desc') => void;
  /** Page size options (e.g. [12, 24, 48]) */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

// ─── Component ──────────────────────────────────────────────────────────

export function ResultStrip({
  total,
  showing,
  page,
  pageSize,
  loading = false,
  sortOptions,
  sortValue,
  sortOrder,
  onSortChange,
  pageSizeOptions = [12, 24, 48],
  onPageSizeChange,
}: Props) {
  // Derive the range from the actual rendered count so the label always matches
  // the grid. An out-of-range / empty page shows 0–0 (never "13–12").
  const start = total === 0 || showing === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 || showing === 0 ? 0 : Math.min((page - 1) * pageSize + showing, total);

  return (
    <div className="rounded-xl bg-gradient-to-r from-sky-50 via-sky-50/60 to-white border border-sky-100/80 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Left: Showing count */}
      <div className="text-sm text-slate-600">
        {loading ? (
          <span className="inline-block h-4 w-48 bg-sky-100 rounded animate-pulse" />
        ) : (
          <>
            Showing{' '}
            <span className="font-bold text-slate-800">{start}–{end}</span>
            {' '}of{' '}
            <span className="font-bold text-brand-700">{total.toLocaleString()}</span>
            {' '}results
          </>
        )}
      </div>

      {/* Right: Sort + Show */}
      <div className="flex items-center gap-3">
        <MiniSelect
          label="Sort by:"
          options={sortOptions.map((o) => ({ value: `${o.sort}|${o.order}`, label: o.label }))}
          value={`${sortValue}|${sortOrder}`}
          onChange={(val) => {
            const [s, o] = val.split('|');
            onSortChange(s, o as 'asc' | 'desc');
          }}
        />
        {onPageSizeChange && (
          <MiniSelect
            label="Show:"
            options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
            value={String(pageSize)}
            onChange={(val) => onPageSizeChange(parseInt(val))}
          />
        )}
      </div>
    </div>
  );
}

// ─── Inline mini dropdown ───────────────────────────────────────────────

function MiniSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="flex items-center gap-1.5">
      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-brand-300 transition-colors"
        >
          <span className="truncate max-w-[120px]">{current?.label ?? '—'}</span>
          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          /* Anchored to the button (not the label), width fits content but never
             narrower than the trigger, clipped so it stays aligned with the box. */
          <div className="absolute right-0 top-full mt-1 w-max min-w-full max-w-[220px] bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 overflow-hidden">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`block w-full text-left px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                  o.value === value
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
