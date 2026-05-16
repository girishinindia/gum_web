'use client';

import { GraduationCap, BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SignupRole = 'student' | 'instructor';

interface Props {
  value:    SignupRole;
  onChange: (next: SignupRole) => void;
  compact?: boolean;   // smaller variant for the mobile signup screen
}

/**
 * Two-tile role picker shown at the top of the signup form.
 *
 * UX note: this is currently a UI-only hint — the gum_api `/auth/register`
 * Zod schema doesn't accept a `role` field, so every signup lands as
 * `users.type = 'student'` regardless of which tile the user picks. The
 * picker is here so the experience makes sense and so a server-side role
 * differentiation later (when added) only needs the API change — no UI
 * rework.
 */
export function RolePicker({ value, onChange, compact = false }: Props) {
  const tiles: Array<{ key: SignupRole; title: string; sub: string; Icon: typeof GraduationCap }> = [
    { key: 'student',    title: 'Student',    sub: 'Learn from experts',  Icon: GraduationCap },
    { key: 'instructor', title: 'Instructor', sub: 'Teach & earn',   Icon: BookOpenCheck },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Sign up as"
      className={cn('grid grid-cols-2', compact ? 'gap-2' : 'gap-3')}
    >
      {tiles.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t.key)}
            className={cn(
              'group relative rounded-md border bg-white text-left transition-all',
              compact ? 'p-2.5' : 'p-3.5',
              active
                ? 'border-2 border-brand-500 ring-4 ring-brand-100 bg-gradient-to-br from-brand-50/70 to-white shadow-sm'
                : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50',
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'inline-flex items-center justify-center rounded-md shrink-0 transition-colors',
                  compact ? 'h-9 w-9' : 'h-10 w-10',
                  active
                    ? 'bg-gradient-to-br from-brand-500 to-accent text-white shadow-btn'
                    : 'bg-brand-50 text-brand-700 group-hover:bg-brand-100',
                )}
              >
                <t.Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn('font-bold leading-tight', compact ? 'text-[12.5px]' : 'text-sm', active ? 'text-brand-700' : 'text-slate-900')}>
                  {t.title}
                </div>
                <div className={cn('text-slate-500 mt-0.5', compact ? 'text-[10.5px]' : 'text-[11.5px]')}>
                  {t.sub}
                </div>
              </div>
              <span
                aria-hidden
                className={cn(
                  'shrink-0 rounded-full border-2 transition-all',
                  compact ? 'h-3.5 w-3.5' : 'h-4 w-4',
                  active
                    ? 'border-brand-500 bg-brand-500 ring-2 ring-brand-100'
                    : 'border-slate-300 bg-white',
                )}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
