'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PromptOptions {
  /** Modal heading, e.g. "Add module". */
  title: string;
  /** Optional helper line under the heading. */
  description?: string;
  /** Field label above the input. Defaults to "Title". */
  label?: string;
  placeholder?: string;
  /** Pre-filled value (used for rename / edit). */
  initial?: string;
  /** Confirm button text. Defaults to "Save". */
  confirmText?: string;
  /** Max characters (also enforced on the input). Defaults to 200. */
  maxLength?: number;
  /** When false, an empty value is allowed (e.g. "blank to clear"). Defaults to true. */
  required?: boolean;
  /** Extra validation — return an error message, or null when valid. */
  validate?: (value: string) => string | null;
}

interface InternalState extends PromptOptions {
  resolve: (value: string | null) => void;
}

/**
 * usePromptModal — an in-app, validated replacement for window.prompt().
 *
 *   const { ask, modal } = usePromptModal();
 *   const title = await ask({ title: 'Add module', label: 'Module title' });
 *   if (title === null) return;            // user cancelled
 *
 * Render `{modal}` once inside the component. `ask` resolves with the trimmed
 * string on confirm, or null on cancel / backdrop / Esc. Validates required,
 * maxLength, and an optional custom `validate` callback before resolving.
 */
export function usePromptModal() {
  const [state, setState] = useState<InternalState | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = useCallback(
    (opts: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setValue(opts.initial ?? '');
        setError(null);
        setState({ ...opts, resolve });
      }),
    [],
  );

  // Focus the input when the modal opens.
  useEffect(() => {
    if (!state) return undefined;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [state]);

  function finish(result: string | null) {
    state?.resolve(result);
    setState(null);
    setError(null);
  }

  function submit() {
    if (!state) return;
    const v = value.trim();
    const max = state.maxLength ?? 200;
    if (state.required !== false && !v) { setError('Please enter a value.'); return; }
    if (v.length > max) { setError(`Keep it under ${max} characters.`); return; }
    if (state.validate) { const er = state.validate(v); if (er) { setError(er); return; } }
    finish(v);
  }

  const max = state?.maxLength ?? 200;
  const modal = state ? (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={state.title}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => finish(null)} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl">
        <h3 className="text-base font-bold text-slate-900">{state.title}</h3>
        {state.description ? <p className="mt-1 text-sm text-slate-500">{state.description}</p> : null}
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">{state.label ?? 'Title'}</label>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); submit(); }
            else if (e.key === 'Escape') { e.preventDefault(); finish(null); }
          }}
          placeholder={state.placeholder}
          maxLength={max}
          aria-invalid={!!error}
          className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors ${error ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 focus:border-emerald-400'}`}
        />
        <div className="mt-1.5 flex items-center justify-between gap-3">
          {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : <span />}
          <span className="shrink-0 text-[11px] text-slate-400">{value.trim().length}/{max}</span>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => finish(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={submit} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{state.confirmText ?? 'Save'}</button>
        </div>
      </div>
    </div>
  ) : null;

  return { ask, modal };
}
