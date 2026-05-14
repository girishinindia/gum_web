/**
 * Tiny helper to read/write the view-mode cookie that lets the user override
 * the mobile-vs-desktop auto-detection done in `middleware.ts`.
 */

export const VIEW_COOKIE = 'view';
export type ViewMode = 'desktop' | 'mobile';

/** Set the cookie + reload to apply the new view. Client-only. */
export function setViewMode(mode: ViewMode): void {
  if (typeof document === 'undefined') return;
  const days = 30;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${VIEW_COOKIE}=${mode}; expires=${expires}; path=/; SameSite=Lax`;
}
