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
export function RequireAuth({ children, loginPath = '/login', fallback }: Props) {
  const { loading, signedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (signedIn) return;
    const next = pathname && pathname !== loginPath ? `?next=${encodeURIComponent(pathname)}` : '';
    router.replace(`${loginPath}${next}`);
  }, [loading, signedIn, pathname, router, loginPath]);

  if (loading || !signedIn) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
