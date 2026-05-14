import Link from 'next/link';
import { Radio, Calendar, Clock, Sparkles } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { UPCOMING_WEBINARS } from '@/lib/homeContent';

export default function MobileWebinarsPage() {
  return (
    <div>
      <MobilePageHeader title="Webinars" subtitle="Free live classes this week" />
      <div className="px-3 pt-2 space-y-3 pb-4">
        {UPCOMING_WEBINARS.map((w) => (
          <Link
            key={w.id}
            href={`/m/webinars/${w.id}`}
            className="block rounded-md bg-white border border-slate-200 overflow-hidden active:scale-[0.98] transition-all shadow-card"
          >
            <div className={`relative aspect-[16/8] bg-gradient-to-br ${w.cover}`}>
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-rose-600">
                <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE
              </div>
              <div className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${w.tag === 'Free' ? 'bg-success/90 text-white' : 'bg-amber-500 text-white'}`}>
                {w.tag === 'Free' && <Sparkles className="h-2.5 w-2.5" />} {w.tag}
              </div>
              <div className="absolute bottom-2 left-2 text-white">
                <div className="text-[10px] opacity-85 uppercase tracking-wider">Hosted by</div>
                <div className="heading text-[13px]">{w.host}</div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="heading text-[13.5px] font-bold text-slate-900 line-clamp-2 min-h-[34px]">{w.title}</h3>
              <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-500">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {w.date}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {w.time}</span>
                <span>{w.duration}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
