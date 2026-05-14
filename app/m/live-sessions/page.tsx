import Link from 'next/link';
import { Video, Clock, Users } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { UPCOMING_WEBINARS } from '@/lib/homeContent';

/**
 * Mobile live-sessions listing — currently mirrors the upcoming-webinars seed
 * data. Once a real /live-sessions endpoint exists, swap this fetch in.
 */
export default function MobileLiveSessionsPage() {
  return (
    <div>
      <MobilePageHeader title="Live Sessions" />
      <div className="px-3 pt-2 pb-4 space-y-2">
        {UPCOMING_WEBINARS.map((w) => (
          <Link
            key={w.id}
            href={`/m/webinars/${w.id}`}
            className="block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden active:scale-[0.99] transition-all"
          >
            <div className={`relative h-20 bg-gradient-to-br ${w.cover}`}>
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-rose-600">
                <Video className="h-2.5 w-2.5 animate-pulse" /> LIVE
              </div>
              <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-black/40 backdrop-blur text-white rounded-full px-2 py-0.5 text-[9.5px] font-semibold">
                <Clock className="h-2.5 w-2.5" /> {w.duration}
              </div>
            </div>
            <div className="p-3">
              <h3 className="heading text-[13.5px] font-semibold text-slate-900 line-clamp-2">{w.title}</h3>
              <div className="mt-1 text-[11.5px] text-slate-500">by {w.host}</div>
              <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-500">
                <span>{w.date} · {w.time}</span>
                <span className="inline-flex items-center gap-0.5 text-brand-700 font-semibold">
                  <Users className="h-2.5 w-2.5" /> Reserve
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
