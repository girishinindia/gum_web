import { Megaphone, Pin } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { api, type Announcement } from '@/lib/api';
import { cn } from '@/lib/cn';

export const revalidate = 120;

function timeAgo(d?: string | null): string {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return days === 1 ? 'Yesterday' : `${days} days ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Mobile announcements — live data (was a hardcoded array, June 2026). */
export default async function MobileAnnouncementsPage() {
  const items: Announcement[] = (await api.announcements().catch(() => [])) ?? [];

  return (
    <div>
      <MobilePageHeader title="Announcements" subtitle="What's new on Grow Up More" />
      {items.length === 0 ? (
        <div className="px-3 pt-6 pb-8 text-center">
          <Megaphone className="h-7 w-7 mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-700">No announcements yet</p>
          <p className="mt-0.5 text-[12px] text-slate-500">Updates will appear here once published.</p>
        </div>
      ) : (
        <ul className="px-3 pt-2 space-y-2 pb-4">
          {items.map((a) => (
            <li key={a.id}>
              <div className={cn('rounded-md bg-white border shadow-card p-3.5', a.is_pinned ? 'border-brand-300' : 'border-slate-200')}>
                <div className="flex items-start gap-2.5">
                  <div className="h-9 w-9 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white flex items-center justify-center shrink-0">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 leading-snug">{a.title}</div>
                    {a.content && <p className="mt-1 text-[11.5px] text-slate-600 leading-relaxed line-clamp-3 whitespace-pre-line">{a.content}</p>}
                    <div className="mt-1 flex items-center gap-2 text-[10.5px] text-slate-500">
                      <span>{timeAgo(a.published_at)}</span>
                      {a.is_pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-1.5 py-0.5 text-[9.5px] font-bold">
                          <Pin className="h-2.5 w-2.5" /> PINNED
                        </span>
                      )}
                      {a.announcement_type && <span className="uppercase tracking-wider text-slate-400">{a.announcement_type}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
