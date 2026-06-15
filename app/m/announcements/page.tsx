import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { AnnouncementsFeed } from '@/components/announcements/AnnouncementsFeed';

/** Mobile announcements — role-aware list (instructors/students see their
 *  scoped announcements + 'all'; anonymous sees 'all'). */
export default function MobileAnnouncementsPage() {
  return (
    <div>
      <MobilePageHeader title="Announcements" subtitle="What's new on Grow Up More" />
      <AnnouncementsFeed variant="mobile" />
    </div>
  );
}
