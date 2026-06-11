import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Calendar, Clock, Radio, Users, ChevronRight, Bell,
  Share2, CheckCircle2, Star, Award, PlayCircle, Video,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reviews } from '@/components/reviews/Reviews';
import { api, type WebinarDetail } from '@/lib/api';
import { JsonLd } from '@/components/seo/JsonLd';
import { eventLd, breadcrumbLd } from '@/lib/jsonld';
import { metaFromTranslation } from '@/lib/seo';
import { ShareBar } from '@/components/ui/ShareBar';

export const revalidate = 60; // SEO fix: og/meta changes propagate within a minute

// ─── helpers ────────────────────────────────────────────────────────────

function formatPrice(amount?: number | null, isFree?: boolean): string {
  if (isFree) return 'Free';
  if (amount == null) return '';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' });
}

function initials(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function toStrings(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => (typeof v === 'string' ? v : v?.label ?? v?.title ?? v?.text ?? ''))
    .filter(Boolean);
}

// ─── SEO ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const webinar = await api.webinarBySlug(slug);
  if (!webinar) return { title: 'Webinar Not Found' };
  const t = webinar.translation;
  // SEO audit (June 2026): full translation SEO block via the shared helper —
  // adds canonical_url, robots_directive, meta_keywords and the
  // og_image → item thumbnail → site default image chain (was images: []).
  return metaFromTranslation((t as any) ?? null, {
    title: t?.title || webinar.title || 'Webinar',
    description: t?.short_description || t?.description || null,
    path: `/webinars/${slug}`,
    image: (webinar as any).thumbnail_url || null,
  });
}

// ─── Page ───────────────────────────────────────────────────────────────

export default async function WebinarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Catalog cards link by id; the route param is named `slug` but may hold
  // either a slug or an id. Resolve by slug first, then fall back to id so the
  // detail page never 404s on an id-based link.
  let webinar = await api.webinarBySlug(slug);
  if (!webinar && /^\d+$/.test(slug)) webinar = (await api.webinarById(slug)) as unknown as WebinarDetail;
  if (!webinar) return notFound();

  const t = webinar.translation;
  const title = t?.title || webinar.title || 'Untitled Webinar';
  // Lede (short) + full body — both stored in webinar_translations; show both.
  const shortDescription = t?.short_description || '';
  const fullDescription = t?.description || '';
  const description = shortDescription || fullDescription;
  const thumbnail = t?.thumbnail || webinar.thumbnail_url || null;
  const tags = toStrings(t?.tags);

  const instructor = webinar.instructor;
  const instrName = instructor?.full_name ?? (webinar as unknown as { users?: { full_name?: string } }).users?.full_name ?? '';
  const instrInitials = initials(instrName);

  const isFree = webinar.is_free ?? true;
  const price = webinar.price;
  const scheduledAt = webinar.scheduled_at || webinar.start_time;
  const durationMin = webinar.duration_minutes;
  const maxAttendees = webinar.max_attendees;
  const regCount = webinar.registration_count ?? 0;
  const status = webinar.webinar_status || '';

  const parentCourse = webinar.courses;
  const hasRecording = !!webinar.recording_url;

  // Is it upcoming?
  const isUpcoming = scheduledAt ? new Date(scheduledAt) > new Date() : false;

  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <JsonLd data={webinar.translation?.structured_data || eventLd({ name: title, description, url: `/webinars/${slug}`, image: thumbnail, startDate: scheduledAt, isFree, price })} />
      <JsonLd data={breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'Webinars', url: '/webinars' }, { name: title, url: `/webinars/${slug}` }])} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/webinars" className="hover:text-brand-700">Webinars</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{title}</span>
        </div>

        {/* Course-detail frame: [content | 380px sticky sidebar] */}
        <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
          <div>
            <Eyebrow>
              <span className="inline-flex items-center gap-1.5">
                {isUpcoming ? (
                  <><Radio className="h-3 w-3 text-rose-500 animate-pulse" /> LIVE WEBINAR</>
                ) : hasRecording ? (
                  <><PlayCircle className="h-3 w-3 text-brand-500" /> RECORDED</>
                ) : (
                  'WEBINAR'
                )}
              </span>
            </Eyebrow>

            <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
              {title}
            </h1>

            {shortDescription && (
              <p className="mt-4 text-lg text-slate-700 font-medium leading-relaxed max-w-2xl">{shortDescription}</p>
            )}

            <ShareBar url={`/webinars/${slug}`} title={title} className="mt-4" />

            {/* Hero banner */}
            <div className="mt-6 rounded-md overflow-hidden relative">
              {thumbnail ? (
                <div className="aspect-video relative bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {instrName && (
                    <div className="absolute bottom-6 left-6 text-white z-10">
                      <div className="text-[11px] uppercase tracking-wider opacity-80">Hosted by</div>
                      <div className="heading text-2xl mt-1">{instrName}</div>
                      {instructor?.designation && (
                        <div className="text-sm opacity-90">{instructor.designation}</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-brand-700 via-brand-600 to-accent text-white p-6 flex flex-col justify-between">
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                  <div className="relative">
                    {isUpcoming && scheduledAt && (
                      <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider">
                        <Bell className="h-3 w-3" /> {formatDate(scheduledAt)}
                      </div>
                    )}
                  </div>
                  {instrName && (
                    <div className="relative">
                      <div className="text-[11px] uppercase tracking-wider opacity-80">Hosted by</div>
                      <div className="heading text-2xl mt-1">{instrName}</div>
                      {instructor?.designation && (
                        <div className="text-sm opacity-90">{instructor.designation}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* About — full description from webinar_translations.description */}
            {fullDescription && fullDescription !== shortDescription && (
              <div className="mt-8">
                <h2 className="heading text-2xl text-slate-900">About this webinar</h2>
                <p className="mt-3 text-[15.5px] leading-[1.8] text-slate-700 whitespace-pre-line">{fullDescription}</p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center bg-brand-50 text-brand-700 rounded-full px-3 py-1 text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Parent course link */}
            {parentCourse?.slug && (
              <div className="mt-6 text-sm text-slate-600">
                Related course:{' '}
                <Link href={`/courses/${parentCourse.slug}`} className="text-brand-600 font-semibold underline hover:text-brand-800">
                  {parentCourse.name}
                </Link>
              </div>
            )}

            {/* Instructor detail */}
            {instructor && (
              <div className="mt-8">
                <h2 className="heading text-2xl text-slate-900">About the host</h2>
                <div className="mt-4 rounded-md bg-white border border-slate-200 shadow-card p-5 flex items-start gap-4">
                  {instructor.profile_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={instructor.profile_image_url} alt={instrName} className="h-16 w-16 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-xl flex items-center justify-center shrink-0">
                      {instrInitials}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="heading text-lg text-slate-900">{instrName}</h3>
                    {instructor.designation && (
                      <p className="text-sm text-brand-700 font-semibold">{instructor.designation}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      {instructor.total_students != null && instructor.total_students > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {instructor.total_students.toLocaleString('en-IN')} students
                        </span>
                      )}
                      {instructor.years_experience != null && instructor.years_experience > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> {instructor.years_experience} years
                        </span>
                      )}
                    </div>
                    {instructor.bio && (
                      <p className="mt-2 text-sm text-slate-600">{instructor.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar – registration card */}
          <Reveal>
            <div className="rounded-md bg-white border border-slate-200 shadow-cardHover p-6 lg:sticky lg:top-28 self-start">
              <div className="text-[11px] font-bold uppercase tracking-wider text-success">
                {isFree ? 'FREE' : formatPrice(price)}
              </div>
              <div className="heading text-xl text-slate-900 mt-1">
                {isUpcoming ? 'Reserve your seat' : hasRecording ? 'Watch recording' : 'About this webinar'}
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                {scheduledAt && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 text-brand-600" /> {formatDate(scheduledAt)}
                  </div>
                )}
                {scheduledAt && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="h-4 w-4 text-brand-600" />
                    {formatTime(scheduledAt)}
                    {durationMin ? ` · ${durationMin} min` : ''}
                  </div>
                )}
                {regCount > 0 && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="h-4 w-4 text-brand-600" /> {regCount.toLocaleString('en-IN')} registered
                  </div>
                )}
                {maxAttendees != null && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="h-4 w-4 text-brand-600" /> Max {maxAttendees} attendees
                  </div>
                )}
                {(webinar as any).rating_average != null && Number((webinar as any).rating_average) > 0 && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Star className="h-4 w-4 fill-warn text-warn" /> <b>{Number((webinar as any).rating_average).toFixed(1)}</b>
                    {(webinar as any).rating_count != null ? <span className="text-slate-400">({(webinar as any).rating_count})</span> : null}
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2.5">
                {hasRecording ? (
                  <Button variant="primary" className="w-full rounded-full">
                    <PlayCircle className="h-4 w-4" /> Watch now
                  </Button>
                ) : (
                  <Button variant="primary" className="w-full rounded-full">Reserve seat</Button>
                )}
                <Button variant="outline" className="w-full rounded-full">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>

              {isUpcoming && (
                <div className="mt-5 pt-5 border-t border-slate-100 text-[11px] text-slate-500">
                  Recording will be sent to your email if you can&apos;t attend live.
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <Reviews itemType="webinar" itemId={webinar.id} noun="webinar" />
        </div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <h3 className="heading text-lg text-slate-900">Looking for more?</h3>
          <ButtonLink href="/webinars" variant="outline" size="md" className="mt-3 rounded-full">
            Browse all webinars
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
