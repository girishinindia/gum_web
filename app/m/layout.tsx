import { MobileShell }       from '@/components/mobile/MobileShell';
import { LanguageProvider }  from '@/components/layout/LanguageProvider';
import { api }               from '@/lib/api';

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
