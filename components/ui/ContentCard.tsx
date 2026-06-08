import Link from 'next/link';
import {
  Star, BookOpen, ArrowRight, Layers, Users, Calendar, Clock,
  Mic, Video, Radio, Newspaper, GraduationCap, User,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type {
  CourseListItem, BundleListItem, CourseBatch, InstructorProfile,
  BlogPost, Webinar, LiveSession, Podcast,
} from '@/lib/api';

// ─── Content-type metadata ─────────────────────────────────────────────

export type ContentType =
  | 'courses' | 'bundles' | 'batches' | 'instructors'
  | 'blogs' | 'webinars' | 'live_sessions' | 'podcasts' | 'live_classes';

const TYPE_META: Record<ContentType, { label: string; color: string; bgColor: string }> = {
  courses:       { label: 'Course',        color: 'text-brand-700',   bgColor: 'bg-brand-50 border-brand-200' },
  bundles:       { label: 'Bundle',        color: 'text-violet-700',  bgColor: 'bg-violet-50 border-violet-200' },
  batches:       { label: 'Batch',         color: 'text-amber-700',   bgColor: 'bg-amber-50 border-amber-200' },
  instructors:   { label: 'Instructor',    color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  blogs:         { label: 'Blog',          color: 'text-rose-700',    bgColor: 'bg-rose-50 border-rose-200' },
  webinars:      { label: 'Webinar',       color: 'text-sky-700',     bgColor: 'bg-sky-50 border-sky-200' },
  live_sessions: { label: 'Live Session',  color: 'text-orange-700',  bgColor: 'bg-orange-50 border-orange-200' },
  podcasts:      { label: 'Podcast',       color: 'text-fuchsia-700', bgColor: 'bg-fuchsia-50 border-fuchsia-200' },
  live_classes:  { label: 'Live Class',    color: 'text-teal-700',    bgColor: 'bg-teal-50 border-teal-200' },
};

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

// ─── Unified item type ─────────────────────────────────────────────────

export interface UnifiedItem {
  type: ContentType;
  id: number;
  data: CourseListItem | BundleListItem | CourseBatch | InstructorProfile | BlogPost | Webinar | LiveSession | Podcast;
}

// ─── Helper ────────────────────────────────────────────────────────────

function formatPrice(n?: number | null): string | null {
  if (n == null || isNaN(Number(n))) return null;
  return `₹${Math.round(Number(n)).toLocaleString('en-IN')}`;
}

function relativeDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

// ─── Type badge ────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ContentType }) {
  const meta = TYPE_META[type];
  return (
    <div className={cn('absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border', meta.bgColor, meta.color)}>
      {meta.label}
    </div>
  );
}

// ─── Course card variant ───────────────────────────────────────────────

function CourseVariant({ item, index }: { item: CourseListItem; index: number }) {
  const grad = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
  const price = formatPrice(item.price);
  const original = formatPrice(item.original_price);
  const isFree = !!item.is_free;
  const rating = item.rating_average ?? null;
  const lessons = item.total_lessons ?? null;

  return (
    <Link href={`/courses/${item.slug}`} className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover">
      <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <TypeBadge type="courses" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white uppercase tracking-wider">
          {item.difficulty_level ? item.difficulty_level.replace('_', ' ') : 'Beginner'}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="text-white">
            <div className="text-[10px] font-mono tracking-widest opacity-80">{item.code || 'COURSE'}</div>
            {(price || isFree) && (
              <div className="mt-1 heading text-lg leading-none">
                {isFree ? 'Free' : price}
                {original && !isFree && <span className="ml-2 text-xs font-medium opacity-70 line-through">{original}</span>}
              </div>
            )}
          </div>
          <div className="h-9 w-9 rounded-full bg-white text-brand-700 flex items-center justify-center shadow-md group-hover:bg-brand-500 group-hover:text-white transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="heading text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors">{item.name}</h3>
        {item.short_description && <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2">{item.short_description}</p>}
        <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {lessons != null && <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {lessons} lessons</span>}
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

// ─── Bundle card variant ───────────────────────────────────────────────

function BundleVariant({ item, index }: { item: BundleListItem; index: number }) {
  const grad = THUMB_GRADIENTS[(index + 2) % THUMB_GRADIENTS.length];
  const price = formatPrice(item.price);
  const original = formatPrice(item.original_price);
  const courseCount = item.course_count ?? 0;

  return (
    <Link href={`/bundles/${item.slug}`} className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover">
      <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <TypeBadge type="bundles" />
        <div className="absolute bottom-3 left-3">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-white">
            <Layers className="h-3 w-3" /> {courseCount} courses
          </div>
        </div>
      </div>
      <div className="p-5 min-h-[140px] flex flex-col">
        <h3 className="heading text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors">{item.name}</h3>
        {item.description && <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2">{item.description}</p>}
        <div className="mt-3 flex items-center gap-4 text-[12px] text-slate-500">
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {(item.student_count ?? 0).toLocaleString('en-IN')}+ students</span>
          {item.rating_average != null && (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Star className="h-3.5 w-3.5 fill-warn text-warn" /> {item.rating_average}
            </span>
          )}
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            {price && <div className="heading text-xl text-slate-900 leading-none">{price}</div>}
            {original && price && Number(item.original_price) > Number(item.price) && (
              <div className="text-[12px] text-slate-400 line-through mt-1">{original}</div>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
            View <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Batch card variant ────────────────────────────────────────────────

function BatchVariant({ item, index }: { item: CourseBatch; index: number }) {
  const grad = THUMB_GRADIENTS[(index + 4) % THUMB_GRADIENTS.length];
  const courseName = item.courses?.name || item.title || 'Batch';
  const courseSlug = item.courses?.slug;
  const instructorName = item.users?.full_name;
  const price = formatPrice(item.price);

  return (
    <div className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover">
      <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <TypeBadge type="batches" />
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-[10px] font-mono tracking-widest opacity-80">{item.code || 'BATCH'}</div>
          {item.batch_status && (
            <div className="mt-1 inline-flex items-center gap-1 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
              {item.batch_status.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="heading text-base font-semibold text-slate-900 line-clamp-2">
          {courseSlug ? (
            <Link href={`/courses/${courseSlug}`} className="hover:text-brand-700 transition-colors">{courseName}</Link>
          ) : courseName}
        </h3>
        {item.title && item.title !== courseName && (
          <p className="mt-1 text-[13px] text-slate-600 line-clamp-2">{item.title}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-[12px] text-slate-500">
          {instructorName && <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {instructorName}</span>}
          {item.max_students != null && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {item.enrolled_count ?? 0}/{item.max_students}</span>}
        </div>
        {price && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="heading text-lg text-slate-900">{item.is_free ? 'Free' : price}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Instructor card variant ───────────────────────────────────────────

function InstructorVariant({ item }: { item: InstructorProfile }) {
  const name = item.users?.full_name || 'Instructor';
  const avatar = item.users?.avatar_url;

  return (
    <div className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover">
      <div className="relative bg-gradient-to-br from-emerald-600 to-brand-600 p-6 flex flex-col items-center">
        <TypeBadge type="instructors" />
        <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <GraduationCap className="w-8 h-8 text-white" />
          )}
        </div>
      </div>
      <div className="p-5 text-center">
        <h3 className="heading text-base font-semibold text-slate-900">{name}</h3>
        {item.instructor_type && <p className="mt-1 text-[13px] text-slate-500 capitalize">{item.instructor_type.replace('_', ' ')}</p>}
        <div className="mt-3 flex items-center justify-center gap-4 text-[12px] text-slate-500">
          {item.course_count != null && <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {item.course_count} courses</span>}
          {item.student_count != null && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {(item.student_count).toLocaleString('en-IN')}+</span>}
        </div>
        {item.rating_average != null && (
          <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
            <Star className="w-4 h-4 fill-warn text-warn" /> {Number(item.rating_average).toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Blog card variant ─────────────────────────────────────────────────

function BlogVariant({ item, index }: { item: BlogPost; index: number }) {
  const grad = THUMB_GRADIENTS[(index + 5) % THUMB_GRADIENTS.length];
  const author = item.users ? `${item.users.first_name} ${item.users.last_name}` : null;

  return (
    <Link href={`/blog/${item.slug}`} className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover">
      {item.featured_image_url ? (
        <div className="relative aspect-[16/10] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.featured_image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
          <TypeBadge type="blogs" />
        </div>
      ) : (
        <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <TypeBadge type="blogs" />
          <div className="absolute bottom-3 left-3">
            <Newspaper className="h-8 w-8 text-white/60" />
          </div>
        </div>
      )}
      <div className="p-5">
        <h3 className="heading text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors">{item.title}</h3>
        {item.excerpt && <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2">{item.excerpt}</p>}
        <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500 pt-3 border-t border-slate-100">
          <span>{author || 'Staff'}</span>
          <div className="flex items-center gap-3">
            {item.reading_time_min && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {item.reading_time_min} min</span>}
            {item.published_at && <span>{relativeDate(item.published_at)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Webinar card variant ──────────────────────────────────────────────

function WebinarVariant({ item, index }: { item: Webinar; index: number }) {
  const grad = THUMB_GRADIENTS[(index + 3) % THUMB_GRADIENTS.length];
  const instructor = item.users?.full_name;
  const date = item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover">
      {item.thumbnail_url ? (
        <div className="relative aspect-[16/10] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.thumbnail_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
          <TypeBadge type="webinars" />
        </div>
      ) : (
        <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <TypeBadge type="webinars" />
          <div className="absolute bottom-3 left-3"><Video className="h-8 w-8 text-white/60" /></div>
        </div>
      )}
      <div className="p-5">
        <h3 className="heading text-base font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
        <div className="mt-3 flex items-center gap-3 text-[12px] text-slate-500">
          {instructor && <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {instructor}</span>}
          {date && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {date}</span>}
          {item.duration_minutes && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {item.duration_minutes}m</span>}
        </div>
        {item.is_free && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-sm font-semibold text-emerald-600">Free</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live Session card variant ─────────────────────────────────────────

function LiveSessionVariant({ item, index }: { item: LiveSession; index: number }) {
  const grad = THUMB_GRADIENTS[(index + 6) % THUMB_GRADIENTS.length];
  const instructor = item.users ? `${item.users.first_name} ${item.users.last_name}` : null;
  const date = item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

  return (
    <div className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover">
      <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <TypeBadge type="live_sessions" />
        <div className="absolute bottom-3 left-3"><Radio className="h-6 w-6 text-white/70" /></div>
      </div>
      <div className="p-5">
        <h3 className="heading text-base font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
        {item.description && <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2">{item.description}</p>}
        <div className="mt-3 flex items-center gap-3 text-[12px] text-slate-500">
          {instructor && <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {instructor}</span>}
          {date && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {date}</span>}
          {item.duration_minutes && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {item.duration_minutes}m</span>}
        </div>
        {item.session_status && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-orange-600">
              {item.session_status.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Podcast card variant ──────────────────────────────────────────────

function PodcastVariant({ item, index }: { item: Podcast; index: number }) {
  const grad = THUMB_GRADIENTS[(index + 7) % THUMB_GRADIENTS.length];
  const host = item.users ? `${item.users.first_name} ${item.users.last_name}` : null;

  return (
    <Link href={`/podcasts/${item.slug || item.id}`} className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover">
      {item.thumbnail_url ? (
        <div className="relative aspect-[16/10] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.thumbnail_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
          <TypeBadge type="podcasts" />
        </div>
      ) : (
        <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <TypeBadge type="podcasts" />
          <div className="absolute bottom-3 left-3"><Mic className="h-8 w-8 text-white/60" /></div>
        </div>
      )}
      <div className="p-5">
        <h3 className="heading text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors">{item.title}</h3>
        {item.short_summary && <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2">{item.short_summary}</p>}
        <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500 pt-3 border-t border-slate-100">
          <span>{host || 'Staff'}</span>
          <div className="flex items-center gap-2">
            {item.episode_number != null && <span>Ep. {item.episode_number}</span>}
            {item.duration != null && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {Math.round(item.duration / 60)}m</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main ContentCard component ────────────────────────────────────────

interface Props {
  item: UnifiedItem;
  index?: number;
}

export function ContentCard({ item, index = 0 }: Props) {
  switch (item.type) {
    case 'courses':
      return <CourseVariant item={item.data as CourseListItem} index={index} />;
    case 'bundles':
      return <BundleVariant item={item.data as BundleListItem} index={index} />;
    case 'batches':
      return <BatchVariant item={item.data as CourseBatch} index={index} />;
    case 'instructors':
      return <InstructorVariant item={item.data as InstructorProfile} />;
    case 'blogs':
      return <BlogVariant item={item.data as BlogPost} index={index} />;
    case 'webinars':
      return <WebinarVariant item={item.data as Webinar} index={index} />;
    case 'live_sessions':
    case 'live_classes':
      return <LiveSessionVariant item={item.data as LiveSession} index={index} />;
    case 'podcasts':
      return <PodcastVariant item={item.data as Podcast} index={index} />;
    default:
      return null;
  }
}
