import { notFound } from 'next/navigation';
import { Star, Users, Clock, PlayCircle, CheckCircle2, Award, BookOpen, Globe, ChevronRight, Share2, FileText } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { TrailerPlayButton } from '@/components/course/TrailerPlayButton';
import { MobileDetailBar } from '@/components/mobile/MobileDetailBar';
import { Reviews } from '@/components/reviews/Reviews';
import { CoursePromo } from '@/components/commerce/CoursePromo';
import { api } from '@/lib/api';

export const revalidate = 300;

const inr = (n?: number | null) => (n == null ? '' : `₹${Math.round(Number(n)).toLocaleString('en-IN')}`);

export default async function MobileCourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await api.courseBySlug(slug);
  if (!course) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const t: any = course.translation || {};
  const title = t.title || course.name || 'Course';
  const desc = t.short_intro || t.short_description || t.description || '';
  const cat = course.category?.category_name;
  const level = course.difficulty_level ? course.difficulty_level.replace('_', ' ') : null;
  const instructor: any = course.instructor || {};
  const instructorName = instructor.name || instructor.full_name || null;
  const curriculum: any[] = Array.isArray(course.curriculum) ? course.curriculum : [];
  const learnRaw = t.what_you_learn ?? t.learning_outcomes;
  const learn: string[] = Array.isArray(learnRaw)
    ? learnRaw
    : typeof learnRaw === 'string' ? learnRaw.split('\n').map((s: string) => s.trim()).filter(Boolean) : [];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const showOrig = course.original_price != null && Number(course.original_price) > Number(course.price ?? 0);

  return (
    <div>
      <MobilePageHeader
        title={title}
        subtitle="Course details"
        action={<span className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700"><Share2 className="h-4 w-4" /></span>}
      />

      <div className="px-3">
        <div className="relative aspect-video rounded-md overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center">
          {course.trailer_thumbnail_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.trailer_thumbnail_url} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          )}
          {course.trailer_video_url ? (
            <TrailerPlayButton
              courseId={course.id}
              hasTrailer
              className="relative h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-cardHover"
              iconClassName="h-7 w-7 text-brand-700"
            />
          ) : (
            <span className="relative h-14 w-14 rounded-full bg-white/30 flex items-center justify-center"><PlayCircle className="h-7 w-7 text-white/80" /></span>
          )}
        </div>
      </div>

      <section className="px-4 pt-4">
        {(cat || level) && <div className="text-[10px] font-bold uppercase tracking-wider text-brand-700">{[cat, level].filter(Boolean).join(' · ')}</div>}
        <h1 className="mt-1 heading text-2xl text-slate-900 leading-tight">{title}</h1>
        {desc && <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">{desc}</p>}

        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
          {course.rating_average != null && <span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Star className="h-3 w-3 fill-warn text-warn" /> {Number(course.rating_average).toFixed(1)}{course.rating_count != null ? ` (${course.rating_count.toLocaleString('en-IN')})` : ''}</span>}
          {course.enrollment_count != null && <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollment_count.toLocaleString('en-IN')}</span>}
          {course.duration_hours != null && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration_hours}h</span>}
          {course.language_name && <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> {course.language_name}</span>}
        </div>

        {instructorName && (
          <div className="mt-4 flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-sm font-bold flex items-center justify-center">{instructorName.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('')}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">{instructorName}</div>
              {instructor.designation && <div className="text-[10.5px] text-slate-500 truncate">{instructor.designation}</div>}
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        )}
      </section>

      {!course.is_free && (
        <section className="px-4 mt-3">
          <CoursePromo courseId={course.id} compact />
        </section>
      )}

      {learn.length > 0 && (
        <section className="px-4 mt-5">
          <h2 className="heading text-[15px] font-bold text-slate-900">What you&apos;ll learn</h2>
          <ul className="mt-2 space-y-1.5">
            {learn.slice(0, 8).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-700"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {item}</li>
            ))}
          </ul>
        </section>
      )}

      {curriculum.length > 0 && (
        <section className="px-4 mt-5">
          <h2 className="heading text-[15px] font-bold text-slate-900">Syllabus</h2>
          {course.total_lessons != null && <div className="mt-1 text-[11px] text-slate-500">{curriculum.length} modules · {course.total_lessons} lessons{course.duration_hours ? ` · ${course.duration_hours}h` : ''}</div>}
          <div className="mt-3 space-y-2">
            {curriculum.slice(0, 8).map((m: any, i: number) => {
              const lessons = Array.isArray(m.topics) ? m.topics.length : (m.lesson_count ?? m.lessons_count ?? null);
              return (
                <details key={i} open={i === 0} className="group rounded-md bg-white border border-slate-200">
                  <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <div className="heading text-[13px] text-slate-900">Module {i + 1} · {m.title || m.name || 'Module'}</div>
                      {lessons != null && <div className="text-[10.5px] text-slate-500 mt-0.5">{lessons} lessons</div>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  {Array.isArray(m.topics) && m.topics.length > 0 && (
                    <ul className="px-3 pb-2 pt-0.5 border-t border-slate-100 space-y-1">
                      {m.topics.slice(0, 6).map((tp: any, k: number) => (
                        <li key={k} className="flex items-center gap-2 text-[12px] text-slate-600 py-1"><PlayCircle className="h-3.5 w-3.5 text-brand-500" /><span className="flex-1 truncate">{tp.title || tp.name || `Lesson ${k + 1}`}</span></li>
                      ))}
                    </ul>
                  )}
                </details>
              );
            })}
          </div>
        </section>
      )}

      <section className="px-4 mt-5">
        <h2 className="heading text-[15px] font-bold text-slate-900">What&apos;s included</h2>
        <ul className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-slate-700">
          {course.duration_hours != null && <li className="flex items-center gap-2 rounded-md bg-white border border-slate-200 p-2.5"><PlayCircle className="h-4 w-4 text-brand-600" /> {course.duration_hours}h video</li>}
          {course.total_projects != null && course.total_projects > 0 && <li className="flex items-center gap-2 rounded-md bg-white border border-slate-200 p-2.5"><BookOpen className="h-4 w-4 text-brand-600" /> {course.total_projects} projects</li>}
          {course.has_certificate && <li className="flex items-center gap-2 rounded-md bg-white border border-slate-200 p-2.5"><Award className="h-4 w-4 text-brand-600" /> Certificate</li>}
          {course.total_lessons != null && <li className="flex items-center gap-2 rounded-md bg-white border border-slate-200 p-2.5"><FileText className="h-4 w-4 text-brand-600" /> {course.total_lessons} lessons</li>}
        </ul>
      </section>

      <section className="px-4 mt-6">
        <Reviews itemType="course" itemId={course.id} basePath="/m" noun="course" />
      </section>

      <MobileDetailBar
        enroll={{ itemType: 'course', itemId: course.id, isFree: !!course.is_free, item: { title, price: course.price, original_price: course.original_price, is_free: !!course.is_free, thumbnail_url: course.trailer_thumbnail_url, slug } }}
        left={
          course.is_free ? (
            <span className="heading text-lg text-emerald-600">Free</span>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="heading text-lg text-slate-900">{inr(course.price)}</span>
              {showOrig && <span className="text-[10.5px] text-slate-400 line-through">{inr(course.original_price)}</span>}
              {course.discount_percentage ? <span className="text-[9.5px] font-bold bg-success/15 text-success rounded-full px-1.5 py-0.5">{course.discount_percentage}% OFF</span> : null}
            </div>
          )
        }
      />
    </div>
  );
}
