import { Header }            from '@/components/layout/Header';
import { Footer }            from '@/components/layout/Footer';
import { AnnouncementBar }   from '@/components/home/AnnouncementBar';
import { SecondaryNav }      from '@/components/layout/SecondaryNav';
import { LanguageProvider }  from '@/components/layout/LanguageProvider';
import { RequireAuth }       from '@/components/auth/RequireAuth';
import { PresenceConnector } from '@/components/presence/PresenceConnector';
import { api, recentAnnouncementsCount } from '@/lib/api';

// The (app) group is auth-gated and per-user — it must never be statically
// prerendered. Forcing dynamic rendering also stops the build-time
// "useSearchParams() should be wrapped in a Suspense boundary" bailout that
// failed the /cart export (the shared chrome uses search params at runtime).
export const dynamic = 'force-dynamic';

/**
 * App layout — wraps the authenticated `(app)` route group (dashboard,
 * my-courses, wishlist, profile, etc.) in **the same chrome the rest
 * of the site uses**: AnnouncementBar → Header → SecondaryNav → main
 * → Footer, all under LanguageProvider so translations + language
 * switching work identically to the marketing pages.
 *
 * Why mirror the marketing chrome instead of using a bespoke AppShell
 * (the old behaviour)?
 *   • Visual continuity — the dashboard now reads as "the same product"
 *     as the home / courses / bundles / instructors pages.
 *   • Single source of truth for navigation, language, header user-
 *     menu (login → avatar-dropdown), and the announcement strip.
 *   • Less surface area: the orphan AppShell + its embedded fake top
 *     bar / sidebar are no longer in the render tree.
 *
 * Auth gating: the inner `<RequireAuth>` bounces unauthenticated
 * visitors to `/login?next=<current>` once the AuthProvider has
 * finished hydrating. The marketing chrome stays visible during the
 * brief hydration window so users don't see a flash of blank.
 *
 * Container width — each page inside `(app)` is responsible for its
 * own `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` container, identical
 * to the marketing pages. We don't impose one here so individual
 * pages can choose narrower content widths when it makes sense
 * (e.g. settings forms).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [languages, newAnnouncements] = await Promise.all([
    api.materialLanguages().then((rows) => rows ?? []),
    recentAnnouncementsCount(7),
  ]);

  return (
    <LanguageProvider languages={languages}>
      {/* BUG-31: open the /chat presence socket for any signed-in user app-wide
          (not only on chat pages) so the admin "Online Users" stat is accurate. */}
      <PresenceConnector />
      <AnnouncementBar />
      <Header />
      <SecondaryNav newAnnouncementsCount={newAnnouncements} />
      <main>
        <RequireAuth>{children}</RequireAuth>
      </main>
      <Footer />
    </LanguageProvider>
  );
}
