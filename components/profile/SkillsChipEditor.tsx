'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Loader2, Trash2, AlertCircle, ChevronDown } from 'lucide-react';
import {
  addSkill, updateSkill, deleteSkill, searchMasterSkills,
  type MasterSkill, type UserSkill, type Proficiency,
} from '@/lib/users/client';
import { cn } from '@/lib/cn';

/**
 * Skills chip editor — autocomplete picker that selects from the
 * master `skills` table and renders each pick as a removable chip
 * with an inline proficiency badge.
 *
 * Why a dedicated component?
 *   • Free-text would let users type "Python", "python", "Pythn"… and
 *     end up with three near-duplicate rows. The master-list FK
 *     guarantees consistency.
 *   • Admin portal doesn't have a chip picker — this is genuinely new.
 *
 * UX
 *   • Type → 250 ms debounce → `GET /skills?search=…&limit=20`.
 *   • Popover lists matches with category badges. Already-added skills
 *     render with `disabled` styling and are skipped on Enter.
 *   • Click a row OR press Enter on the focused row to add the skill.
 *     POST `/user-skills/me { skill_id, proficiency_level: 'beginner' }`.
 *   • Click the chip's proficiency badge to open an inline select that
 *     PATCHes the row in place.
 *   • `Backspace` on an empty input removes the LAST chip (common
 *     combobox affordance).
 *   • `Escape` closes the popover.
 *   • Outside-click closes the popover.
 *
 * Props
 *   • `rows`        — current user-skill rows (from listSkills())
 *   • `onAdded`     — invoked with the just-created row so the parent
 *                     can append to local state without a refetch.
 *   • `onUpdated`   — same shape, post-PATCH.
 *   • `onRemoved`   — invoked with the deleted id.
 */
export function SkillsChipEditor({
  rows, onAdded, onUpdated, onRemoved,
}: {
  rows:      UserSkill[];
  onAdded:   (row: UserSkill) => void;
  onUpdated: (row: UserSkill) => void;
  onRemoved: (id: number) => void;
}) {
  const [query,   setQuery]   = useState('');
  const [open,    setOpen]    = useState(false);
  const [results, setResults] = useState<MasterSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy,    setBusy]    = useState<number | null>(null); // pending skill_id
  const [error,   setError]   = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Portal mount + position tracking (mirrors SearchableSelect — both
  // need to escape their parent Card's `overflow: hidden` clipping).
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
        const res = await searchMasterSkills(query, 20);
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
  // Because the popover is portaled to <body>, it is NOT inside rootRef.
  // We therefore check both rootRef (the trigger area) and popoverRef
  // before declaring the click "outside".
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideRoot    = rootRef.current?.contains(target);
      const insidePopover = popoverRef.current?.contains(target);
      if (!insideRoot && !insidePopover) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // ── Position the portaled popover under the trigger input ──────────
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setPos({
        top:   rect.bottom + window.scrollY + 6,
        left:  rect.left + window.scrollX,
        width: rect.width,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // Set of skill_ids the user already has — used to disable popover rows
  // and to skip them on Enter.
  const addedIds = useMemo(
    () => new Set(rows.map((r) => r.skill?.id ?? r.skill_id).filter(Boolean) as number[]),
    [rows],
  );

  const selectable = results.filter((r) => !addedIds.has(r.id));

  async function pick(masterId: number) {
    if (busy === masterId) return;
    setBusy(masterId);
    setError(null);
    try {
      const created = await addSkill({
        skill_id:           masterId,
        proficiency_level:  'beginner',
      });
      onAdded(created);
      setQuery('');
      // Keep the popover open so users can add several skills in a row
      // without re-clicking the input.
      inputRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add skill.');
    } finally {
      setBusy(null);
    }
  }

  async function changeProficiency(row: UserSkill, next: Proficiency) {
    if (!row.id) return;
    try {
      const updated = await updateSkill(row.id, { proficiency_level: next });
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update proficiency.');
    }
  }

  async function remove(row: UserSkill) {
    if (!row.id) return;
    try {
      await deleteSkill(row.id);
      onRemoved(row.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove skill.');
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
      // Empty input + Backspace → remove the LAST chip. Standard
      // combobox/token-input affordance.
      e.preventDefault();
      const last = rows[rows.length - 1];
      void remove(last);
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
            <SkillChip
              key={row.id ?? `pending-${row.skill_id}`}
              row={row}
              onProficiency={(next) => changeProficiency(row, next)}
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
          open
            ? 'border-brand-400 ring-2 ring-brand-100'
            : 'border-slate-200 hover:border-slate-300',
        )}
      >
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            // Only open the suggestion popover once the user actually
            // starts typing — empty focus shouldn't show a giant list.
            setOpen(next.trim().length > 0);
          }}
          onKeyDown={onInputKey}
          placeholder={rows.length === 0 ? 'Search skills (e.g. Python, React)…' : 'Add another skill…'}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          aria-expanded={open && query.trim().length > 0}
          aria-autocomplete="list"
          role="combobox"
        />
        {loading && <Loader2 className="h-4 w-4 text-brand-500 animate-spin" />}
      </div>

      {/* ── Popover — portaled so it escapes the Card's overflow clip ── */}
      {open && mounted && query.trim().length > 0 && createPortal(
        <div
          ref={popoverRef}
          role="listbox"
          style={{
            position: 'absolute',
            top:   pos.top,
            left:  pos.left,
            width: pos.width,
          }}
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
              {query.trim()
                ? `No skills match "${query.trim()}". Try a different term.`
                : 'Type to search the master skills list.'}
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
                i === activeIndex ? 'bg-brand-50 border-l-2 border-brand-500' : 'border-l-2 border-transparent',
                'disabled:opacity-50',
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  categoryDot(m.category),
                )}
              />
              <span className="flex-1 font-medium text-slate-800 truncate">{m.name}</span>
              {m.category && (
                <span className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                  categoryPill(m.category),
                )}>
                  {m.category.replace('_', ' ')}
                </span>
              )}
              {busy === m.id && <Loader2 className="h-3.5 w-3.5 text-brand-500 animate-spin shrink-0" />}
            </button>
          ))}
          {/* Already-added rows — disabled, shown for transparency. */}
          {results.filter((r) => addedIds.has(r.id)).map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-50 text-slate-400 border-l-2 border-transparent"
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
              <span className="flex-1 truncate line-through">{m.name}</span>
              <span className="shrink-0 rounded-full bg-white border border-slate-200 text-slate-500 px-2 py-0.5 text-[10px] font-semibold">
                already added
              </span>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Chip (with inline-edit proficiency)
// ─────────────────────────────────────────────────────────────────────

const PROFICIENCIES: Proficiency[] = ['beginner', 'elementary', 'intermediate', 'advanced', 'expert'];

function SkillChip({
  row, onProficiency, onRemove,
}: {
  row: UserSkill;
  onProficiency: (next: Proficiency) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    function onDocClick(e: MouseEvent) {
      if (editRef.current && !editRef.current.contains(e.target as Node)) setEditing(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [editing]);

  const name = row.skill?.name ?? `skill #${row.skill_id}`;
  const prof = row.proficiency_level ?? 'beginner';

  return (
    <span
      ref={editRef}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 pl-3 pr-1 py-1 text-[12.5px] font-semibold text-brand-700 relative"
    >
      {name}
      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        className="inline-flex items-center gap-0.5 rounded-full bg-white border border-brand-200 text-brand-700 px-2 py-0.5 text-[9.5px] font-bold hover:bg-brand-100/50"
        aria-label="Change proficiency"
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
      {editing && (
        <div className="absolute top-[calc(100%+4px)] left-0 bg-white border border-slate-200 rounded-md shadow-cardHover py-1 z-20 min-w-[140px]">
          {PROFICIENCIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { onProficiency(p); setEditing(false); }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-[12px] font-semibold capitalize hover:bg-brand-50',
                p === prof ? 'text-brand-700 bg-brand-50/60' : 'text-slate-700',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Category visual helpers — keep the popover scannable
// ─────────────────────────────────────────────────────────────────────

function categoryDot(c?: string | null): string {
  switch (c) {
    case 'language':      return 'bg-emerald-500';
    case 'framework':     return 'bg-sky-500';
    case 'tool':          return 'bg-amber-500';
    case 'technical':     return 'bg-violet-500';
    case 'domain':        return 'bg-rose-500';
    case 'certification': return 'bg-indigo-500';
    case 'soft_skill':    return 'bg-teal-500';
    default:              return 'bg-slate-400';
  }
}

function categoryPill(c?: string | null): string {
  switch (c) {
    case 'language':      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'framework':     return 'bg-sky-50 text-sky-700 border border-sky-200';
    case 'tool':          return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'technical':     return 'bg-violet-50 text-violet-700 border border-violet-200';
    case 'domain':        return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'certification': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    case 'soft_skill':    return 'bg-teal-50 text-teal-700 border border-teal-200';
    default:              return 'bg-slate-50 text-slate-600 border border-slate-200';
  }
}
