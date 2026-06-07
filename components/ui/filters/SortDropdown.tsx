'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SortOption {
  label: string;
  sort: string;
  order: 'asc' | 'desc';
}

interface Props {
  options: SortOption[];
  value: string;        // current sort field
  order: 'asc' | 'desc';
  onChange: (sort: string, order: 'asc' | 'desc') => void;
}

export function SortDropdown({ options, value, order, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.sort === value && o.order === order) || options[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:border-brand-300 text-sm font-medium text-slate-700 shadow-card transition-colors"
      >
        Sort: {current.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
          {options.map((o) => (
            <button
              key={`${o.sort}-${o.order}`}
              onClick={() => { onChange(o.sort, o.order); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-brand-50 transition-colors ${
                o.sort === value && o.order === order ? 'text-brand-700 font-semibold bg-brand-50/50' : 'text-slate-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
