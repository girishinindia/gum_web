import { notFound } from 'next/navigation';
import { Layers, Users, Star, CheckCircle2, BookOpen } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { MobileShareButton } from '@/components/mobile/MobileShareButton';
import { MobileDetailBar } from '@/components/mobile/MobileDetailBar';
import { Reviews } from '@/components/reviews/Reviews';
import { api } from '@/lib/api';

export const revalidate = 300;
const inr = (n?: number | null) => (n == null ? '' : `₹${Math.round(Number(n)).toLocaleString('en-IN')}`);

export default async function MobileBundleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await api.bundleBySlug(slug);
  if (!bundle) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const t: any = bundle.translation || {};
  const title = t.title || bundle.name || 'Bundle';
  const desc = t.short_description || t.description || '';
  const courses = Array.isArray(bundle.included_courses) ? bundle.included_courses : [];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const showOrig = bundle.original_price != null && Number(bundle.original_price) > Number(bundle.price ?? 0);

  return (
    <div>
      <MobilePageHeader title={title} subtitle="Bundle details" action={<MobileShareButton title={title} />} />

      <div className="px-3">
        <div className="relative aspect-video rounded-md overflow-hidden bg-gradient-to-br from-violet-700 via-brand-600 to-brand-500 flex items-center justify-center">
          <Layers className="h-12 w-12 text-white/80" />
          {bundle.discount_percent ? <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SAVE {bundle.discount_percent}%</span> : null}
        </div>
      </div>

      <section className="px-4 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Career Bundle</div>
        <h1 className="mt-1 heading text-2xl text-slate-900 leading-tight">{title}</h1>
        {desc && <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">{desc}</p>}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
          {bundle.course_count != null && <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" /> {bundle.course_count} courses</span>}
          {bundle.student_count != null && <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {bundle.student_count.toLocaleString('en-IN')}+ students</span>}
          {bundle.rating_average != null && <span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Star className="h-3 w-3 fill-warn text-warn" /> {Number(bundle.rating_average).toFixed(1)}</span>}
        </div>
      </section>

      {courses.length > 0 && (
        <section className="px-4 mt-5">
          <h2 className="heading text-[15px] font-bold text-slate-900">Included courses ({courses.length})</h2>
          <div className="mt-2 space-y-2">
            {courses.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3">
                <span className="h-9 w-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><BookOpen className="h-4 w-4" /></span>
                <span className="flex-1 min-w-0"><span className="block text-[13px] font-semibold text-slate-900 truncate">{c.translated_title || c.name}</span>{c.difficulty_level && <span className="text-[10.5px] text-slate-500 capitalize">{String(c.difficulty_level).replace('_', ' ')}</span>}</span>
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 mt-6">
        <Reviews itemType="bundle" itemId={bundle.id} basePath="/m" noun="bundle" />
      </section>

      <MobileDetailBar
        enroll={{ itemType: 'bundle', itemId: bundle.id, isFree: false, item: { title, price: bundle.price, original_price: bundle.original_price, is_free: false, slug } }}
        left={
          <div className="flex items-baseline gap-1.5">
            <span className="heading text-lg text-slate-900">{inr(bundle.price)}</span>
            {showOrig && <span className="text-[10.5px] text-slate-400 line-through">{inr(bundle.original_price)}</span>}
            {bundle.discount_percent ? <span className="text-[9.5px] font-bold bg-success/15 text-success rounded-full px-1.5 py-0.5">{bundle.discount_percent}% OFF</span> : null}
          </div>
        }
      />
    </div>
  );
}
