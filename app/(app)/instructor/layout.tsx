'use client';

/**
 * Instructor-area route guard. The UserMenu only HIDES the Instructor links for
 * non-instructors (max_role_level < 60) — but the /instructor/* URLs were still
 * directly reachable, so a student could open the instructor console (it showed
 * empty data because the API is permission-scoped). This layout blocks access:
 * instructors pass, everyone else is redirected to their dashboard.
 *
 * The cached AuthUser is enriched with max_role_level best-effort, so when the
 * cached level is below the bar we re-confirm authoritatively via /users/me
 * before denying — this avoids briefly bouncing a real instructor on reload.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getMe, meToAuthUser } from '@/lib/users/client';

const INSTRUCTOR_LEVEL = 60;

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login?next=/instructor'); return; }
    if ((user.max_role_level ?? 0) >= INSTRUCTOR_LEVEL) { setAllowed(true); return; }
    // Cached blob may be slim / pre-enrichment — confirm with the server.
    let cancelled = false;
    getMe()
      .then((me) => { if (!cancelled) setAllowed((meToAuthUser(me, user).max_role_level ?? 0) >= INSTRUCTOR_LEVEL); })
      .catch(() => { if (!cancelled) setAllowed(false); });
    return () => { cancelled = true; };
  }, [loading, user, router]);

  useEffect(() => {
    if (allowed === false) router.replace('/dashboard');
  }, [allowed, router]);

  if (loading || allowed === null) {
    return <div className="max-w-7xl mx-auto px-4 py-24 text-center text-sm text-slate-400">Loading…</div>;
  }
  if (!allowed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="heading text-2xl text-slate-900">Instructor access only</h1>
        <p className="mt-2 text-sm text-slate-500">This area is for instructors. If you’d like to teach on GrowUpMore, reach out to the team to become an instructor.</p>
        <a href="/dashboard" className="mt-6 inline-flex rounded-full bg-brand-600 text-white px-5 py-2 text-sm font-semibold hover:bg-brand-700">Back to dashboard</a>
      </div>
    );
  }
  return <>{children}</>;
}
