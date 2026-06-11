'use client';

/**
 * Student dashboard (June 2026). Stats, "Continue learning" and "Upcoming"
 * were hardcoded mockups — now live from GET /dashboard/me. The Achievements
 * section (badges + certificates) was already wired.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Trophy, Award, CheckCircle2, ChevronRight, PlayCircle, Calendar, ArrowRight, Target } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { DashboardWelcome } from '@/components/app/DashboardWelcome';
import { Achievements } from '@/components/app/Achievements';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchDashboard, type DashboardSummary } from '@/lib/commerce';

const COVERS = [
  'from-brand-700 via-brand-600 to-brand-500',
  'from-emerald-700 via-emerald-600 to-brand-500',
  'from-violet-700 via-rose-600 to-amber-500',
];

function fmtWhen(d?: string | null): string {
  if (!d) return '';
  const dt = new Date(d);
  const today = new Date();
  const isToday = dt.toDateString() === today.toDateString();
  const time = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (isToday) return `Today · ${time}`;
  return `${dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${time}`;
}

export default function DashboardPage() {
  const { signedIn } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    fetchDashboard().then(setData).catch(() => setData({ stats: { active_courses: 0, total_enrollments: 0, completed: 0, certificates: 0, badges: 0 }, continue: [], upcoming: [] }));
  }, [signedIn]);

  const stats = [
    { label: 'Active courses', value: data?.stats.active_courses ?? '—', Icon: BookOpen, accent: 'from-brand-500 to-brand-700' },
    { label: 'Completed', value: data?.stats.completed ?? '—', Icon: CheckCircle2, accent: 'from-emerald-500 to-brand-500' },
    { label: 'Certificates', value: data?.stats.certificates ?? '—', Icon: Trophy, accent: 'from-violet-500 to-brand-500' },
    { label: 'Badges', value: data?.stats.badges ?? '—', Icon: Award, accent: 'from-amber-500 to-rose-500' },
  ];

  const cont = data?.continue ?? [];
  const upcoming = data?.upcoming ?? [];
  const activeCourses = Number(data?.stats.active_courses) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <DashboardWelcome />
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">
        {activeCourses > 0
          ? <>You have <span className="text-gradient">{activeCourses} course{activeCourses === 1 ? '' : 's'}</span> in progress — keep going</>
          : <>Welcome — <span className="text-gradient">start learning</span> today</>}
      </h1>

      {/* Stats — live */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md bg-white border border-slate-200 shadow-card p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${s.accent} text-white shadow-btn`}><s.Icon className="h-4 w-4" /></div>
            <div className="mt-3 heading text-3xl text-slate-900">{s.value}</div>
            <div className="text-[12px] uppercase tracking-wider text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Continue learning — live */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="heading text-xl text-slate-900">Continue learning</h2>
          <Link href="/my-courses" className="text-[13px] font-semibold text-brand-700 hover:underline inline-flex items-center gap-1">My courses <ChevronRight className="h-3 w-3" /></Link>
        </div>
        {data == null ? (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
        ) : cont.length === 0 ? (
          <div className="mt-4 rounded-md bg-white border border-slate-200 p-8 text-center">
            <BookOpen className="h-7 w-7 mx-auto text-slate-300" />
            <p className="mt-2 heading text-base text-slate-800">Nothing in progress</p>
            <Link href="/courses" className="mt-3 inline-flex rounded-full bg-brand-600 text-white px-5 py-2 text-sm font-semibold">Browse courses</Link>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cont.map((c, i) => {
              const pct = Math.round(c.progress_pct || 0);
              return (
                <Link key={c.enrollment_id} href={c.course.slug ? `/courses/${c.course.slug}` : '/my-courses'} className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all">
                  <div className={`relative aspect-[16/9] bg-gradient-to-br ${COVERS[i % COVERS.length]} flex items-center justify-center overflow-hidden`}>
                    {c.course.trailer_thumbnail_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.course.trailer_thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                    <PlayCircle className="relative h-12 w-12 text-white/90 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-4">
                    <h3 className="heading text-base text-slate-900 group-hover:text-brand-700 transition-colors truncate">{c.course.name}</h3>
                    {c.course.total_lessons ? <p className="mt-1 text-[11.5px] text-slate-500">{c.course.total_lessons} lessons</p> : null}
                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 text-[11.5px] text-slate-500 flex justify-between"><span>{pct}% complete</span><span>Continue →</span></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Two-column: Upcoming (live) + Goal card */}
      <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div>
          <h2 className="heading text-xl text-slate-900">Upcoming</h2>
          {data == null ? (
            <div className="mt-4 h-40 rounded-md bg-white border border-slate-200 animate-pulse" />
          ) : upcoming.length === 0 ? (
            <div className="mt-4 rounded-md bg-white border border-slate-200 p-8 text-center">
              <Calendar className="h-7 w-7 mx-auto text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No upcoming sessions — check <Link href="/webinars" className="text-brand-700 font-semibold hover:underline">webinars</Link> and <Link href="/live-sessions" className="text-brand-700 font-semibold hover:underline">live sessions</Link>.</p>
            </div>
          ) : (
            <ul className="mt-4 rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100">
              {upcoming.map((u) => (
                <li key={`${u.kind}-${u.id}`}>
                  <Link href={u.kind === 'webinar' ? `/webinars/${u.slug || u.id}` : `/live-sessions/${u.id}`} className="p-4 flex items-center gap-4 hover:bg-brand-50/30 transition-colors">
                    <div className="h-10 w-10 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0"><Calendar className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] uppercase tracking-wider text-slate-500">{u.kind === 'webinar' ? 'Webinar' : 'Live session'}</div>
                      <div className="text-sm font-semibold text-slate-900 truncate">{u.title}</div>
                    </div>
                    <div className="text-[12px] text-slate-500 shrink-0">{fmtWhen(u.scheduled_at)}{u.duration_minutes ? ` · ${u.duration_minutes}m` : ''}</div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-md bg-gradient-to-br from-brand-600 to-accent text-white p-6 shadow-cardHover overflow-hidden relative">
          <div aria-hidden className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <Target className="h-9 w-9" />
          <h3 className="mt-4 heading text-2xl">Keep the streak</h3>
          <p className="mt-1 text-white/85 text-sm">
            {data ? `${data.stats.completed} completed · ${data.stats.certificates} certificate${data.stats.certificates === 1 ? '' : 's'} earned` : 'Loading your progress…'}
          </p>
          <ButtonLink href="/my-courses" variant="white" size="sm" className="mt-5 text-brand-700 rounded-full">Pick up where you left off</ButtonLink>
        </div>
      </div>

      {/* Achievements — real badges + certificates */}
      <Achievements />
    </div>
  );
}
