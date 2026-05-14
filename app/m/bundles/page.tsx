import Link from 'next/link';
import { Star, Users, Layers, ArrowRight } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { BUNDLES } from '@/lib/homeContent';

export default function MobileBundlesPage() {
  return (
    <div>
      <MobilePageHeader title="Course Bundles" subtitle="Save up to 54% on multi-course packs" />
      <div className="px-3 pt-2 space-y-3 pb-4">
        {BUNDLES.map((b) => (
          <Link
            key={b.id}
            href={`/m/bundles/${b.slug}`}
            className="block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden active:scale-[0.98] transition-all"
          >
            <div className={`relative h-24 bg-gradient-to-br ${b.cover}`}>
              <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full">SAVE {b.savePercent}%</div>
              <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-white/15 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/25">
                <Layers className="h-3 w-3" /> {b.courseCount} courses
              </div>
            </div>
            <div className="p-3">
              <h3 className="heading text-[14px] font-bold text-slate-900">{b.name}</h3>
              <p className="text-[11.5px] text-slate-600 line-clamp-2 mt-0.5 min-h-[28px]">{b.desc}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="heading text-base text-slate-900">₹{b.price.toLocaleString('en-IN')}</span>
                  <span className="text-[10.5px] text-slate-400 line-through">₹{b.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[11px] font-semibold text-brand-700 inline-flex items-center gap-0.5">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10.5px] text-slate-500">
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {b.students.toLocaleString('en-IN')}+ students</span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700"><Star className="h-3 w-3 fill-warn text-warn" /> {b.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
