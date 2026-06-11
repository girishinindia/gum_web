import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Layers, Users, Star, CheckCircle2, ShoppingCart, Heart,
  ChevronRight, Award, Sparkles, BadgeCheck, ShieldCheck, FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { CourseCard } from '@/components/ui/CourseCard';
import { Reviews } from '@/components/reviews/Reviews';
import { EnrollButton } from '@/components/commerce/EnrollButton';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { api, type BundleDetail } from '@/lib/api';
import { JsonLd } from '@/components/seo/JsonLd';
import { productLd, breadcrumbLd } from '@/lib/jsonld';

export const revalidate = 60; // SEO fix: og/meta changes propagate within a minute

// ─── helpers ────────────────────────────────────────────────────────────

function toStrings(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => (typeof v === 'string' ? v : v?.label ?? v?.title ?? v?.text ?? ''))
    .filter(Boolean);
}

function formatPrice(amount?: number | null, isFree?: boolean): string {
  if (isFree) return 'Free';
  if (amount == null) return '';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function discountPct(original?: number | null, current?: number | null): number | null {
  if (!original || !current || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

// ─── SEO ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await api.bundleBySlug(slug);
  if (!bundle) return { title: 'Bundle Not Found' };

  const t = bundle.translation;
  return {
    title: t?.meta_title || t?.title || bundle.name || 'Bundle',
    description: t?.meta_description || t?.short_description || '',
    openGraph: {
      title: t?.og_title || t?.meta_title || t?.title || '',
      description: t?.og_description || t?.meta_description || '',
      images: t?.og_image ? [{ url: t.og_image }] : [],
      url: t?.og_url || undefined,
      siteName: 'Grow Up More',
    },
    twitter: {
      card: (t?.twitter_card as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: t?.twitter_title || t?.meta_title || t?.title || '',
      description: t?.twitter_description || t?.meta_description || '',
      images: t?.twitter_image ? [t.twitter_image] : [],
    },
    robots: t?.robots_directive || undefined,
    alternates: t?.canonical_url ? { canonical: t.canonical_url } : undefined,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────

export default async function BundleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await api.bundleBySlug(slug);
  if (!bundle) return notFound();

  const t = bundle.translation;
  const title = t?.title || bundle.name || 'Untitled Bundle';
  const description = t?.short_description || t?.description || '';
  const thumbnail = t?.thumbnail_url || null;
  const highlights = toStrings(t?.highlights);
  const instructor = bundle.instructor;

  const courseCount = bundle.course_count ?? bundle.included_courses?.length ?? 0;
  const studentCount = bundle.student_count ?? 0;
  const ratingAvg = bundle.rating_average ?? null;

  const price = bundle.price;
  const originalPrice = bundle.original_price;
  const discount = bundle.discount_percent ?? discountPct(originalPrice, price);
  const savings = originalPrice != null && price != null && originalPrice > price ? originalPrice - price : null;

  // Map included courses to the Course shape the CourseCard expects
  const includedCourses = (bundle.included_courses || []).map((c) => ({
    ...c,
    // Prefer translated fields
    name: c.translated_title || c.name,
    short_description: c.translated_description || c.short_description || null,
    trailer_thumbnail_url: c.translated_thumbnail || c.trailer_thumbnail_url || null,
  }));

  return (
    <>
      <JsonLd data={bundle.translation?.structured_data || productLd({ name: title, description, url: `/bundles/${slug}`, image: thumbnail, price, rating: ratingAvg })} />
      <JsonLd data={breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'Bundles', url: '/bundles' }, { name: title, url: `/bundles/${slug}` }])} />
      {/* Hero */}
      <section className="pt-10 sm:pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/bundles" className="hover:text-brand-700">Bundles</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{title}</span>
          </div>

          {/* Course-detail frame: [content | 380px sticky sidebar] */}
          <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
            <div className="min-w-0">
              <Eyebrow>Bundle{courseCount > 0 ? ` · ${courseCount} courses` : ''}</Eyebrow>
              <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-4 text-slate-600 max-w-2xl">{description}</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                {courseCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                    <Layers className="h-4 w-4" /> {courseCount} courses
                  </span>
                )}
                {studentCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {studentCount.toLocaleString('en-IN')}+ enrolled
                  </span>
                )}
                {ratingAvg != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-warn text-warn" /> {ratingAvg.toFixed(1)} average
                  </span>
                )}
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
                <div className="mt-8 rounded-md bg-white border border-slate-200 shadow-card p-5">
                  <h2 className="heading text-lg text-slate-900">What this bundle gets you</h2>
                  <ul className="mt-3 grid sm:grid-cols-2 gap-2.5">
                    {highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags — from bundle_translations.tags (previously stored but never shown) */}
              {toStrings(t?.tags).length > 0 && (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {toStrings(t?.tags).map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-50 text-brand-700 text-[11.5px] font-semibold px-2.5 py-1">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase card */}
            <Reveal>
              <div className="rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden lg:sticky lg:top-28 self-start">
                <div className="relative h-32 overflow-hidden flex items-end p-5">
                  {thumbnail ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500" />
                  )}
                  {discount != null && discount > 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-br from-rose-500 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md z-10">
                      SAVE {discount}%
                    </div>
                  )}
                  <div className="relative z-10 text-white">
                    <div className="text-[11px] uppercase tracking-wider opacity-80">Includes</div>
                    <div className="heading text-2xl mt-0.5">{courseCount} course{courseCount !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-baseline gap-2">
                    <span className="heading text-3xl text-slate-900">{formatPrice(price)}</span>
                    {originalPrice != null && originalPrice > (price ?? 0) && (
                      <span className="text-sm text-slate-400 line-through">{formatPrice(originalPrice)}</span>
                    )}
                  </div>
                  {savings != null && savings > 0 && (
                    <p className="mt-1 text-[11px] text-success font-semibold">You save {formatPrice(savings)}</p>
                  )}

                  <div className="mt-4 space-y-2.5">
                    <EnrollButton
                      itemType="bundle"
                      itemId={bundle.id}
                      item={{ title, price, original_price: originalPrice, thumbnail_url: thumbnail, slug }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-6 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all disabled:opacity-70"
                    />
                    <WishlistButton itemType="bundle" itemId={bundle.id} variant="full" className="rounded-full border border-slate-200" />
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-100 text-[12px] text-slate-500 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    Get all {courseCount} courses at one bundled price.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Included courses */}
      {includedCourses.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="heading text-2xl sm:text-3xl text-slate-900">Courses in this bundle</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {includedCourses.map((c, i) => (
                <Reveal key={c.id} delay={(i % 4) * 0.05}>
                  <CourseCard course={c} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instructor */}
      {instructor && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="heading text-2xl sm:text-3xl text-slate-900">About the instructor</h2>
            <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card p-6 flex flex-col sm:flex-row items-start gap-6">
              {instructor.profile_image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={instructor.profile_image_url} alt={instructor.full_name} className="h-20 w-20 rounded-full object-cover shadow-cardHover shrink-0" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-2xl flex items-center justify-center shadow-cardHover shrink-0">
                  {instructor.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="heading text-xl text-slate-900">{instructor.full_name}</h3>
                {instructor.designation && (
                  <p className="text-sm text-brand-700 font-semibold mt-0.5">{instructor.designation}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  {instructor.total_students != null && instructor.total_students > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> {instructor.total_students.toLocaleString('en-IN')} students
                    </span>
                  )}
                  {instructor.total_courses != null && instructor.total_courses > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="h-4 w-4" /> {instructor.total_courses} courses
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

      {/* Reviews */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reviews itemType="bundle" itemId={bundle.id} noun="bundle" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <Award className="h-10 w-10 text-brand-600 mx-auto" />
          <h2 className="mt-4 heading text-3xl sm:text-4xl text-slate-900">
            {courseCount > 0 ? `${courseCount} courses, one bundle price` : 'Start learning today'}
          </h2>
          <p className="mt-3 text-slate-600">
            {savings != null && savings > 0 ? `Save ${formatPrice(savings)} compared to buying courses individually.` : 'Get all courses at a bundled price.'}
          </p>
        </div>
      </section>
    </>
  );
}
