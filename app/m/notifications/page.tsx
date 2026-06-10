import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { NotificationsInbox } from '@/components/notifications/NotificationsInbox';

export default function MobileNotificationsPage() {
  return (
    <div>
      <MobilePageHeader title="Notifications" />
      <div className="px-3 pb-4">
        <NotificationsInbox variant="mobile" />
      </div>
    </div>
  );
}
