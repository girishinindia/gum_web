'use client';

import { useState } from 'react';
import { MobileTopBar } from './MobileTopBar';
import { MobileBottomTabs } from './MobileBottomTabs';
import { MobileDrawer } from './MobileDrawer';
import { MobileLanguagePopup } from './MobileLanguagePopup';

/**
 * Composes the persistent mobile chrome around every page rendered under
 *   app/m/...
 *
 *    fixed top bar         (portaled to <body>, position: fixed)
 *    drawer                (off-canvas, opened from top bar)
 *    language popup        (bottom sheet, opened from top bar or drawer)
 *    page content
 *    fixed bottom tab bar  (portaled to <body>, position: fixed)
 *
 * Owns the open/close state for the drawer and language popup so both
 * the top bar (the "EN" pill) and the drawer (the Language row) can
 * trigger the popup from a single source of truth.
 */
export function MobileShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);

  function openLang() {
    setDrawerOpen(false); // make sure the drawer doesn't sit behind the sheet
    setLangOpen(true);
  }

  return (
    <div
      data-portal="mobile"
      className="min-h-screen flex flex-col bg-gradient-to-b from-white via-brand-50/40 to-indigo-50/30 max-w-full overflow-x-clip"
    >
      <MobileTopBar
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenLanguage={openLang}
      />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenLanguage={openLang}
      />
      <MobileLanguagePopup open={langOpen} onClose={() => setLangOpen(false)} />

      {/* Page content
          • `pt-[58px]` clears the floating top bar (10 px gap + 48 px bar
            height) — the bar is `position: fixed` so it's out of flow and
            content would otherwise slide under it.
          • `pb-24` clears the floating bottom-tabs bar.
          • `overflow-x-clip` kills any stray horizontal scroll a child
            might introduce. */}
      <main className="flex-1 pt-[58px] pb-24 w-full max-w-full overflow-x-clip">{children}</main>

      {/* Rendered via React Portal to <body> so no ancestor `transform` /
          `filter` can hijack its viewport-fixed position. */}
      <MobileBottomTabs />
    </div>
  );
}
