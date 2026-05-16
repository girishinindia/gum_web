'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, X, ChevronDown, AlertCircle, Loader2, Star } from 'lucide-react';
import {
  addLanguage, updateLanguage, deleteLanguage, searchMasterLanguages,
  type UserLanguage, type MasterLanguage, type LanguageProficiency,
} from '@/lib/users/client';
import { cn } from '@/lib/cn';

/**
 * Languages chip editor — same shape as `SkillsChipEditor`. Master-FK
 * autocomplete drives the picker (no more free-text typos); each chip
 * carries an inline detail popover with proficiency + can_read/write/speak
 * + is_native + is_primary toggles. Each toggle PATCHes the row in place.
 *
 * Why master-FK now?
 *   • Server schema requires `language_id` (not `language_name`). The
 *     `/languages` master table already has ISO-codes + native names.
 *   • Skills uses an identical pattern, so reusing it keeps the profile
 *     UX consistent.
 *
 * Both popovers (search + per-chip detail) render via React portal so
 * they escape the Card's `overflow: hidden` clip — same fix as Skills.
 */
const PROFICIENCIES: LanguageProficiency[] = ['basic', 'conversational', 'professional', 'fluent', 'native'];

export function LanguagesEditor({
  rows, onAdded, onUpdated, onRemoved,
}: {
  rows:       UserLanguage[];
  onAdded:    (row: UserLanguage) => void;
  onUpdated:  (row: UserLanguage) => void;
  onRemoved:  (id: number) => void;
}) {
  const [query,   setQuery]   = useState('');
  const [open,    setOpen]    = useState(false);
  const [results, setResults] = useState<MasterLanguage[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy,    setBusy]    = useState<number | null>(null); // master language_id mid-flight
  const [error,   setError]   = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Portal positioning for the search popover
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  useEffect(() => setMounted(true), []);

  const rootRef    = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // ── Debounced server search ────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchMasterLanguages(query, 20);
        if (!cancelled) {
          setResults(Array.isArray(res) ? res : []);
          setActiveIndex(0);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query.trim() ? 250 : 0);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [query, open]);

  // ── Outside-click + Escape close ───────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideRoot    = rootRef.current?.contains(target);
      const insidePopover = popoverRef.current?.contains(target);
      if (!insideRoot && !insidePopover) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // ── Position the portaled popover ──────────────────────────────────
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX, width: rect.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // language_ids the user already has — used to disable popover rows
  const addedIds = useMemo(
    () => new Set(rows.map((r) => r.language?.id ?? r.language_id).filter(Boolean) as number[]),
    [rows],
  );
  const selectable = results.filter((r) => !addedIds.has(r.id));

  async function pick(masterId: number) {
    if (busy === masterId) return;
    setBusy(masterId);
    setError(null);
    try {
      const created = await addLanguage({
        language_id:        masterId,
        proficiency_level:  'conversational',
        can_read:           true,
        can_write:          true,
        can_speak:          true,
      });
      onAdded(created);
      setQuery('');
      inputRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add language.');
    } finally {
      setBusy(null);
    }
  }

  async function patch(row: UserLanguage, fields: Partial<UserLanguage>) {
    if (!row.id) return;
    try {
      const updated = await updateLanguage(row.id, fields);
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update.');
    }
  }

  async function remove(row: UserLanguage) {
    if (!row.id) return;
    try {
      await deleteLanguage(row.id);
      onRemoved(row.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove.');
    }
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, selectable.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const choice = selectable[activeIndex];
      if (choice) void pick(choice.id);
    } else if (e.key === 'Backspace' && query.length === 0 && rows.length > 0) {
      e.preventDefault();
      void remove(rows[rows.length - 1]);
    }
  }

  return (
    <div ref={rootRef}>
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* ── Chip row ──────────────────────────────────────────────── */}
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {rows.map((row) => (
            <LangChip
              key={row.id ?? `pending-${row.language_id}`}
              row={row}
              onPatch={(fields) => patch(row, fields)}
              onRemove={() => remove(row)}
            />
          ))}
        </div>
      )}

      {/* ── Combobox trigger ─────────────────────────────────────── */}
      <div
        ref={triggerRef}
        className={cn(
          'flex items-center gap-2 rounded-md border bg-white px-3 py-2 transition-all',
          open ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200 hover:border-slate-300',
        )}
      >
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(e.target.value.trim().length > 0); }}
          onKeyDown={onInputKey}
          placeholder={rows.length === 0 ? 'Search languages (e.g. Hindi, Tamil, French)…' : 'Add another language…'}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          aria-expanded={open && query.trim().length > 0}
          aria-autocomplete="list"
          role="combobox"
        />
        {loading && <Loader2 className="h-4 w-4 text-brand-500 animate-spin" />}
      </div>

      {/* ── Popover (portal) ─────────────────────────────────────── */}
      {open && mounted && query.trim().length > 0 && createPortal(
        <div
          ref={popoverRef}
          role="listbox"
          style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width }}
          className="z-[1000] bg-white border border-slate-200 rounded-md shadow-cardHover overflow-hidden max-h-[320px] overflow-y-auto"
        >
          <div className="sticky top-0 px-3 py-2 border-b border-slate-100 bg-white/95 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
            <span>{selectable.length} match{selectable.length === 1 ? '' : 'es'}</span>
            <span className="text-slate-300 font-normal normal-case tracking-normal hidden sm:inline">
              ↓↑ to navigate · Enter to add · ⌫ to remove last
            </span>
          </div>
          {selectable.length === 0 && !loading && (
            <div className="px-3 py-4 text-sm text-slate-500">
              No languages match &quot;{query.trim()}&quot;. Try a different term.
            </div>
          )}
          {selectable.map((m, i) => (
            <button
              key={m.id}
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => void pick(m.id)}
              onMouseEnter={() => setActiveIndex(i)}
              disabled={busy === m.id}
              className={cn(
                'w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                i === activeIndex ? 'bg-emerald-50 border-l-2 border-emerald-500' : 'border-l-2 border-transparent',
                'disabled:opacity-50',
              )}
            >
              <span className="flex-1 font-medium text-slate-800 truncate">{m.name}</span>
              {m.native_name && m.native_name !== m.name && (
                <span className="shrink-0 text-[11.5px] text-slate-500 truncate">{m.native_name}</span>
              )}
              {m.iso_code && (
                <span className="shrink-0 rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold uppercase">{m.iso_code}</span>
              )}
              {busy === m.id && <Loader2 className="h-3.5 w-3.5 text-emerald-500 animate-spin shrink-0" />}
            </button>
          ))}
          {results.filter((r) => addedIds.has(r.id)).map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-50 text-slate-400 border-l-2 border-transparent"
            >
              <span className="flex-1 truncate line-through">{m.name}</span>
              <span className="shrink-0 rounded-full bg-white border border-slate-200 text-slate-500 px-2 py-0.5 text-[10px] font-semibold">already added</span>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Chip with inline detail popover (proficiency + can_* booleans + native)
// ─────────────────────────────────────────────────────────────────────

function LangChip({
  row, onPatch, onRemove,
}: {
  row: UserLanguage;
  onPatch: (fields: Partial<UserLanguage>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => setMounted(true), []);

  const triggerRef = useRef<HTMLSpanElement>(null);
  const popRef     = useRef<HTMLDivElement>(null);

  // Outside-click + Esc close
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Position the portal popover under the chip
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const name = row.language?.name ?? `lang #${row.language_id}`;
  const prof = (row.proficiency_level ?? 'conversational') as LanguageProficiency;

  return (
    <>
      <span
        ref={triggerRef}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full pl-3 pr-1 py-1 text-[12.5px] font-semibold relative',
          row.is_native
            ? 'bg-amber-50 border border-amber-200 text-amber-800'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-700',
        )}
      >
        {row.is_native && <Star className="h-3 w-3 fill-amber-400 stroke-amber-500" />}
        {name}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-[9.5px] font-bold',
            row.is_native
              ? 'border border-amber-200 text-amber-800 hover:bg-amber-50'
              : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50',
          )}
          aria-label="Edit language details"
        >
          {prof}
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-rose-500 hover:bg-rose-50"
          aria-label={`Remove ${name}`}
        >
          <X className="h-3 w-3" />
        </button>
      </span>

      {open && mounted && createPortal(
        <div
          ref={popRef}
          style={{ position: 'absolute', top: pos.top, left: pos.left, minWidth: 240 }}
          className="z-[1000] bg-white border border-slate-200 rounded-md shadow-cardHover py-2"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Proficiency</div>
          {PROFICIENCIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { onPatch({ proficiency_level: p }); setOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-[12px] font-semibold capitalize hover:bg-emerald-50',
                p === prof ? 'text-emerald-700 bg-emerald-50/60' : 'text-slate-700',
              )}
            >
              {p}
            </button>
          ))}

          <div className="px-3 py-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100">Skills</div>
          <Toggle label="Can read"  value={!!row.can_read}  onChange={(v) => onPatch({ can_read: v })}  />
          <Toggle label="Can write" value={!!row.can_write} onChange={(v) => onPatch({ can_write: v })} />
          <Toggle label="Can speak" value={!!row.can_speak} onChange={(v) => onPatch({ can_speak: v })} />

          <div className="px-3 py-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100">Flags</div>
          <Toggle label="Native language" value={!!row.is_native} onChange={(v) => onPatch({ is_native: v })} />
          <Toggle label="Primary" value={!!row.is_primary} onChange={(v) => onPatch({ is_primary: v })} />
        </div>,
        document.body,
      )}
    </>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="flex items-center justify-between px-3 py-1.5 text-[12px] text-slate-700 hover:bg-slate-50 cursor-pointer">
      <span>{label}</span>
      <span className={cn(
        'inline-flex h-4 w-7 rounded-full p-0.5 transition-colors',
        value ? 'bg-emerald-500' : 'bg-slate-300',
      )}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span className={cn(
          'h-3 w-3 rounded-full bg-white transition-transform',
          value ? 'translate-x-3' : 'translate-x-0',
        )} />
      </span>
    </label>
  );
}
