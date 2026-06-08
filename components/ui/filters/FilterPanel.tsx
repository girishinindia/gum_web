'use client';

import { SlidersHorizontal } from 'lucide-react';

/**
 * FilterPanel — sidebar wrapper with a left blue gradient strip,
 * "Filters" heading + "Clear All" link, and a search input.
 * Matches the growupmore.com sidebar design.
 */

interface Props {
  /** Callback for the "Clear All" link */
  onClearAll: () => void;
  /** Whether any filters are active (controls Clear All visibility) */
  hasActiveFilters?: boolean;
  children: React.ReactNode;
}

export function FilterPanel({ onClearAll, hasActiveFilters = false, children }: Props) {
  return (
    <div className="flex h-full">
      {/* ── Left blue gradient strip — full height ── */}
      <div className="w-2 flex-shrink-0 rounded-l-xl bg-gradient-to-b from-sky-300 via-brand-400 to-sky-300" />

      {/* ── Panel body ── */}
      <div className="flex-1 min-w-0 rounded-r-xl bg-gradient-to-b from-sky-50/80 via-white to-sky-50/40 border border-l-0 border-sky-100/80 shadow-card">
        {/* ── Header: Filters + Clear All ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" />
            <h3 className="text-base font-bold text-slate-800">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-sky-100/80" />

        {/* ── Filter sections ── */}
        <div className="px-4 py-4 space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}
