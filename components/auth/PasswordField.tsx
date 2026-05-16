'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Optional left-side icon override (defaults to a lock). */
  hideIcon?: boolean;
  /** Whether to show a basic strength meter under the field. */
  withStrength?: boolean;
  /** When the parent labels the field externally; we still pass through aria-label. */
  label?: string;
}

/**
 * Password input with an eye-toggle to reveal/hide and an optional
 * 0-4 strength meter. Strength scoring is intentionally lightweight
 * (length + char classes) — for serious password policy we'd defer
 * to zxcvbn, but that's overkill for this UI hint.
 */
export function PasswordField({
  hideIcon = false,
  withStrength = false,
  label,
  className,
  value,
  onChange,
  ...rest
}: Props) {
  const [reveal, setReveal] = useState(false);
  const strength = withStrength ? scorePassword(typeof value === 'string' ? value : '') : null;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-white',
          'focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400',
          className,
        )}
      >
        {!hideIcon && <Lock className="h-4 w-4 text-slate-400" />}
        <input
          {...rest}
          value={value}
          onChange={onChange}
          type={reveal ? 'text' : 'password'}
          aria-label={label}
          className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => setReveal((v) => !v)}
          aria-label={reveal ? 'Hide password' : 'Show password'}
          className="text-slate-400 hover:text-brand-700 transition-colors"
        >
          {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {strength !== null && (
        <div className="mt-1.5">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i < strength.score
                    ? strength.score < 2
                      ? 'bg-rose-400'
                      : strength.score < 3
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    : 'bg-slate-200',
                )}
              />
            ))}
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">{strength.label}</div>
        </div>
      )}
    </div>
  );
}

function scorePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: 'Use at least 8 characters' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const;
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] };
}
