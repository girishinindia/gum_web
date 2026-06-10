import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Star, Users, BookOpen, BadgeCheck, ChevronRight, CalendarDays } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reviews } from '@/components/reviews/Reviews';
import { fetchInstructorsList } from '@/lib/api';

export const revalidate = 300;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveInstructor(slug: string): Promise<any | null> {
  const list = await fetchInstructorsList({ limit: 100 }).catch(() => ({ data: [] as unknown[] }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (list.data as any[]).find((x) => String(x.user_id) === slug || String(x.id) === slug) || null;
}

function toTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await resolveInstructor(slug);
  const name = p?.users?.full_name || 'Instructor';
  return { title: `${name} — Instructor`, description: `Courses and profile of ${name} on Grow Up More.` };
}

export default async function InstructorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await resolveInstructor(slug);
  if (!p) return notFound();

  const name: string = p.users?.full_name || 'Instructor';
  const avatar: string | null = p.users?.avatar_url || null;
  const initials = name.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const type: string | null = p.instructor_type ? String(p.instructor_type).replace(/_/g, ' ') : null;
  const bio: string = p.bio || p.about || '';
  const expertise = toTags(p.expertise || p.skills);
  const sinceYear = p.created_at ? new Date(p.created_at).getFullYear() : null;

  return (
    <section className="pt-8 sm:pt-10 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-700">Home</Link><ChevronRight className="h-3 w-3" />
          <Link href="/instructors" className="hover:text-brand-700">Instructors</Link><ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[200px] text-slate-700 font-medium">{name}</span>
        </nav>

        {/* Two-column grid — sticky profile card (desktop) + content. items-start
            keeps both columns aligned from the top; on mobile the card is in
            normal flow (no sticky). */}
        <div className="mt-6 grid lg:grid-cols-[300px_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
          {/* ── Left: profile card (sticky on desktop) ── */}
          <aside className="lg:sticky lg:top-24 self-start">
            <Reveal>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-cardHover p-6 text-center">
                {avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatar} alt={name} className="mx-auto h-28 w-28 rounded-full object-cover shadow-cardHover" />
                ) : (
                  <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white heading text-4xl flex items-center justify-center shadow-cardHover">{initials}</div>
                )}
                <h1 className="mt-4 heading text-xl text-slate-900">{name}</h1>
                {type && <p className="mt-1 text-sm text-slate-500 capitalize">{type}</p>}

                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                  {p.is_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-bold"><BadgeCheck className="h-3 w-3" /> Verified</span>
                  )}
                  {sinceYear && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-[11px] font-semibold"><CalendarDays className="h-3 w-3" /> Since {sinceYear}</span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-1 text-[11px] text-slate-500 pt-5 border-t border-slate-100">
                  <div className="flex flex-col items-center gap-0.5"><BookOpen className="h-3.5 w-3.5" /><span className="font-semibold text-slate-800 text-sm">{p.course_count ?? 0}</span><span>Courses</span></div>
                  <div className="flex flex-col items-center gap-0.5"><Users className="h-3.5 w-3.5" /><span className="font-semibold text-slate-800 text-sm">{(p.student_count ?? 0).toLocaleString('en-IN')}</span><span>Students</span></div>
                  <div className="flex flex-col items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-warn text-warn" /><span className="font-semibold text-slate-800 text-sm">{p.rating_average != null ? Number(p.rating_average).toFixed(1) : '—'}</span><span>Rating</span></div>
                </div>
              </div>
            </Reveal>
          </aside>

          {/* ── Right: about + expertise + reviews ── */}
          <div className="min-w-0">
            <Eyebrow>About the instructor</Eyebrow>
            <h2 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">{name}</h2>
            {bio ? (
              <p className="mt-4 text-slate-600 leading-relaxed">{bio}</p>
            ) : (
              <p className="mt-4 text-slate-500">This instructor hasn&apos;t added a bio yet.</p>
            )}

            {expertise.length > 0 && (
              <>
                <h3 className="mt-8 heading text-lg text-slate-900">Expertise</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {expertise.map((tag) => (
                    <span key={tag} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[12px] text-slate-700">{tag}</span>
                  ))}
                </div>
              </>
            )}

            {/* Reviews */}
            <div className="mt-10">
              <Reviews itemType="instructor" itemId={p.id} noun="instructor" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
