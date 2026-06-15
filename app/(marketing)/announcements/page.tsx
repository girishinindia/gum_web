import { PageHero } from '@/components/ui/PageHero';
import { AnnouncementsFeed } from '@/components/announcements/AnnouncementsFeed';

export const metadata = {
  title: 'Announcements',
  description: 'Latest announcements, product updates, and news from Grow Up More.',
};

/**
 * Public announcements page. The list is rendered by a client component
 * (AnnouncementsFeed) so it can include role-targeted announcements for the
 * signed-in viewer (instructors / students), while anonymous visitors see
 * only 'all'-scoped ones. Pinned first, then newest.
 */
export default function AnnouncementsPage() {
  return (
    <>
      <PageHero
        eyebrow="Announcements"
        title={<>What&apos;s new on <span className="text-gradient">Grow Up More</span></>}
        subtitle="Platform updates, new course launches, events and everything you need to know."
      />
      <AnnouncementsFeed variant="desktop" />
    </>
  );
}
