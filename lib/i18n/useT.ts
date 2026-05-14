'use client';

import { useLanguage } from '@/components/layout/LanguageProvider';
import { MESSAGES, type Messages, type SupportedLocale } from './messages';

/**
 * Returns the translation dictionary for the active language with English as
 * the safety net.
 *
 * The merged dictionary is shaped exactly like `MESSAGES.en`, so consumers
 * can do `t.nav.about`, `t.common.login` etc. with full TypeScript safety —
 * missing keys at the leaf level fall back to the English string.
 */
export function useT(): Messages {
  const { active } = useLanguage();
  const iso = (active?.iso_code || 'en') as SupportedLocale;
  const localized = MESSAGES[iso];
  if (!localized || iso === 'en') return MESSAGES.en;

  // Deep merge a partial localized dictionary onto the English one so missing
  // keys fall back to English without requiring 100% coverage per language.
  return mergeDeep(MESSAGES.en, localized) as Messages;
}

function mergeDeep<T extends Record<string, any>>(base: T, override: Partial<T>): T {
  const out: Record<string, any> = { ...base };
  for (const k of Object.keys(override) as (keyof T)[]) {
    const baseVal = (base as any)[k];
    const overrideVal = (override as any)[k];
    if (
      baseVal && typeof baseVal === 'object' && !Array.isArray(baseVal) &&
      overrideVal && typeof overrideVal === 'object' && !Array.isArray(overrideVal)
    ) {
      out[k as string] = mergeDeep(baseVal, overrideVal);
    } else if (overrideVal !== undefined) {
      out[k as string] = overrideVal;
    }
  }
  return out as T;
}
