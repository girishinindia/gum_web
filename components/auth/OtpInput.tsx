'use client';

import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  length?:   number;                          // default 6
  value:     string;
  onChange:  (next: string) => void;
  disabled?: boolean;
  verified?: boolean;                         // green-state visual when already verified
  autoFocus?: boolean;
  ariaLabel?: string;
}

/**
 * 6-digit OTP grid. Each cell is a single-character input — auto-advances
 * on typing, retreats on backspace, accepts a full 6-digit paste anywhere
 * in the strip, and surfaces the joined string back to the parent.
 *
 * Visual states:
 *   • idle      → grey border
 *   • focus     → brand outline
 *   • filled    → slate text
 *   • verified  → green border + bg (when `verified` prop is true; used
 *                 after that channel's OTP has already been accepted)
 *   • disabled  → 40% opacity
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  verified,
  autoFocus,
  ariaLabel = 'One-time password',
}: Props) {
  // Cell values are derived from `value` so the parent owns the source
  // of truth. Local state is only the per-cell DOM-input refs.
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [active, setActive] = useState<number>(0);

  // Mirror the upstream `value` to refs (so a parent reset clears cells).
  const cells = padCells(value, length);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) inputsRef.current[0].focus();
  }, [autoFocus]);

  function setCellChar(idx: number, ch: string) {
    const clean = ch.replace(/\D/g, '').slice(0, 1);
    const arr = cells.slice();
    arr[idx] = clean;
    onChange(arr.join(''));
  }

  function focusCell(idx: number) {
    const el = inputsRef.current[idx];
    if (el) { el.focus(); el.select(); }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>, idx: number) {
    const ch = e.target.value;
    if (ch.length > 1) {
      // User typed/pasted multiple chars into one cell → distribute.
      const digits = ch.replace(/\D/g, '').slice(0, length - idx);
      const arr = cells.slice();
      for (let i = 0; i < digits.length; i++) arr[idx + i] = digits[i];
      onChange(arr.join(''));
      const focus = Math.min(idx + digits.length, length - 1);
      focusCell(focus);
      return;
    }
    setCellChar(idx, ch);
    if (ch && idx < length - 1) focusCell(idx + 1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === 'Backspace') {
      if (cells[idx]) {
        setCellChar(idx, '');
      } else if (idx > 0) {
        focusCell(idx - 1);
        setCellChar(idx - 1, '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      focusCell(idx - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      focusCell(idx + 1);
      e.preventDefault();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>, idx: number) {
    const text = e.clipboardData.getData('text');
    const digits = text.replace(/\D/g, '').slice(0, length - idx);
    if (!digits) return;
    const arr = cells.slice();
    for (let i = 0; i < digits.length; i++) arr[idx + i] = digits[i];
    onChange(arr.join(''));
    focusCell(Math.min(idx + digits.length, length - 1));
    e.preventDefault();
  }

  return (
    <div className="flex gap-1.5 sm:gap-2" role="group" aria-label={ariaLabel}>
      {cells.map((ch, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={ch}
          disabled={disabled || verified}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={(e) => handlePaste(e, i)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(-1)}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            'h-11 w-9 sm:h-12 sm:w-10 text-center text-lg font-bold rounded-md outline-none transition-all',
            verified
              ? 'border-2 border-emerald-300 bg-emerald-50 text-emerald-700'
              : disabled
                ? 'border border-slate-200 bg-slate-50 text-slate-400'
                : active === i
                  ? 'border-2 border-brand-500 bg-brand-50/40 text-slate-900 ring-2 ring-brand-200'
                  : ch
                    ? 'border border-slate-300 bg-white text-slate-900'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300',
          )}
        />
      ))}
    </div>
  );
}

function padCells(value: string, length: number): string[] {
  const digits = (value || '').replace(/\D/g, '').slice(0, length).split('');
  while (digits.length < length) digits.push('');
  return digits;
}
