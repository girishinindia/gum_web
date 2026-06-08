'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────

export interface DropdownOption {
  value: string;
  label: string;
  count?: number;
}

// ─── Single-select dropdown ─────────────────────────────────────────────

interface FilterDropdownProps {
  label: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string;                    // currently selected value ('' = none)
  onChange: (value: string) => void; // '' means deselected
}

export function FilterDropdown({
  label,
  placeholder = 'Select…',
  options,
  value,
  onChange,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
        {label}
      </span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            open
              ? 'border-brand-400 ring-2 ring-brand-500/20'
              : 'border-slate-200 hover:border-brand-300'
          } bg-white`}
        >
          <span className={selected ? 'text-slate-800 font-medium truncate' : 'text-slate-400 truncate'}>
            {selected ? selected.label : placeholder}
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            {selected && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onChange(''); }
                }}
                className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">No options</div>
            ) : (
              options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value === value ? '' : o.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2 ${
                    o.value === value
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {o.count != null && (
                    <span className="text-[10px] text-slate-400 tabular-nums flex-shrink-0">{o.count}</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Multi-select dropdown ──────────────────────────────────────────────

interface FilterMultiDropdownProps {
  label: string;
  placeholder?: string;
  options: DropdownOption[];
  selected: Set<string>;
  onChange: (value: string, checked: boolean) => void;
  disabled?: boolean;
  emptyMessage?: string;
}

export function FilterMultiDropdown({
  label,
  placeholder = 'Select…',
  options,
  selected,
  onChange,
  disabled = false,
  emptyMessage = 'Select a category first',
}: FilterMultiDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabels = options
    .filter((o) => selected.has(o.value))
    .map((o) => o.label);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
        {label}
        {selected.size > 0 && (
          <span className="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-brand-500 text-white text-[9px] font-bold px-1">
            {selected.size}
          </span>
        )}
      </span>
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            disabled
              ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              : open
                ? 'border-brand-400 ring-2 ring-brand-500/20 bg-white'
                : 'border-slate-200 hover:border-brand-300 bg-white'
          }`}
        >
          <span className={`truncate ${selectedLabels.length > 0 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
            {selectedLabels.length === 0
              ? (disabled ? emptyMessage : placeholder)
              : selectedLabels.length <= 2
                ? selectedLabels.join(', ')
                : `${selectedLabels[0]}, +${selectedLabels.length - 1} more`}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${
            disabled ? 'text-slate-300' : 'text-slate-400'
          } ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && !disabled && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">No options available</div>
            ) : (
              options.map((o) => {
                const isChecked = selected.has(o.value);
                return (
                  <label
                    key={o.value}
                    className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors ${
                      isChecked ? 'bg-brand-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onChange(o.value, !isChecked)}
                      className="accent-brand-500 h-3.5 w-3.5 flex-shrink-0 rounded"
                    />
                    <span className={`flex-1 truncate ${isChecked ? 'text-brand-700 font-medium' : 'text-slate-700'}`}>
                      {o.label}
                    </span>
                    {o.count != null && (
                      <span className="text-[10px] text-slate-400 tabular-nums flex-shrink-0">{o.count}</span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
