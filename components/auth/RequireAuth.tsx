'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface Props {
  children:    React.ReactNode;
  /** Where to send unauthenticated visitors. Defaults to /login. */
  loginPath?:  string;
  /** What to render while the auth context is hydrating. */
  fallback?:   React.ReactNode;
  /** Paths (or prefixes) that stay accessible to signed-out visitors (e.g. /cart). */
  publicPaths?: string[];
}

/**
 * Client-side guard. Use to wrap protected page content:
 *
 *   <RequireAuth>
 *     <SecuritySettings />
 *   </RequireAuth>
 *
 * While the `AuthProvider` is still hydrating from localStorage, we
 * render `fallback` (or null). Once hydration finishes and the user is
 * still not signed in, we push to `loginPath?next=<current>` so the
 * login page can deep-link the user back after a successful sign-in.
 */
// BUG-38 fix (June 2026): pages that render their own friendly sign-in CARD
// (wallet, payments, notifications, support, my-ideas, submit-idea) are no
// longer hard-bounced to /login — guests see the inline card instead.
const SELF_GATED = ['/wallet', '/payments', '/notifications', '/support', '/my-ideas', '/submit-idea'];

export function RequireAuth({ children, loginPath = '/login', fallback, publicPaths = ['/cart'] }: Props) {
  const { loading, signedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Guest-accessible routes (cart) skip the guard so a signed-out user can
  // build a cart; payment itself still requires login.
  const isPublic = !!pathname && [...publicPaths, ...SELF_GATED].some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (loading || signedIn || isPublic) return;
    const next = pathname && pathname !== loginPath ? `?next=${encodeURIComponent(pathname)}` : '';
    router.replace(`${loginPath}${next}`);
  }, [loading, signedIn, isPublic, pathname, router, loginPath]);

  if (isPublic) return <>{children}</>;
  if (loading || !signedIn) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
