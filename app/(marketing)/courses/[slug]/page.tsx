import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Star, Users, Clock, PlayCircle, BookOpen, CheckCircle2, Award,
  BadgeCheck, Globe, ChevronRight, Heart, ShoppingCart,
  Briefcase, AlertCircle, Share2, ShieldCheck, Flame,
  FileText, BarChart3,
} from 'lucide-react';
import { ButtonLink, Button } from '@/components/ui/Button';
import { EnrollButton } from '@/components/commerce/EnrollButton';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { CoursePromo } from '@/components/commerce/CoursePromo';
import { CourseDetailTabs } from '@/components/course/CourseDetailTabs';
import { CurriculumAccordion } from '@/components/course/CurriculumAccordion';
import { Reviews } from '@/components/reviews/Reviews';
import { CourseCertificatePreview } from '@/components/course/CourseCertificatePreview';
import { FAQ } from '@/components/home/FAQ';
import { api } from '@/lib/api';
import { metaFromTranslation, SITE } from '@/lib/seo';
import { TrailerPlayButton } from '@/components/course/TrailerPlayButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { courseLd, breadcrumbLd } from '@/lib/jsonld';
import { ShareBar } from '@/components/ui/ShareBar';

export const revalidate = 60; // SEO fix: og/meta changes propagate within a minute

/* ─── helpers ──────────────────────────────────────────────────────────── */

/** Extract string items from a JSONB array that may be string[] or {label}[]. */
function toStrings(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => (typeof v === 'string' ? v : v?.label ?? v?.title ?? v?.text ?? v?.name ?? ''))
    .filter(Boolean);
}

/**
 * Defensive fix for corrupted JSONB list data. Some `what_you_will_learn` /
 * `skills_gain` rows were comma-split *inside* parentheses at generation time,
 * e.g. ["… models (IaaS", "PaaS", "SaaS)"] which renders as 3 broken bullets.
 * This stitches fragments back together until parentheses balance.
 * (Render-only stopgap — the real fix is a DB backfill.)
 */
function mergeParenFragments(items: string[]): string[] {
  const out: string[] = [];
  let buf = '';
  for (const raw of items) {
    const piece = String(raw).trim();
    buf = buf ? `${buf}, ${piece}` : piece;
    const opens = (buf.match(/\(/g) || []).length;
    const closes = (buf.match(/\)/g) || []).length;
    if (opens <= closes) {
      out.push(buf);
      buf = '';
    }
  }
  if (buf) out.push(buf);
  return out;
}

/** toStrings + paren-fragment repair, for the two known-corrupted fields. */
function toBullets(arr: unknown): string[] {
  return mergeParenFragments(toStrings(arr));
}

function discountPct(original?: number | null, current?: number | null): number | null {
  if (!original || !current || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

function formatPrice(amount?: number | null, isFree?: boolean): string {
  if (isFree) return 'Free';
  if (amount == null) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function initials(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ─── SEO ──────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await api.courseBySlug(slug);
  if (!course) return { title: 'Course Not Found' };

  const t = course.translation;
  const thumb = t?.web_thumbnail || course.trailer_thumbnail_url || null;
  return metaFromTranslation(t, {
    title: t?.title || course.name || 'Course',
    description: t?.short_intro || t?.long_intro || '',
    path: `/courses/${slug}`,
    image: thumb,
    type: 'article',
  });
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await api.courseBySlug(slug);
  if (!course) return notFound();

  const t = course.translation;
  const title = t?.title || course.name || 'Untitled Course';
  const subtitle = t?.short_intro || t?.long_intro || '';
  const thumbnail = t?.web_thumbnail || course.trailer_thumbnail_url || null;
  const instructor = course.instructor;
  const instrName = instructor?.full_name ?? '';
  const instrInitials = initials(instrName);
  const categoryName = course.category?.category_name || '';
  const level = course.difficulty_level || '';
  const langName = course.language_name || '';
  const langNativeName = course.language_native_name || '';

  // Translation arrays (toBullets repairs the comma-split-in-parens corruption)
  const whatYoullLearn = toBullets(t?.what_you_will_learn);
  const prerequisites = toStrings(t?.prerequisites);
  const courseIncludes = toStrings(t?.course_includes);
  const courseIsFor = toStrings(t?.course_is_for);
  const skillsGain = toBullets(t?.skills_gain);
  const careerDesignations = toStrings(t?.apply_for_designations);

  // Stats
  const rating = course.rating_average ?? null;
  const ratingCount = course.rating_count ?? 0;
  const enrolled = course.enrollment_count ?? 0;
  const durationHours = course.duration_hours ?? null;
  const hasCert = course.has_certificate ?? false;
  const hasPlacement = course.has_placement_assistance ?? false;
  const refundDays = course.refund_days ?? null;

  // Pricing
  const price = course.price;
  const originalPrice = course.original_price;
  const discount = course.discount_percentage ?? discountPct(originalPrice, price);
  const isFree = course.is_free ?? false;

  // Curriculum, reviews, FAQs, related courses
  const curriculum = course.curriculum || [];
  const counts = course.curriculum_counts || { modules: 0, chapters: 0, topics: 0, subtopics: 0 };
  const faqs = course.faqs || [];
  const reviews = course.reviews || [];
  const reviewSummary = course.review_summary || { average: 0, total: 0, breakdown: {} };
  const relatedCourses = course.related_courses || [];

  // Badges
  const isBestseller = course.is_bestseller ?? false;
  const isNew = course.is_new ?? false;

  // Icon map for course-includes
  const INCLUDE_ICONS = [PlayCircle, BookOpen, Award, Globe, CheckCircle2];

  /* Reusable eyebrow label */
  const eyebrow = (label: string) => (
    <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-sky-600 mb-2">
      <span className="w-7 h-0.5 rounded-full bg-sky-400" />{label}
    </span>
  );

  /* ── Tab panels (Curriculum · Reviews · FAQ) ── */
  const curriculumPanel = (
    <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
      <h2 className="heading text-2xl sm:text-3xl text-slate-900">Course Curriculum</h2>
      {(counts.modules > 0 || counts.chapters > 0) && (
        <p className="mt-2 text-sm text-slate-500">
          {counts.modules} module{counts.modules !== 1 ? 's' : ''}
          {' · '}
          {counts.chapters} chapter{counts.chapters !== 1 ? 's' : ''}
          {' · '}
          {counts.topics} topic{counts.topics !== 1 ? 's' : ''}
          {counts.subtopics > 0 && ` · ${counts.subtopics} sub-topic${counts.subtopics !== 1 ? 's' : ''}`}
        </p>
      )}
      <div className="mt-6">
        <CurriculumAccordion modules={curriculum} />
      </div>
    </div>
  );

  const reviewsPanel = (
    <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="heading text-2xl sm:text-3xl text-slate-900">Student Reviews</h2>
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-4 w-4 ${s <= Math.round(reviewSummary.average) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
          ))}
          <span className="font-semibold text-slate-800 ml-0.5">{reviewSummary.average.toFixed(1)}</span>
          <span className="text-slate-400">({reviewSummary.total} review{reviewSummary.total !== 1 ? 's' : ''})</span>
        </span>
      </div>
      <Reviews itemType="course" itemId={course.id} initialReviews={reviews} initialSummary={reviewSummary} noun="course" />
    </div>
  );

  const faqPanel = (
    <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
      <h2 className="heading text-2xl sm:text-3xl text-slate-900 mb-6">Frequently Asked Questions</h2>
      {faqs.length > 0 ? (
        <FAQ items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} inline />
      ) : (
        <p className="text-sm text-slate-400">No FAQs for this course yet.</p>
      )}
    </div>
  );

  return (
    <div className="bg-sky-50 min-h-screen">
      <JsonLd data={course.translation?.structured_data || courseLd({ name: title, description: subtitle, url: `/courses/${slug}`, image: thumbnail, rating, ratingCount, price, isFree })} />
      <JsonLd data={breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'Courses', url: '/courses' }, { name: title, url: `/courses/${slug}` }])} />
      {/* ═══════════════════ TWO-COLUMN BODY (sticky sidebar) ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/courses" className="hover:text-brand-700 transition-colors">Courses</Link>
          {categoryName && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{categoryName}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[200px] text-slate-700 font-medium">{title}</span>
        </nav>

        <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start pb-12">
          {/* ════════ LEFT COLUMN — hero + all sections ════════ */}
          <div className="min-w-0 space-y-6 lg:space-y-8">
            {/* ── Hero intro ── */}
            <div>
              {/* Badges */}
              {(isBestseller || isNew || langNativeName || level) && (
                <div className="flex flex-wrap items-center gap-2">
                  {isBestseller && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-full px-2.5 py-1 border border-amber-200">
                      <Flame className="h-3 w-3" /> Bestseller
                    </span>
                  )}
                  {isNew && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 border border-emerald-200">
                      <BadgeCheck className="h-3 w-3" /> New
                    </span>
                  )}
                  {langNativeName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 border border-brand-200">
                      <Globe className="h-3 w-3" /> {langNativeName}
                    </span>
                  )}
                  {level && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                      {level}
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="mt-4 heading text-3xl sm:text-4xl text-slate-900 leading-[1.1] tracking-tight">
                {t?.tagline ? (
                  <>{title} — <span className="text-gradient">{t.tagline}</span></>
                ) : (
                  title
                )}
              </h1>

              {subtitle && (
                <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">{subtitle}</p>
              )}

              <ShareBar url={`/courses/${slug}`} title={title} className="mt-4" />

              {/* Stats row */}
              <div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-5 text-sm text-slate-600">
                {rating != null && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                    <Star className="h-4 w-4 fill-warn text-warn" /> {rating.toFixed(1)}
                    {ratingCount > 0 && (
                      <span className="font-normal text-slate-500">
                        ({ratingCount.toLocaleString('en-IN')} reviews)
                      </span>
                    )}
                  </span>
                )}
                {enrolled > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-400" /> {enrolled.toLocaleString('en-IN')} enrolled
                  </span>
                )}
                {durationHours != null && durationHours > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" /> {durationHours}h total
                  </span>
                )}
                {langName && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-slate-400" /> {langName}
                  </span>
                )}
              </div>

              {/* Instructor */}
              {instrName && (
                <div className="mt-6 flex items-center gap-3">
                  {instructor?.profile_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={instructor.profile_image_url} alt={instrName} className="h-11 w-11 rounded-full object-cover shadow-btn" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading flex items-center justify-center shadow-btn">
                      {instrInitials}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{instrName}</div>
                    {instructor?.designation && (
                      <div className="text-[11px] text-slate-500">{instructor.designation}</div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* ── What you'll learn (compact single-column list) ── */}
            {whatYoullLearn.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
                {eyebrow("What you'll learn")}
                <h2 className="heading text-2xl sm:text-3xl text-slate-900">What you&apos;ll learn</h2>
                <ul className="mt-6 space-y-3">
                  {whatYoullLearn.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Certificate preview ── */}
            {hasCert && (
              <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
                {eyebrow('Certificate')}
                <CourseCertificatePreview courseName={title} moduleCount={counts.modules} />
              </div>
            )}

            {/* ── Prerequisites ── */}
            {prerequisites.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
                {eyebrow('Prerequisites')}
                <h2 className="heading text-2xl sm:text-3xl text-slate-900">Prerequisites</h2>
                <ul className="mt-6 space-y-3">
                  {prerequisites.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                      <AlertCircle className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Who this is for ── */}
            {courseIsFor.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
                {eyebrow('Who is it for')}
                <h2 className="heading text-2xl sm:text-3xl text-slate-900">Who this course is for</h2>
                <ul className="mt-6 space-y-3">
                  {courseIsFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Skills ── */}
            {skillsGain.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
                {eyebrow('Skills')}
                <h2 className="heading text-2xl sm:text-3xl text-slate-900">Skills you&apos;ll gain</h2>
                <ul className="mt-6 space-y-3">
                  {skillsGain.map((skill, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── About the instructor ── */}
            {instructor && (
              <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
                {eyebrow('Instructor')}
                <h2 className="heading text-2xl sm:text-3xl text-slate-900">About the instructor</h2>
                <div className="mt-6 flex flex-col sm:flex-row items-start gap-6">
                  {instructor.profile_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={instructor.profile_image_url} alt={instrName} className="h-24 w-24 rounded-full object-cover shadow-cardHover shrink-0" />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-3xl flex items-center justify-center shadow-cardHover shrink-0">
                      {instrInitials}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="heading text-xl text-slate-900">{instrName}</h3>
                    {instructor.designation && (
                      <p className="text-sm text-brand-700 font-semibold mt-0.5">{instructor.designation}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      {instructor.rating_average != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-warn text-warn" /> {instructor.rating_average.toFixed(1)} rating
                        </span>
                      )}
                      {instructor.total_students != null && instructor.total_students > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-4 w-4" /> {instructor.total_students.toLocaleString('en-IN')} students
                        </span>
                      )}
                      {instructor.total_courses != null && instructor.total_courses > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <PlayCircle className="h-4 w-4" /> {instructor.total_courses} courses
                        </span>
                      )}
                      {instructor.years_experience != null && instructor.years_experience > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <Award className="h-4 w-4" /> {instructor.years_experience} years exp.
                        </span>
                      )}
                    </div>
                    {instructor.bio && (
                      <p className="mt-4 text-sm text-slate-600 leading-relaxed">{instructor.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Career outcomes ── */}
            {careerDesignations.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-[rgba(99,102,241,0.03)] border border-sky-100 p-7 sm:p-8">
                {eyebrow('Career')}
                <h2 className="heading text-2xl sm:text-3xl text-slate-900">Career outcomes</h2>
                <p className="mt-2 text-sm text-slate-500">Roles our graduates land after completing this course</p>
                <ul className="mt-6 space-y-3">
                  {careerDesignations.map((role, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
                      <Briefcase className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Tabbed: Curriculum · Reviews · FAQ ── */}
            <CourseDetailTabs curriculum={curriculumPanel} reviews={reviewsPanel} faq={faqPanel} />
          </div>

          {/* ════════ RIGHT COLUMN — sticky purchase card ════════ */}
          <aside className="order-first lg:order-none lg:sticky lg:top-28 self-start">
            <div className="relative rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
              {/* Thumbnail */}
              {thumbnail ? (
                <div className="aspect-video relative bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                  {course.trailer_video_url && (
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
                      <TrailerPlayButton
                        courseId={course.id}
                        hasTrailer
                        className="relative h-16 w-16 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-cardHover hover:scale-105 transition-transform"
                      />
                      <span className="text-white text-sm font-medium drop-shadow-md">Preview this course</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video relative bg-gradient-to-br from-sky-800 via-sky-900 to-indigo-800 flex flex-col items-center justify-center gap-2">
                  {course.trailer_video_url ? (
                    <>
                      <TrailerPlayButton
                        courseId={course.id}
                        hasTrailer
                        className="relative h-16 w-16 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-cardHover hover:scale-105 transition-transform"
                      />
                      <span className="text-white text-sm font-medium drop-shadow-md">Preview this course</span>
                    </>
                  ) : (
                    <>
                      <span className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center"><PlayCircle className="h-8 w-8 text-white/70" /></span>
                      <span className="text-white/80 text-sm font-medium drop-shadow-md">{title}</span>
                    </>
                  )}
                </div>
              )}

              <div className="p-5">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="heading text-3xl text-slate-900">{formatPrice(price, isFree)}</span>
                  {!isFree && originalPrice != null && originalPrice > (price ?? 0) && (
                    <span className="text-sm text-slate-400 line-through">{formatPrice(originalPrice)}</span>
                  )}
                  {discount != null && discount > 0 && (
                    <span className="ml-auto text-[11px] font-bold bg-success/15 text-success rounded-full px-2 py-0.5">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {!isFree && <div className="mt-3"><CoursePromo courseId={course.id} /></div>}

                {/* Actions */}
                <div className="mt-4 space-y-2.5">
                  <EnrollButton
                    itemType="course"
                    itemId={course.id}
                    isFree={!!course.is_free}
                    item={{ title: course.name || undefined, price: course.price, original_price: course.original_price, is_free: !!course.is_free, thumbnail_url: course.trailer_thumbnail_url, slug: course.slug }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white text-base font-semibold py-3 shadow-btn hover:from-brand-700 hover:to-brand-600 active:scale-[0.99] transition-all disabled:opacity-70"
                  />
                  <WishlistButton itemType="course" itemId={course.id} variant="full" />
                </div>

                {/* Course includes */}
                {courseIncludes.length > 0 && (
                  <ul className="mt-5 space-y-2.5 pt-5 border-t border-slate-100">
                    {courseIncludes.map((item, i) => {
                      const Icon = INCLUDE_ICONS[i % INCLUDE_ICONS.length];
                      return (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <Icon className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" /> {item}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Refund guarantee */}
                {refundDays != null && refundDays > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-emerald-800">
                          {refundDays}-Day Money-Back Guarantee
                        </div>
                        <div className="text-[11px] text-emerald-600 mt-0.5">
                          Full refund if you&apos;re not satisfied
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feature badges */}
                {(hasCert || hasPlacement) && (
                  <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {hasCert && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-50 text-brand-700 rounded-full px-2.5 py-1">
                        <Award className="h-3 w-3" /> Certificate
                      </span>
                    )}
                    {hasPlacement && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-success/10 text-success rounded-full px-2.5 py-1">
                        <Briefcase className="h-3 w-3" /> Placement assist
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ═══════════════════ RELATED COURSES (full width) ═══════════════════ */}
      {relatedCourses.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-sky-600 mb-2"><span className="w-7 h-0.5 rounded-full bg-sky-400" />You might also like</span>
            <h2 className="mt-2 heading text-2xl sm:text-3xl text-slate-900">Related Courses</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.slice(0, 6).map((rc, idx) => {
                const GRADS = [
                  'from-brand-800 via-brand-700 to-brand-500',
                  'from-emerald-800 via-emerald-700 to-emerald-500',
                  'from-violet-800 via-violet-700 to-rose-500',
                  'from-rose-700 via-rose-500 to-amber-500',
                  'from-slate-900 via-brand-800 to-brand-600',
                  'from-amber-700 via-orange-600 to-rose-500',
                ];
                const grad = GRADS[idx % GRADS.length];
                const rcCat = rc.category_name || categoryName || '';
                const rcOriginal = rc.original_price;
                const rcPrice = rc.price;
                const rcDifficulty = rc.difficulty_level ? rc.difficulty_level.replace('_', ' ') : '';

                return (
                  <Link
                    key={rc.id}
                    href={`/courses/${rc.slug}`}
                    className="group block rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_64px_rgba(14,165,233,0.1)] hover:border-sky-200"
                  >
                    {/* Gradient thumbnail area with price badge */}
                    <div className={`relative aspect-[16/9] bg-gradient-to-br ${grad}`}>
                      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_55%)]" />
                      <div aria-hidden className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/8 blur-3xl" />

                      {/* Price badge — bottom right */}
                      {(rcPrice != null || rc.is_free) && (
                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                          {rc.is_free ? (
                            <span className="text-sm font-bold text-emerald-600">Free</span>
                          ) : (
                            <span className="text-sm font-bold text-slate-800">
                              {rcOriginal != null && rcOriginal > (rcPrice ?? 0) && (
                                <span className="text-slate-400 line-through font-normal mr-1.5">{formatPrice(rcOriginal)}</span>
                              )}
                              {formatPrice(rcPrice)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4 sm:p-5">
                      {/* Category label */}
                      {rcCat && (
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-600">
                          {rcCat}
                        </span>
                      )}

                      {/* Title */}
                      <h3 className="mt-1.5 heading text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors">
                        {rc.translated_title || rc.name}
                      </h3>

                      {/* Description */}
                      {rc.short_description && (
                        <p className="mt-2 text-[13px] text-slate-500 line-clamp-2 leading-relaxed">{rc.short_description}</p>
                      )}

                      {/* Stats row: modules + subtopics */}
                      {(rc.module_count != null && rc.module_count > 0) && (
                        <div className="mt-3 flex items-center gap-4 text-[12px] text-slate-500 pt-3 border-t border-slate-100">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-brand-500" /> {rc.module_count} Module{rc.module_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {/* Rating + difficulty row */}
                      {(rc.rating_average != null || rcDifficulty) && (
                        <div className="mt-2 flex items-center gap-4 text-[12px] text-slate-500">
                          {rc.rating_average != null && (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                              <Star className="w-3.5 h-3.5 fill-warn text-warn" /> {Number(rc.rating_average).toFixed(1)}
                            </span>
                          )}
                          {rcDifficulty && (
                            <span className="inline-flex items-center gap-1 capitalize">
                              <BarChart3 className="w-3.5 h-3.5 text-slate-400" /> {rcDifficulty}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ BOTTOM CTA (full width) ═══════════════════ */}
      <section className="py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-sky-500 via-sky-700 to-indigo-600 p-10 sm:p-14 text-center shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_55%)]" />
            <div className="relative z-10">
              <BadgeCheck className="h-10 w-10 text-white/90 mx-auto" />
              <h2 className="mt-4 heading text-3xl sm:text-4xl text-white">
                {isFree ? 'Start learning for free' : `Start Your ${categoryName || 'Learning'} Journey Today`}
              </h2>
              <p className="mt-3 text-sky-100">
                {[
                  durationHours ? `${durationHours}h of content` : '',
                  counts.modules > 0 ? `${counts.modules} modules` : '',
                  hasCert ? 'Verified certificate' : '',
                  hasPlacement ? 'Placement assistance' : '',
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Lifetime access'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <ButtonLink href="#" variant="primary" size="lg" className="rounded-full bg-white text-sky-700 hover:bg-sky-50 border-0 shadow-lg">Enroll Now</ButtonLink>
                <ButtonLink href="/courses" variant="outline" size="lg" className="rounded-full border-white/30 text-white hover:bg-white/10">Browse more</ButtonLink>
              </div>
              <p className="mt-4 text-sm text-sky-200">
                Need guidance?{' '}
                <Link href="/contact" className="text-white font-medium underline underline-offset-4">
                  Request a callback
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
