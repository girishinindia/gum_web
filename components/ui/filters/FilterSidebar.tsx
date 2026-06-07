'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
  iconColor?: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  /** Max options shown before "+N more" link (default 5) */
  maxVisible?: number;
  /** Render mode: checkboxes (default, multi-select) or radio (single-select) */
  type?: 'checkbox' | 'radio';
}

interface Props {
  groups: FilterGroup[];
  /** Map of group key → set of selected option values */
  selected: Record<string, Set<string>>;
  onChange: (groupKey: string, value: string, checked: boolean) => void;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────

export function FilterSidebar({ groups, selected, onChange, className = '' }: Props) {
  return (
    <div className={`space-y-4 ${className}`}>
      {groups.map((g) => (
        <FilterGroupCard
          key={g.key}
          group={g}
          selected={selected[g.key] ?? new Set()}
          onChange={(val, checked) => onChange(g.key, val, checked)}
        />
      ))}
    </div>
  );
}

// ─── Single filter group card ───────────────────────────────────────────

function FilterGroupCard({
  group,
  selected,
  onChange,
}: {
  group: FilterGroup;
  selected: Set<string>;
  onChange: (value: string, checked: boolean) => void;
}) {
  const maxVisible = group.maxVisible ?? 5;
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const visibleOpts = expanded ? group.options : group.options.slice(0, maxVisible);
  const hasMore = group.options.length > maxVisible;

  return (
    <div className="rounded-lg bg-white border border-slate-200 shadow-card overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{group.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-1.5">
          {visibleOpts.map((o) => {
            const Icon = o.icon;
            const isRadio = group.type === 'radio';
            const isChecked = selected.has(o.value);
            return (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-brand-700 group/opt">
                <input
                  type={isRadio ? 'radio' : 'checkbox'}
                  name={isRadio ? group.key : undefined}
                  checked={isChecked}
                  onChange={() => {
                    if (isRadio) {
                      // Radio toggle: clicking the already-selected option deselects it
                      onChange(o.value, !isChecked);
                    } else {
                      onChange(o.value, !isChecked);
                    }
                  }}
                  className={`accent-brand-500 h-3.5 w-3.5 flex-shrink-0 ${isRadio ? '' : 'rounded'}`}
                />
                {Icon && <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${o.iconColor || 'text-slate-400'}`} />}
                <span className={`flex-1 truncate ${isChecked ? 'text-brand-700 font-medium' : ''}`}>
                  {o.label}
                </span>
                {o.count != null && (
                  <span className="text-[10px] text-slate-400 ml-auto tabular-nums">{o.count}</span>
                )}
              </label>
            );
          })}
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium mt-1 transition-colors"
            >
              {expanded ? 'Show less' : `+${group.options.length - maxVisible} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mobile drawer wrapper ──────────────────────────────────────────────

export function FilterDrawer({
  open,
  onClose,
  children,
  activeCount,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  activeCount: number;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl shadow-2xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            Filters {activeCount > 0 && <span className="text-brand-600">({activeCount})</span>}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors" aria-label="Close filters">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
