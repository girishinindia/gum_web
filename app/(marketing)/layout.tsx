import { Header }            from '@/components/layout/Header';
import { Footer }            from '@/components/layout/Footer';
import { AnnouncementBar }   from '@/components/home/AnnouncementBar';
import { SecondaryNav }      from '@/components/layout/SecondaryNav';
import { LanguageProvider }  from '@/components/layout/LanguageProvider';
import { api, recentAnnouncementsCount } from '@/lib/api';

/**
 * Shared chrome for every public marketing page — home, courses, bundles,
 * webinars, instructors, blog, legals, about, etc.
 *
 * Chrome stack (top to bottom):
 *   1. AnnouncementBar  — promo / news ticker
 *   2. Header           — logo, primary nav (Courses mega-menu), language, login
 *   3. SecondaryNav     — sticky strip of 8 quick links
 *
 * The <LanguageProvider> wraps EVERYTHING in marketing so the header, the
 * secondary strip, the footer and inner sections can all read the active
 * language and translated chrome strings via `useT()`.
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [languages, newAnnouncements] = await Promise.all([
    api.materialLanguages().then((rows) => rows ?? []),
    recentAnnouncementsCount(7),
  ]);

  return (
    <LanguageProvider languages={languages}>
      <AnnouncementBar />
      <Header />
      <SecondaryNav newAnnouncementsCount={newAnnouncements} />
      <main>{children}</main>
      <Footer />
    </LanguageProvider>
  );
}
