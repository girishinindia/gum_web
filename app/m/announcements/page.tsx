import { Megaphone, Flame } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { ANNOUNCEMENTS } from '@/lib/homeContent';

export default function MobileAnnouncementsPage() {
  return (
    <div>
      <MobilePageHeader title="Announcements" subtitle="What's new on Grow Up More" />
      <ul className="px-3 pt-2 space-y-2 pb-4">
        {ANNOUNCEMENTS.map((a, i) => (
          <li key={a.id}>
            <div className="rounded-md bg-white border border-slate-200 shadow-card p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="h-9 w-9 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white flex items-center justify-center shrink-0">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900 leading-snug">{a.emoji} {a.text}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10.5px] text-slate-500">
                    <span>{i === 0 ? 'Just now' : i === 1 ? 'Yesterday' : '3 days ago'}</span>
                    {i < 2 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-1.5 py-0.5 text-[9.5px] font-bold">
                        <Flame className="h-2.5 w-2.5" /> NEW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
