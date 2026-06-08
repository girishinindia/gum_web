import Link from 'next/link';
import {
  Star, BookOpen, ArrowRight, Layers, Users, Calendar, Clock,
  Mic, Video, Radio, Newspaper, GraduationCap, User, FileText,
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

const TYPE_META: Record<ContentType, {
  label: string;
  badgeBg: string;
  badgeText: string;
  categoryColor: string;
  ctaLabel: string;
  icon: React.ElementType;
}> = {
  courses:       { label: 'Course',       badgeBg: 'bg-violet-600', badgeText: 'text-white', categoryColor: 'text-brand-600', ctaLabel: 'View Course',  icon: FileText },
  bundles:       { label: 'Bundle',       badgeBg: 'bg-violet-600', badgeText: 'text-white', categoryColor: 'text-violet-600', ctaLabel: 'View Bundle',  icon: Layers },
  batches:       { label: 'Batch',        badgeBg: 'bg-amber-500',  badgeText: 'text-white', categoryColor: 'text-amber-600',  ctaLabel: 'View Batch',   icon: Users },
  instructors:   { label: 'Instructor',   badgeBg: 'bg-emerald-600', badgeText: 'text-white', categoryColor: 'text-emerald-600', ctaLabel: 'View Profile', icon: GraduationCap },
  blogs:         { label: 'Blog',         badgeBg: 'bg-rose-500',   badgeText: 'text-white', categoryColor: 'text-rose-600',   ctaLabel: 'Read More',    icon: Newspaper },
  webinars:      { label: 'Webinar',      badgeBg: 'bg-sky-500',    badgeText: 'text-white', categoryColor: 'text-sky-600',    ctaLabel: 'View Webinar', icon: Video },
  live_sessions: { label: 'Live Session', badgeBg: 'bg-orange-500', badgeText: 'text-white', categoryColor: 'text-orange-600', ctaLabel: 'View Session', icon: Radio },
  podcasts:      { label: 'Podcast',      badgeBg: 'bg-fuchsia-600', badgeText: 'text-white', categoryColor: 'text-fuchsia-600', ctaLabel: 'Listen Now',  icon: Mic },
  live_classes:  { label: 'Live Class',   badgeBg: 'bg-teal-500',   badgeText: 'text-white', categoryColor: 'text-teal-600',   ctaLabel: 'View Class',   icon: Radio },
};

// ─── Gradient pool ────────────────────────────────────────────────────

const GRADIENTS = [
  'from-[#1a2a4a] via-[#1e3a5f] to-[#2a4a6a]',
  'from-[#1a2a3a] via-[#253d52] to-[#2e5268]',
  'from-[#162635] via-[#1c3448] to-[#26455c]',
  'from-[#1b2d42] via-[#233e56] to-[#2d506c]',
  'from-[#1e2d3d] via-[#273c50] to-[#304c64]',
  'from-[#192838] via-[#21374d] to-[#2b4862]',
  'from-[#1c2e44] via-[#253f58] to-[#2f516e]',
  'from-[#172636] via-[#1f354a] to-[#294660]',
  'from-[#1a2b40] via-[#233c54] to-[#2d4e6a]',
];

// ─── Unified item type ─────────────────────────────────────────────────

export interface UnifiedItem {
  type: ContentType;
  id: number;
  data: CourseListItem | BundleListItem | CourseBatch | InstructorProfile | BlogPost | Webinar | LiveSession | Podcast;
}

// ─── Helpers ──────────────────────────────────────────────────────────

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

// ─── Unified card shape — every variant populates these ────────────────

interface CardData {
  type: ContentType;
  href?: string;
  badge: string;
  thumbnailUrl?: string | null;
  category: string;
  title: string;
  description?: string | null;
  stats: { icon: React.ElementType; label: string }[];
  price?: string | null;
  originalPrice?: string | null;
  isFree?: boolean;
  rating?: number | null;
  extraInfo?: string | null;
}

// ─── Unified card renderer ─────────────────────────────────────────────

function UnifiedCard({ d, index }: { d: CardData; index: number }) {
  const meta = TYPE_META[d.type];
  const grad = GRADIENTS[index % GRADIENTS.length];
  const Icon = meta.icon;

  const card = (
    <div className="group flex flex-col rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover h-full">
      {/* ── Gradient thumbnail area ── */}
      {d.thumbnailUrl ? (
        <div className="relative aspect-[16/10] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.thumbnailUrl} alt={d.title} className="absolute inset-0 w-full h-full object-cover" />
          {/* Badge top-left */}
          <div className={cn('absolute top-3 left-3 z-10 rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider', meta.badgeBg, meta.badgeText)}>
            {d.badge}
          </div>
        </div>
      ) : (
        <div className={cn('relative aspect-[16/10] bg-gradient-to-br', grad)}>
          {/* Subtle overlay */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_55%)]" />
          {/* Badge top-left */}
          <div className={cn('absolute top-3 left-3 z-10 rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider', meta.badgeBg, meta.badgeText)}>
            {d.badge}
          </div>
          {/* Centered icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center">
              <Icon className="w-7 h-7 text-white/70" />
            </div>
          </div>
        </div>
      )}

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
        {/* Category label */}
        <p className={cn('text-[10px] font-bold uppercase tracking-[0.1em]', meta.categoryColor)}>
          {d.category}
        </p>

        {/* Title */}
        <h3 className="mt-1.5 text-[15px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-700 transition-colors">
          {d.title}
        </h3>

        {/* Description */}
        {d.description && (
          <p className="mt-1.5 text-[12.5px] text-slate-500 line-clamp-2 leading-relaxed">{d.description}</p>
        )}

        {/* Stats row */}
        {d.stats.length > 0 && (
          <div className="mt-3 flex items-center gap-4 text-[12px] text-slate-500">
            {d.stats.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <s.icon className="w-3.5 h-3.5 text-brand-500" />
                {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Spacer to push bottom section down */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="mt-3 border-t border-slate-100" />

        {/* Price / Rating / Extra info row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {d.isFree ? (
              <span className="text-lg font-extrabold text-slate-900">Free</span>
            ) : d.price ? (
              <>
                <span className="text-lg font-extrabold text-slate-900">{d.price}</span>
                {d.originalPrice && (
                  <span className="text-[12px] text-slate-400 line-through">{d.originalPrice}</span>
                )}
              </>
            ) : d.extraInfo ? (
              <span className="text-[12px] text-slate-500">{d.extraInfo}</span>
            ) : null}
          </div>
          {d.rating != null && (
            <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {Number(d.rating).toFixed(1)}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 group-hover:from-brand-700 group-hover:to-brand-600 group-hover:shadow-md">
          {meta.ctaLabel}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );

  // Wrap in Link if href is provided
  if (d.href) {
    return <Link href={d.href} className="block h-full">{card}</Link>;
  }
  return card;
}

// ─── Data extractors per type ──────────────────────────────────────────

function courseData(item: CourseListItem): CardData {
  const price = formatPrice(item.price);
  const originalPrice = formatPrice(item.original_price);
  return {
    type: 'courses',
    href: `/courses/${item.slug}`,
    badge: item.difficulty_level ? item.difficulty_level.replace('_', ' ') : 'Beginner',
    thumbnailUrl: null,
    category: item.category_name || 'Course',
    title: item.translated_title || item.name,
    description: item.translated_description || item.short_description,
    stats: [
      ...(item.total_lessons != null ? [{ icon: BookOpen, label: `${item.total_lessons} Lessons` }] : []),
      ...(item.total_assignments != null ? [{ icon: FileText, label: `${item.total_assignments} Topics` }] : []),
    ],
    price: item.is_free ? undefined : price,
    originalPrice: (item.is_free || !originalPrice || Number(item.original_price) <= Number(item.price)) ? undefined : originalPrice,
    isFree: !!item.is_free,
    rating: item.rating_average,
  };
}

function bundleData(item: BundleListItem): CardData {
  const price = formatPrice(item.price);
  const originalPrice = formatPrice(item.original_price);
  return {
    type: 'bundles',
    href: `/bundles/${item.slug}`,
    badge: 'Bundle',
    thumbnailUrl: null,
    category: 'Bundle',
    title: item.translated_title || item.name,
    description: item.translated_description || item.description,
    stats: [
      ...(item.course_count != null ? [{ icon: Layers, label: `${item.course_count} Courses` }] : []),
      ...(item.student_count != null ? [{ icon: Users, label: `${(item.student_count).toLocaleString('en-IN')}+ Students` }] : []),
    ],
    price,
    originalPrice: (originalPrice && Number(item.original_price) > Number(item.price)) ? originalPrice : undefined,
    isFree: false,
    rating: item.rating_average,
  };
}

function batchData(item: CourseBatch): CardData {
  const courseName = item.courses?.name || item.title || 'Batch';
  const courseSlug = item.courses?.slug;
  const instructorName = item.users?.full_name;
  const price = formatPrice(item.price);
  return {
    type: 'batches',
    href: courseSlug ? `/courses/${courseSlug}` : undefined,
    badge: item.batch_status ? item.batch_status.replace('_', ' ') : 'Batch',
    thumbnailUrl: null,
    category: 'Batch',
    title: item.translated_title || courseName,
    description: item.translated_description || (item.title && item.title !== courseName ? item.title : null),
    stats: [
      ...(instructorName ? [{ icon: User, label: instructorName }] : []),
      ...(item.max_students != null ? [{ icon: Users, label: `${item.enrolled_count ?? 0}/${item.max_students}` }] : []),
    ],
    price: item.is_free ? undefined : price,
    isFree: !!item.is_free,
    rating: null,
  };
}

function instructorData(item: InstructorProfile): CardData {
  const name = item.users?.full_name || 'Instructor';
  return {
    type: 'instructors',
    href: undefined,
    badge: item.instructor_type ? item.instructor_type.replace('_', ' ') : 'Instructor',
    thumbnailUrl: item.users?.avatar_url,
    category: 'Instructor',
    title: name,
    description: item.instructor_type ? `${item.instructor_type.replace('_', ' ')} instructor` : null,
    stats: [
      ...(item.course_count != null ? [{ icon: BookOpen, label: `${item.course_count} Courses` }] : []),
      ...(item.student_count != null ? [{ icon: Users, label: `${(item.student_count).toLocaleString('en-IN')}+ Students` }] : []),
    ],
    price: null,
    rating: item.rating_average,
  };
}

function blogData(item: BlogPost): CardData {
  const author = item.users ? `${item.users.first_name} ${item.users.last_name}` : 'Staff';
  return {
    type: 'blogs',
    href: `/blog/${item.slug}`,
    badge: 'Blog',
    thumbnailUrl: item.featured_image_url,
    category: 'Blog',
    title: item.title,
    description: item.excerpt,
    stats: [
      { icon: User, label: author },
      ...(item.reading_time_min ? [{ icon: Clock, label: `${item.reading_time_min} min read` }] : []),
    ],
    price: null,
    extraInfo: item.published_at ? relativeDate(item.published_at) : null,
    rating: null,
  };
}

function webinarData(item: Webinar): CardData {
  const instructor = item.users?.full_name;
  const date = item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  return {
    type: 'webinars',
    href: undefined,
    badge: 'Webinar',
    thumbnailUrl: item.thumbnail_url,
    category: 'Webinar',
    title: item.translated_title || item.title,
    description: item.translated_description || null,
    stats: [
      ...(instructor ? [{ icon: User, label: instructor }] : []),
      ...(date ? [{ icon: Calendar, label: date }] : []),
      ...(item.duration_minutes ? [{ icon: Clock, label: `${item.duration_minutes}m` }] : []),
    ],
    price: null,
    isFree: !!item.is_free,
    extraInfo: !item.is_free ? null : undefined,
    rating: null,
  };
}

function liveSessionData(item: LiveSession): CardData {
  const instructor = item.users ? `${item.users.first_name} ${item.users.last_name}` : null;
  const date = item.scheduled_at ? new Date(item.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;
  return {
    type: 'live_sessions',
    href: undefined,
    badge: item.session_status ? item.session_status.replace('_', ' ') : 'Live',
    thumbnailUrl: null,
    category: 'Live Session',
    title: item.title,
    description: item.description,
    stats: [
      ...(instructor ? [{ icon: User, label: instructor }] : []),
      ...(date ? [{ icon: Calendar, label: date }] : []),
      ...(item.duration_minutes ? [{ icon: Clock, label: `${item.duration_minutes}m` }] : []),
    ],
    price: null,
    rating: null,
  };
}

function podcastData(item: Podcast): CardData {
  const host = item.users ? `${item.users.first_name} ${item.users.last_name}` : 'Staff';
  return {
    type: 'podcasts',
    href: `/podcasts/${item.slug || item.id}`,
    badge: item.episode_number != null ? `Ep. ${item.episode_number}` : 'Podcast',
    thumbnailUrl: item.thumbnail_url,
    category: 'Podcast',
    title: item.title,
    description: item.short_summary,
    stats: [
      { icon: Mic, label: host },
      ...(item.duration != null ? [{ icon: Clock, label: `${Math.round(item.duration / 60)}m` }] : []),
    ],
    price: null,
    rating: null,
  };
}

// ─── Main ContentCard component ────────────────────────────────────────

interface Props {
  item: UnifiedItem;
  index?: number;
}

export function ContentCard({ item, index = 0 }: Props) {
  let d: CardData;
  switch (item.type) {
    case 'courses':
      d = courseData(item.data as CourseListItem); break;
    case 'bundles':
      d = bundleData(item.data as BundleListItem); break;
    case 'batches':
      d = batchData(item.data as CourseBatch); break;
    case 'instructors':
      d = instructorData(item.data as InstructorProfile); break;
    case 'blogs':
      d = blogData(item.data as BlogPost); break;
    case 'webinars':
      d = webinarData(item.data as Webinar); break;
    case 'live_sessions':
    case 'live_classes':
      d = liveSessionData(item.data as LiveSession); break;
    case 'podcasts':
      d = podcastData(item.data as Podcast); break;
    default:
      return null;
  }
  return <UnifiedCard d={d} index={index} />;
}
