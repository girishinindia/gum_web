'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as authApi from '@/lib/auth/client';
import { getMe, meToAuthUser } from '@/lib/users/client';
import {
  clearSession, getRefreshToken, getStoredUser, hasSession,
  persistSession, setStoredUser, type AuthUser,
} from '@/lib/auth/session';

interface AuthContextValue {
  user:        AuthUser | null;
  loading:     boolean;                                                // initial hydration flag
  signedIn:    boolean;                                                // convenience
  setSession:  (user: AuthUser, tokens: { access_token: string; refresh_token: string }) => void;
  updateUser:  (patch: Partial<AuthUser>) => void;
  login:       (identifier: string, password: string) => Promise<AuthUser>;
  logout:      () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Global auth context. Mount once near the root (app/layout.tsx) so both
 * the desktop chrome (Header login pill) and the mobile chrome (top bar
 * + profile page) can share a single source of truth.
 *
 * Hydration model:
 *   • On mount we read tokens + user blob from localStorage synchronously
 *     (well — useEffect, so technically after the first paint, but we
 *     guard with `loading=true` until then).
 *   • If a refresh_token exists but the cached user blob is stale, we
 *     hit /auth/refresh once to swap tokens + refresh the user.
 *   • Anything fancier (concurrent refresh, request retry on 401) is
 *     intentionally deferred to keep this file under control. The auth
 *     pages do explicit re-login when an operation revokes sessions.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshLock = useRef(false);

  // First mount → hydrate from localStorage, then opportunistically refresh.
  useEffect(() => {
    let cancelled = false;

    const cachedUser = getStoredUser();
    if (cachedUser) setUser(cachedUser);

    async function maybeRefresh() {
      if (refreshLock.current) return;
      refreshLock.current = true;
      try {
        if (!hasSession()) return;
        const rt = getRefreshToken();
        if (!rt) return;
        const fresh = await authApi.refresh({ refresh_token: rt });
        if (cancelled) return;
        persistSession({ user: fresh.user, access_token: fresh.access_token, refresh_token: fresh.refresh_token });
        setUser(fresh.user);
        // Best-effort enrich with roles + max_role_level from /users/me.
        // /auth/refresh only returns the slim AuthUser shape; without
        // this call the UserMenu wouldn't know whether to show the
        // Instructor / Admin sections after a page reload.
        void enrichWithMe(fresh.user, cancelled);
      } catch {
        // refresh failed → treat as signed-out
        if (!cancelled) {
          clearSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
        refreshLock.current = false;
      }
    }
    maybeRefresh();

    /**
     * Fetch `/users/me` and merge `roles` + `max_role_level` into the
     * stored AuthUser. Silent-fail on error — the rest of the app
     * still functions with the slim user; the only thing missing is
     * the conditional Instructor/Admin sections in the UserMenu.
     */
    async function enrichWithMe(base: AuthUser, isCancelled: boolean) {
      try {
        const me = await getMe();
        if (isCancelled) return;
        const enriched = meToAuthUser(me, base);
        setStoredUser(enriched);
        setUser(enriched);
      } catch {
        /* ignore — slim user is still valid */
      }
    }
    // If hasSession() was false from the start, finish loading immediately
    if (!hasSession()) setLoading(false);

    return () => { cancelled = true; };
  }, []);

  const setSession = useCallback<AuthContextValue['setSession']>((u, t) => {
    persistSession({ user: u, access_token: t.access_token, refresh_token: t.refresh_token });
    setUser(u);
  }, []);

  const updateUser = useCallback<AuthContextValue['updateUser']>((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      setStoredUser(next);
      return next;
    });
  }, []);

  const login = useCallback<AuthContextValue['login']>(async (identifier, password) => {
    const result = await authApi.login({ identifier, password });
    setSession(result.user, { access_token: result.access_token, refresh_token: result.refresh_token });
    // Best-effort enrich with roles + max_role_level from /users/me so
    // the UserMenu can show the Instructor / Admin sections right after
    // the page renders post-login (instead of needing a manual reload).
    // Silent-fail — the slim AuthUser still works for everything else.
    void (async () => {
      try {
        const me = await getMe();
        const enriched = meToAuthUser(me, result.user);
        setStoredUser(enriched);
        setUser(enriched);
      } catch { /* ignore */ }
    })();
    return result.user;
  }, [setSession]);

  const logout = useCallback<AuthContextValue['logout']>(async () => {
    const rt = getRefreshToken();
    try { await authApi.logout({ refresh_token: rt }); } catch { /* best-effort */ }
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signedIn: !!user,
    setSession,
    updateUser,
    login,
    logout,
  }), [user, loading, setSession, updateUser, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() must be used inside <AuthProvider>');
  return ctx;
}
