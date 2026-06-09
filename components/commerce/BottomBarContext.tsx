'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Tracks how many *page-owned* bottom bars are currently mounted (e.g. the
 * mobile detail-page action bar). The global cart strip reads this and yields
 * (hides itself) whenever a page already owns the bottom of the screen, so the
 * two never stack. Robust by construction — no route-path matching.
 */
interface Ctx { count: number; register: () => void; unregister: () => void }
const BottomBarContext = createContext<Ctx>({ count: 0, register: () => {}, unregister: () => {} });

export function BottomBarProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const register = useCallback(() => setCount((c) => c + 1), []);
  const unregister = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);
  return <BottomBarContext.Provider value={{ count, register, unregister }}>{children}</BottomBarContext.Provider>;
}

/** Register a page-owned bottom bar for the lifetime of the calling component. */
export function useRegisterPageBottomBar() {
  const { register, unregister } = useContext(BottomBarContext);
  useEffect(() => { register(); return unregister; }, [register, unregister]);
}

export function usePageBottomBarCount() {
  return useContext(BottomBarContext).count;
}

/** Drop-in registrar — renders nothing, just claims the bottom bar while mounted.
 *  Lets a non-client parent (e.g. MobileDetailBar) opt in without becoming a
 *  client component itself. */
export function PageBottomBarRegistrar() {
  useRegisterPageBottomBar();
  return null;
}
