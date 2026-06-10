import type { Metadata } from 'next';
import { MobileShell }       from '@/components/mobile/MobileShell';
import { LanguageProvider }  from '@/components/layout/LanguageProvider';
import { api }               from '@/lib/api';

// The /m tree mirrors the desktop content; mark it noindex so the canonical
// desktop URLs are the ones search engines index (avoids duplicate content).
export const metadata: Metadata = { robots: { index: false, follow: true } };

/**
 * Layout for the entire mobile portal (everything under /m/*).
 *
 *  • Same <LanguageProvider> as the desktop layout so i18n + mega-menu logic
 *    keeps working.
 *  • <MobileShell> wraps every page with top bar + drawer + bottom tabs.
 */
export default async function MobileLayoutRoot({ children }: { children: React.ReactNode }) {
  const languages = (await api.materialLanguages()) ?? [];
  return (
    <LanguageProvider languages={languages}>
      <MobileShell>{children}</MobileShell>
    </LanguageProvider>
  );
}
