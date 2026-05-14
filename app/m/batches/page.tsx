import Link from 'next/link';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

/**
 * Mobile course-batches listing — seed data until a /batches endpoint exists.
 */
const BATCHES = [
  { id: 1, name: 'Data Science with Python — Batch 24',  start: '20 May 2026',  duration: '6 months', seats: 18,  cover: 'from-brand-500 to-accent' },
  { id: 2, name: 'MERN Full Stack — Batch 18',           start: '24 May 2026',  duration: '5 months', seats: 12,  cover: 'from-emerald-500 to-brand-500' },
  { id: 3, name: 'AI & ML Pro — Batch 11',               start: '01 Jun 2026',  duration: '7 months', seats: 24,  cover: 'from-violet-500 to-rose-500' },
  { id: 4, name: 'Cyber Security Fundamentals — Batch 9', start: '05 Jun 2026', duration: '4 months', seats: 30,  cover: 'from-rose-500 to-amber-500' },
  { id: 5, name: 'Cloud & DevOps — Batch 14',            start: '10 Jun 2026',  duration: '5 months', seats: 16,  cover: 'from-amber-500 to-brand-500' },
  { id: 6, name: 'Generative AI Builder — Batch 7',      start: '15 Jun 2026',  duration: '3 months', seats: 22,  cover: 'from-brand-600 to-accent' },
];

export default function MobileBatchesPage() {
  return (
    <div>
      <MobilePageHeader title="Course Batches" />
      <div className="px-3 pt-2 pb-4 space-y-2">
        {BATCHES.map((b) => (
          <Link
            key={b.id}
            href={`/m/courses`}
            className="block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden active:scale-[0.99] transition-all"
          >
            <div className={`h-1.5 bg-gradient-to-r ${b.cover}`} />
            <div className="p-3.5">
              <h3 className="heading text-[13.5px] font-semibold text-slate-900 line-clamp-2">{b.name}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 font-semibold">
                  <Calendar className="h-2.5 w-2.5" /> {b.start}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">
                  <Clock className="h-2.5 w-2.5" /> {b.duration}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 font-semibold">
                  <Users className="h-2.5 w-2.5" /> {b.seats} seats
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700">
                Reserve seat <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
