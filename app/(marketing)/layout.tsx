import { Header }          from '@/components/layout/Header';
import { Footer }          from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';

/**
 * Shared chrome for every public marketing page — home, courses, bundles,
 * webinars, instructors, blog, legals, about, etc.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
