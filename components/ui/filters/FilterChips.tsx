'use client';

import { X } from 'lucide-react';

export interface FilterChip {
  key: string;
  label: string;
}

interface Props {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function FilterChips({ chips, onRemove, onClearAll }: Props) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400">Active filters:</span>
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-100"
        >
          {c.label}
          <button onClick={() => onRemove(c.key)} className="hover:text-brand-900 transition-colors" aria-label={`Remove ${c.label} filter`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button onClick={onClearAll} className="text-xs text-brand-600 hover:text-brand-800 underline transition-colors">
        Clear all
      </button>
    </div>
  );
}
