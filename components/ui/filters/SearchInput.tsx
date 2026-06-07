'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', debounceMs = 300 }: Props) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Sync external → local when value changes (e.g. "Clear all" resets)
  useEffect(() => { setLocal(value); }, [value]);

  function handleChange(v: string) {
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), debounceMs);
  }

  function handleClear() {
    setLocal('');
    clearTimeout(timer.current);
    onChange('');
  }

  return (
    <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2.5 shadow-card focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
      <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
      />
      {local && (
        <button onClick={handleClear} className="p-0.5 rounded-full hover:bg-slate-100 transition-colors" aria-label="Clear search">
          <X className="h-3.5 w-3.5 text-slate-400" />
        </button>
      )}
    </div>
  );
}
