import { api } from '@/lib/api';
import { HeaderShell } from './HeaderShell';

/**
 * Server component — fetches the languages the platform serves material in
 * (is_active = true && for_material = true) and hands them to the client-side
 * shell so the language switcher is server-rendered with no flash.
 *
 * Strict API-only: if the API returns nothing, the switcher is hidden.
 * No hardcoded fallbacks.
 */
export async function Header() {
  const live = await api.materialLanguages();
  const languages = live ?? [];
  return <HeaderShell languages={languages} />;
}
