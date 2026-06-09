'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, BookOpen, Layers, Users, Video, Award } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchEnrollments, type EnrollmentRow } from '@/lib/commerce';

const GRAD: Record<string, string> = { course: 'from-brand-700 to-brand-500', bundle: 'from-violet-700 to-brand-500', batch: 'from-amber-600 to-rose-500', webinar: 'from-sky-600 to-indigo-500' };
const ICON: Record<string, typeof BookOpen> = { course: BookOpen, bundle: Layers, batch: Users, webinar: Video };

function itemHref(r: EnrollmentRow): string {
  if (r.item_type === 'course') return r.item?.slug ? `/m/courses/${r.item.slug}` : '#';
  if (r.item_type === 'bundle') return r.item?.slug ? `/m/bundles/${r.item.slug}` : '#';
  if (r.item_type === 'batch') return r.item?.course_slug ? `/m/courses/${r.item.course_slug}` : '#';
  if (r.item_type === 'webinar') return `/m/webinars/${r.item_id}`;
  return '#';
}

export default function MobileMyCoursesPage() {
  const { user, signedIn } = useAuth();
  const [rows, setRows] = useState<EnrollmentRow[] | null>(null);

  useEffect(() => {
    if (!signedIn || !user) { setRows([]); return; }
    fetchEnrollments(user.id).then(setRows).catch(() => setRows([]));
  }, [signedIn, user]);

  return (
    <div className="pb-6">
      <MobilePageHeader title="My Courses" subtitle="Your learning" />
      {!signedIn ? (
        <div className="mx-3 mt-4 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white p-5 text-center shadow-cardHover">
          <BookOpen className="h-6 w-6 mx-auto" />
          <div className="heading mt-2 text-[15px]">Sign in to see your courses</div>
          <Link href="/m/login?next=%2Fm%2Fmy-courses" className="mt-3 inline-flex rounded-full bg-white text-brand-700 px-4 py-1.5 text-[12px] font-bold">Sign in</Link>
        </div>
      ) : rows == null ? (
        <div className="px-3 mt-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-white border border-slate-200 animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <div className="px-3 mt-10 text-center"><BookOpen className="h-7 w-7 mx-auto text-slate-300" /><p className="heading text-slate-700 text-sm mt-2">No enrolments yet</p><Link href="/m/courses" className="mt-3 inline-flex rounded-full bg-brand-500 text-white px-4 py-1.5 text-[12px] font-bold">Explore courses</Link></div>
      ) : (
        <div className="px-3 mt-4 space-y-3">
          {rows.map((r) => { const Icon = ICON[r.item_type] ?? BookOpen; const pct = Math.round(Number(r.progress_pct ?? 0)); return (
            <Link key={r.id} href={itemHref(r)} className="flex gap-3 p-3 rounded-md bg-white border border-slate-200 shadow-card active:scale-[0.99] transition-all">
              <div className={`h-16 w-16 rounded-md shrink-0 overflow-hidden bg-gradient-to-br ${GRAD[r.item_type] ?? GRAD.course} flex items-center justify-center`}>
                {r.item?.thumbnail_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={r.item.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  : <Icon className="h-6 w-6 text-white/85" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="heading text-[13.5px] text-slate-900 line-clamp-2 leading-tight">{r.item?.title ?? `${r.item_type} #${r.item_id}`}</h3>
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent rounded-full" style={{ width: `${pct}%` }} /></div>
                <div className="mt-1 flex items-center justify-between text-[10.5px] text-slate-500">
                  <span>{pct}% complete</span>
                  {pct >= 100 ? <span className="text-success font-semibold inline-flex items-center gap-0.5"><Award className="h-3 w-3" /> Certificate</span> : <span className="text-brand-700 font-semibold inline-flex items-center gap-0.5"><PlayCircle className="h-3 w-3" /> Continue</span>}
                </div>
              </div>
            </Link>
          ); })}
        </div>
      )}
    </div>
  );
}
