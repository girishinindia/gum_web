import Link from 'next/link';
import { Star, Users, BookOpen, ArrowRight, BadgeCheck } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import { FEATURED_INSTRUCTORS } from '@/lib/homeContent';
import { cn } from '@/lib/cn';
import type { InstructorProfile } from '@/lib/api';

const ACCENT_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-rose-500 to-amber-500',
  'from-emerald-500 to-brand-500',
  'from-violet-500 to-brand-500',
  'from-amber-500 to-rose-500',
  'from-brand-600 to-accent',
];

function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2);
}

function formatStudents(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}k+`;
  return `${n}+`;
}

function toBadge(p: InstructorProfile): string {
  if (p.is_verified) return 'Top Rated';
  if (p.is_featured) return 'Bestseller';
  return 'Mentor';
}

function toCard(p: InstructorProfile, idx: number) {
  const name = p.users?.full_name ?? 'Instructor';
  return {
    id:       p.user_id ?? p.id,
    name,
    title:    p.instructor_type ?? '',
    courses:  p.course_count ?? 0,
    students: formatStudents(p.student_count ?? 0),
    rating:   p.rating_average ?? 0,
    badge:    toBadge(p),
    initial:  initials(name),
    accent:   ACCENT_GRADIENTS[idx % ACCENT_GRADIENTS.length],
    avatarUrl: p.users?.avatar_url ?? null,
  };
}

interface Props { data?: InstructorProfile[] | null }

export function Instructors({ data }: Props) {
  return (
    <section id="instructors" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <Eyebrow>Meet the Instructors</Eyebrow>
              <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                Learn from people who&apos;ve <span className="text-gradient">shipped real things</span>
              </h2>
              <p className="mt-4 text-slate-600 max-w-md">
                Senior engineers, scientists and designers from Google, Razorpay, Flipkart, TCS &amp; more — teaching what actually works in industry.
              </p>
            </div>
            <ButtonLink href="/instructors" variant="outline" size="md" className="rounded-full self-start lg:self-auto">
              All instructors <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(data && data.length > 0 ? data.map((p, i) => toCard(p, i)) : FEATURED_INSTRUCTORS.map(p => ({ ...p, avatarUrl: null as string | null }))).map((p, i) => (
            <Reveal key={p.id} delay={(i % 6) * 0.05}>
              <Link
                href={`/instructors/${p.id}`}
                className="group block rounded-md bg-white border border-slate-200 shadow-card p-5 text-center hover:-translate-y-1 hover:shadow-cardHover hover:border-brand-200 transition-all"
              >
                {p.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.avatarUrl} alt={p.name} className="mx-auto h-20 w-20 rounded-full object-cover shadow-btn" />
                ) : (
                  <div className={cn(
                    'mx-auto h-20 w-20 rounded-full bg-gradient-to-br text-white heading text-2xl flex items-center justify-center shadow-btn',
                    p.accent,
                  )}>
                    {p.initial}
                  </div>
                )}
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-bold">
                  <BadgeCheck className="h-3 w-3" /> {p.badge}
                </div>
                <h3 className="mt-2 heading text-sm font-semibold text-slate-900 group-hover:text-brand-700 transition-colors leading-tight">
                  {p.name}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 min-h-[28px]">{p.title}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10.5px] text-slate-500">
                  <div className="flex flex-col items-center gap-0.5">
                    <BookOpen className="h-3 w-3" />
                    <span className="font-semibold text-slate-700">{p.courses}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Users className="h-3 w-3" />
                    <span className="font-semibold text-slate-700">{p.students}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Star className="h-3 w-3 fill-warn text-warn" />
                    <span className="font-semibold text-slate-700">{p.rating}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
