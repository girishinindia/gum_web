import Link from 'next/link';
import { Star, BookOpen, ArrowRight } from 'lucide-react';
import type { Course } from '@/lib/api';
import { cn } from '@/lib/cn';

// Bold solid gradient thumbs — matches the growupmore.com style.
const THUMB_GRADIENTS = [
  'from-brand-700 via-brand-600 to-brand-500',
  'from-emerald-700 via-emerald-600 to-emerald-500',
  'from-violet-700 via-violet-600 to-rose-500',
  'from-rose-600 via-rose-500 to-amber-500',
  'from-brand-800 via-accent-dark to-accent',
  'from-amber-600 via-orange-500 to-rose-500',
  'from-slate-800 via-brand-700 to-brand-500',
  'from-emerald-600 via-brand-500 to-brand-700',
  'from-fuchsia-700 via-violet-600 to-brand-600',
];

interface Props {
  course: Course;
  index?: number;
}

function formatPrice(n?: number | null): string | null {
  if (n == null || isNaN(Number(n))) return null;
  return `₹${Math.round(Number(n)).toLocaleString('en-IN')}`;
}

export function CourseCard({ course, index = 0 }: Props) {
  const grad = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
  const price     = formatPrice(course.price);
  const original  = formatPrice(course.original_price);
  const isFree    = !!course.is_free;
  const rating    = course.rating_average ?? null;
  const lessons   = course.total_lessons  ?? null;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover"
    >
      <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
        {/* Subtle pattern accent */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <div aria-hidden className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

        {/* "हिन्दी में" badge top-right */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-bold text-brand-700 shadow-sm">
          हिन्दी में
        </div>

        {/* Difficulty pill top-left */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white uppercase tracking-wider">
          {course.difficulty_level ? course.difficulty_level.replace('_', ' ') : 'Beginner'}
        </div>

        {/* Price + course code at the bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="text-white">
            <div className="text-[10px] font-mono tracking-widest opacity-80">{course.code || 'COURSE'}</div>
            {(price || isFree) && (
              <div className="mt-1 heading text-lg leading-none">
                {isFree ? 'Free' : price}
                {original && !isFree && (
                  <span className="ml-2 text-xs font-medium opacity-70 line-through">{original}</span>
                )}
              </div>
            )}
          </div>
          <div className="h-9 w-9 rounded-full bg-white text-brand-700 flex items-center justify-center shadow-md group-hover:bg-brand-500 group-hover:text-white transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="heading text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {course.name}
        </h3>
        {course.short_description && (
          <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2">{course.short_description}</p>
        )}

        <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {lessons != null && (
              <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {lessons} lessons</span>
            )}
          </div>
          {rating != null && (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-warn text-warn" /> {Number(rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
