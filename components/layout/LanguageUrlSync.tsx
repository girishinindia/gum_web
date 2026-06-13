'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from './LanguageProvider';

/**
 * BUG-18 / BUG-55: on language-aware pages (legal/[code], faq) the CONTENT is
 * fetched server-side from `?language_id=`, but the navbar's LanguageProvider
 * defaults to English — so the switcher showed the wrong language for a page
 * that was actually rendered (say) in Hindi.
 *
 * This invisible sync maps the URL's numeric `language_id` → the matching
 * language's iso (via the loaded languages list, which already carries
 * `id`) and pushes it into the provider, so the selector reflects the
 * language the page is really displaying. No-op when the param is absent or
 * doesn't match a known language.
 */
export function LanguageUrlSync() {
  const { languages, active, setActive } = useLanguage();
  const searchParams = useSearchParams();
  const langId = parseInt(searchParams?.get('language_id') ?? '', 10);

  useEffect(() => {
    if (!Number.isFinite(langId) || langId <= 0) return;
    const match = languages.find((l) => l.id === langId);
    if (match && match.iso_code !== active?.iso_code) setActive(match.iso_code);
  }, [langId, languages, active, setActive]);

  return null;
}
