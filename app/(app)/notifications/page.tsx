import { Eyebrow } from '@/components/ui/Eyebrow';
import { NotificationsInbox } from '@/components/notifications/NotificationsInbox';

export const metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Eyebrow>Notifications</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Inbox</h1>
      <div className="mt-6">
        <NotificationsInbox variant="desktop" />
      </div>
    </div>
  );
}
