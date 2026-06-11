import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Users, Clock, Calendar, Star, CheckCircle2, ShoppingCart,
  Heart, ChevronRight, Award, Globe, PlayCircle, BookOpen,
  Video, ExternalLink,
} from 'lucide-react';
import { ButtonLink, Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reviews } from '@/components/reviews/Reviews';
import { api, type BatchDetail } from '@/lib/api';
import { JsonLd } from '@/components/seo/JsonLd';
import { eventLd, breadcrumbLd } from '@/lib/jsonld';

export const revalidate = 300;

// ─── helpers ────────────────────────────────────────────────────────────

function formatPrice(amount?: number | null, isFree?: boolean): string {
  if (isFree) return 'Free';
  if (amount == null) return '';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function initials(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── SEO ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const batch = await api.batchBySlug(slug);
  if (!batch) return { title: 'Batch Not Found' };

  const t = batch.translation;
  return {
    title: t?.meta_title || t?.title || batch.title || 'Batch',
    description: t?.meta_description || t?.short_description || '',
    openGraph: {
      title: t?.og_title || t?.meta_title || t?.title || '',
      description: t?.og_description || t?.meta_description || '',
      images: t?.og_image ? [{ url: t.og_image }] : [],
      url: t?.og_url || undefined,
      siteName: t?.og_site_name || 'Grow Up More',
      type: (t?.og_type as 'website' | 'article') || 'website',
    },
    twitter: {
      card: (t?.twitter_card as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: t?.twitter_title || t?.meta_title || t?.title || '',
      description: t?.twitter_description || t?.meta_description || '',
      images: t?.twitter_image ? [t.twitter_image] : [],
      site: t?.twitter_site || undefined,
    },
    robots: t?.robots_directive || undefined,
    alternates: t?.canonical_url ? { canonical: t.canonical_url } : undefined,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────

export default async function BatchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const batch = await api.batchBySlug(slug);
  if (!batch) return notFound();

  const t = batch.translation;
  const title = t?.title || batch.title || 'Untitled Batch';
  const description = t?.description || t?.short_description || '';
  const thumbnail = t?.thumbnail_url || batch.courses?.trailer_thumbnail_url || null;
  const instructor = batch.instructor;
  const instrName = instructor?.full_name ?? '';
  const instrInitials = initials(instrName);

  // Parent course info
  const parentCourse = batch.courses;
  const parentCourseTitle = batch.course_translation?.title || parentCourse?.name || '';
  const parentCourseSlug = parentCourse?.slug || '';

  const maxStudents = batch.max_students ?? null;
  const enrolled = batch.enrolled_count ?? 0;
  const isFree = batch.is_free ?? false;
  const price = batch.price;
  const startDate = batch.start_date;
  const endDate = batch.end_date;
  const status = batch.batch_status || '';

  const spotsLeft = maxStudents != null ? Math.max(0, maxStudents - enrolled) : null;

  // Extra detail from batch_translations (previously stored but never shown):
  // what_you_learn / requirements are comma-separated text; tags is a JSON array.
  const splitList = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String).filter(Boolean)
    : typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const whatYouLearn = splitList(t?.what_you_learn);
  const requirements = splitList(t?.requirements);
  const batchTags = splitList(t?.tags);

  return (
    <>
      <JsonLd data={batch.translation?.structured_data || eventLd({ name: title, description, url: `/batches/${slug}`, image: thumbnail, startDate: startDate, isFree, price })} />
      <JsonLd data={breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'Courses', url: '/courses' }, { name: title, url: `/batches/${slug}` }])} />
      {/* Hero */}
      <section className="pt-10 sm:pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/courses" className="hover:text-brand-700">Courses</Link>
            <ChevronRight className="h-3 w-3" />
            {parentCourseSlug && (
              <>
                <Link href={`/courses/${parentCourseSlug}`} className="hover:text-brand-700 truncate max-w-[120px]">
                  {parentCourseTitle}
                </Link>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <span className="truncate max-w-[200px]">{title}</span>
          </div>

          {/* Course-detail frame: [content | 380px sticky sidebar] */}
          <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
            <div className="min-w-0">
              <Eyebrow>
                Batch
                {status && ` · ${status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`}
              </Eyebrow>

              <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                {title}
              </h1>

              {parentCourseTitle && (
                <p className="mt-2 text-sm text-brand-600 font-semibold">
                  Part of{' '}
                  {parentCourseSlug ? (
                    <Link href={`/courses/${parentCourseSlug}`} className="underline hover:text-brand-800">
                      {parentCourseTitle}
                    </Link>
                  ) : (
                    parentCourseTitle
                  )}
                </p>
              )}

              {description && (
                <p className="mt-4 text-slate-600 max-w-2xl">{description}</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                {startDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(startDate)}
                    {endDate && ` – ${formatDate(endDate)}`}
                  </span>
                )}
                {enrolled > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {enrolled} enrolled
                  </span>
                )}
                {maxStudents != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> Max {maxStudents} seats
                  </span>
                )}
                {batch.meeting_platform && (
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="h-4 w-4" /> {batch.meeting_platform}
                  </span>
                )}
              </div>

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

              {/* What you'll learn — from batch_translations.what_you_learn (comma-separated) */}
              {whatYouLearn.length > 0 && (
                <div className="mt-8">
                  <h2 className="heading text-2xl text-slate-900">What you&rsquo;ll learn</h2>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {whatYouLearn.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements — from batch_translations.requirements (comma-separated) */}
              {requirements.length > 0 && (
                <div className="mt-8">
                  <h2 className="heading text-2xl text-slate-900">Requirements</h2>
                  <ul className="mt-4 space-y-2">
                    {requirements.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags — from batch_translations.tags */}
              {batchTags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-1.5">
                  {batchTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-50 text-brand-700 text-[11.5px] font-semibold px-2.5 py-1">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase card */}
            <Reveal>
              <div className="relative rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden lg:sticky lg:top-28 self-start">
                {thumbnail ? (
                  <div className="aspect-video relative bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-white/60" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-baseline gap-2">
                    <span className="heading text-3xl text-slate-900">{formatPrice(price, isFree)}</span>
                  </div>

                  {spotsLeft != null && spotsLeft > 0 && spotsLeft <= 20 && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold">
                      Only {spotsLeft} seat{spotsLeft !== 1 ? 's' : ''} left!
                    </p>
                  )}

                  <div className="mt-4 space-y-2.5">
                    <Button variant="primary" className="w-full rounded-full">
                      <ShoppingCart className="h-4 w-4" /> Enroll in batch
                    </Button>
                    <Button variant="outline" className="w-full rounded-full">
                      <Heart className="h-4 w-4" /> Save to wishlist
                    </Button>
                  </div>

                  <ul className="mt-5 space-y-2.5 pt-5 border-t border-slate-100">
                    {startDate && (
                      <li className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Calendar className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                        Starts {formatDate(startDate)}
                      </li>
                    )}
                    {maxStudents != null && (
                      <li className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Users className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                        Limited to {maxStudents} students
                      </li>
                    )}
                    {batch.meeting_platform && (
                      <li className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Video className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                        Live on {batch.meeting_platform}
                      </li>
                    )}
                    {instrName && (
                      <li className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Award className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                        Taught by {instrName}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Instructor detail */}
      {instructor && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="heading text-2xl sm:text-3xl text-slate-900">About the instructor</h2>
            <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card p-6 flex flex-col sm:flex-row items-start gap-6">
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
        </section>
      )}

      {/* Parent course link */}
      {parentCourseSlug && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="heading text-2xl sm:text-3xl text-slate-900">Parent course</h2>
            <div className="mt-6">
              <Link
                href={`/courses/${parentCourseSlug}`}
                className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-0.5 hover:shadow-cardHover transition-all max-w-md"
              >
                {(batch.course_translation?.web_thumbnail || parentCourse?.trailer_thumbnail_url) ? (
                  <div className="aspect-video relative bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={(batch.course_translation?.web_thumbnail || parentCourse?.trailer_thumbnail_url)!}
                      alt={parentCourseTitle}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-brand-600 to-violet-500 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-white/60" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="heading text-base text-slate-900 group-hover:text-brand-700 transition-colors">
                    {parentCourseTitle}
                  </h3>
                  <p className="mt-1 text-sm text-brand-600 inline-flex items-center gap-1">
                    View full course <ExternalLink className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reviews itemType="batch" itemId={batch.id} noun="batch" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <Award className="h-10 w-10 text-brand-600 mx-auto" />
          <h2 className="mt-4 heading text-3xl sm:text-4xl text-slate-900">
            Secure your spot in this batch
          </h2>
          <p className="mt-3 text-slate-600">
            {[
              startDate ? `Starting ${formatDate(startDate)}` : '',
              maxStudents ? `${maxStudents} seats` : '',
              instrName ? `with ${instrName}` : '',
            ]
              .filter(Boolean)
              .join(' · ') || 'Enroll today'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <ButtonLink href="#" variant="primary" size="lg" className="rounded-full">Enroll Now</ButtonLink>
            <ButtonLink href="/courses" variant="outline" size="lg" className="rounded-full">Browse courses</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
