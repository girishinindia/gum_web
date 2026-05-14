import Link from 'next/link';
import { Star, Users, BookOpen, BadgeCheck } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { FEATURED_INSTRUCTORS } from '@/lib/homeContent';

export default function MobileInstructorsPage() {
  return (
    <div>
      <MobilePageHeader title="Instructors" subtitle="Learn from people who shipped real things" />
      <div className="px-3 pt-2 grid grid-cols-2 gap-3 pb-4">
        {FEATURED_INSTRUCTORS.map((p) => (
          <Link
            key={p.id}
            href={`/m/instructors/${p.id}`}
            className="rounded-md bg-white border border-slate-200 shadow-card p-3 text-center active:scale-[0.97] transition-all"
          >
            <div className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-br ${p.accent} text-white heading text-xl flex items-center justify-center shadow-btn`}>
              {p.initial}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[9px] font-bold">
              <BadgeCheck className="h-2.5 w-2.5" /> {p.badge}
            </div>
            <h3 className="mt-1 heading text-[12.5px] font-bold text-slate-900 leading-tight">{p.name}</h3>
            <p className="text-[10.5px] text-slate-500 line-clamp-2 min-h-[28px]">{p.title}</p>
            <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex flex-col items-center"><BookOpen className="h-2.5 w-2.5" /><span className="font-semibold text-slate-700 text-[11px]">{p.courses}</span></div>
              <div className="flex flex-col items-center"><Users className="h-2.5 w-2.5" /><span className="font-semibold text-slate-700 text-[10.5px]">{p.students}</span></div>
              <div className="flex flex-col items-center"><Star className="h-2.5 w-2.5 fill-warn text-warn" /><span className="font-semibold text-slate-700 text-[11px]">{p.rating}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
