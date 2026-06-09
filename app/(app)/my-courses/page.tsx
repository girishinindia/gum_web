'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, BookOpen, Award, Layers, Users, Video } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchEnrollments, type EnrollmentRow } from '@/lib/commerce';

const GRAD: Record<string, string> = { course: 'from-brand-700 to-brand-500', bundle: 'from-violet-700 to-brand-500', batch: 'from-amber-600 to-rose-500', webinar: 'from-sky-600 to-indigo-500' };
const ICON: Record<string, typeof BookOpen> = { course: BookOpen, bundle: Layers, batch: Users, webinar: Video };

function itemHref(r: EnrollmentRow): string {
  const it = r.item;
  if (r.item_type === 'course') return it?.slug ? `/courses/${it.slug}` : '#';
  if (r.item_type === 'bundle') return it?.slug ? `/bundles/${it.slug}` : '#';
  if (r.item_type === 'batch') return it?.course_slug ? `/courses/${it.course_slug}` : '#';
  if (r.item_type === 'webinar') return `/webinars/${r.item_id}`;
  return '#';
}

export default function MyCoursesPage() {
  const { user, signedIn } = useAuth();
  const [rows, setRows] = useState<EnrollmentRow[] | null>(null);

  useEffect(() => {
    if (!signedIn || !user) return;
    fetchEnrollments(user.id).then(setRows).catch(() => setRows([]));
  }, [signedIn, user]);

  return (
    <div className="max-w-7xl mx-auto">
      <Eyebrow>My Learning</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Your courses</h1>
      <p className="mt-1 text-sm text-slate-500">{rows == null ? 'Loading…' : `${rows.length} active enrolment${rows.length === 1 ? '' : 's'}.`}</p>

      {rows == null ? (
        <div className="mt-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-md bg-white border border-slate-200 p-10 text-center">
          <BookOpen className="h-8 w-8 mx-auto text-slate-300" />
          <p className="mt-3 heading text-lg text-slate-800">You haven&apos;t enrolled yet</p>
          <p className="mt-1 text-sm text-slate-500">Enrol in a free course or buy one to start learning.</p>
          <Link href="/courses" className="mt-4 inline-flex rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold">Explore courses</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((r) => {
            const it = r.item; const Icon = ICON[r.item_type] ?? BookOpen; const pct = Math.round(Number(r.progress_pct ?? 0));
            return (
              <div key={r.id} className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden flex flex-col sm:flex-row hover:shadow-cardHover transition-all">
                <Link href={itemHref(r)} className={`relative sm:w-64 aspect-video sm:aspect-auto sm:flex-shrink-0 bg-gradient-to-br ${GRAD[r.item_type] ?? GRAD.course} flex items-center justify-center overflow-hidden`}>
                  {it?.thumbnail_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={it.thumbnail_url} alt={it?.title ?? ''} className="absolute inset-0 h-full w-full object-cover" />
                    : <Icon className="h-12 w-12 text-white/90" />}
                </Link>
                <div className="flex-1 p-5 flex flex-col">
                  <div className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold capitalize">{r.item_type}{r.enrollment_status ? ` · ${r.enrollment_status}` : ''}</div>
                  <h3 className="mt-1 heading text-lg text-slate-900"><Link href={itemHref(r)}>{it?.title ?? `${r.item_type} #${r.item_id}`}</Link></h3>
                  <div className="flex-1" />
                  <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent rounded-full" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-2 text-[11.5px] text-slate-500 flex justify-between">
                    <span>{pct}% complete</span>
                    {pct >= 100
                      ? <span className="text-success font-semibold inline-flex items-center gap-1"><Award className="h-3 w-3" /> Certificate ready</span>
                      : <Link href={itemHref(r)} className="text-brand-700 font-semibold inline-flex items-center gap-1"><PlayCircle className="h-3 w-3" /> Continue</Link>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
