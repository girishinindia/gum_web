'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────

export interface PriceRangeState {
  isFree: boolean;
  min: string;
  max: string;
}

interface Props {
  label?: string;
  value: PriceRangeState;
  onChange: (next: PriceRangeState) => void;
  /** Debounce delay (ms) for the min/max number inputs (default 500) */
  debounceMs?: number;
}

// ─── Component ──────────────────────────────────────────────────────────

export function PriceRangeCard({ label = 'Price Range', value, onChange, debounceMs = 500 }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  // Local state for the text inputs so typing is smooth (debounced → parent)
  const [localMin, setLocalMin] = useState(value.min);
  const [localMax, setLocalMax] = useState(value.max);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local inputs when parent resets (e.g. "clear all")
  useEffect(() => {
    setLocalMin(value.min);
    setLocalMax(value.max);
  }, [value.min, value.max]);

  function emitDebounced(nextMin: string, nextMax: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange({ isFree: false, min: nextMin, max: nextMax });
    }, debounceMs);
  }

  function handleFreeToggle(checked: boolean) {
    // Free is mutually exclusive with min/max
    if (checked) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setLocalMin('');
      setLocalMax('');
      onChange({ isFree: true, min: '', max: '' });
    } else {
      onChange({ isFree: false, min: '', max: '' });
    }
  }

  function handleMinChange(val: string) {
    setLocalMin(val);
    emitDebounced(val, localMax);
  }

  function handleMaxChange(val: string) {
    setLocalMax(val);
    emitDebounced(localMin, val);
  }

  return (
    <div className="rounded-lg bg-white border border-slate-200 shadow-card overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-2.5">
          {/* Free checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-brand-700">
            <input
              type="checkbox"
              checked={value.isFree}
              onChange={(e) => handleFreeToggle(e.target.checked)}
              className="rounded accent-brand-500 h-3.5 w-3.5 flex-shrink-0"
            />
            <span className={value.isFree ? 'text-brand-700 font-medium' : ''}>Free Courses</span>
          </label>

          {/* Divider text */}
          <p className="text-[11px] text-slate-400 select-none">or set a custom range</p>

          {/* Min / Max inputs */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min ₹"
              value={localMin}
              disabled={value.isFree}
              onChange={(e) => handleMinChange(e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed"
            />
            <span className="text-xs text-slate-400">—</span>
            <input
              type="number"
              min="0"
              placeholder="Max ₹"
              value={localMax}
              disabled={value.isFree}
              onChange={(e) => handleMaxChange(e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
