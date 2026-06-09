import { notFound } from 'next/navigation';
import { Star, Users, BookOpen, BadgeCheck, Briefcase, GraduationCap } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { MobileDetailBar } from '@/components/mobile/MobileDetailBar';
import { fetchInstructorsList } from '@/lib/api';

export const revalidate = 300;

export default async function MobileInstructorDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // holds the instructor's user_id (or profile id) on mobile
  const list = await fetchInstructorsList({ limit: 100 });
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p: any = list.data.find((x: any) => String(x.user_id) === slug || String(x.id) === slug);
  if (!p) notFound();

  const name = p.users?.full_name || 'Instructor';
  const initials = name.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('');
  const type = p.instructor_type ? String(p.instructor_type).replace('_', ' ') : null;
  const bio = p.bio || p.about || p.expertise || '';
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <MobilePageHeader title={name} subtitle="Instructor" />

      <section className="px-4 pt-3 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-emerald-600 to-brand-500 text-white heading text-2xl flex items-center justify-center shadow-cardHover overflow-hidden">
          {p.users?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.users.avatar_url} alt={name} className="h-full w-full object-cover" />
          ) : initials}
        </div>
        <h1 className="mt-3 heading text-xl text-slate-900">{name}</h1>
        <div className="mt-1.5 flex items-center justify-center gap-2 flex-wrap">
          {p.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10.5px] font-bold"><BadgeCheck className="h-3 w-3" /> Verified</span>}
          {type && <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-[10.5px] font-semibold capitalize">{type}</span>}
          {p.created_at && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10.5px] font-semibold">Since {new Date(p.created_at).getFullYear()}</span>}
        </div>
      </section>

      <section className="px-4 mt-4 grid grid-cols-3 gap-2 text-center">
        {p.course_count != null && <div className="rounded-md bg-white border border-slate-200 p-3"><BookOpen className="h-4 w-4 text-brand-600 mx-auto" /><div className="heading text-[15px] text-slate-900 mt-1">{p.course_count}</div><div className="text-[10px] text-slate-500">Courses</div></div>}
        {p.student_count != null && <div className="rounded-md bg-white border border-slate-200 p-3"><Users className="h-4 w-4 text-brand-600 mx-auto" /><div className="heading text-[15px] text-slate-900 mt-1">{p.student_count.toLocaleString('en-IN')}</div><div className="text-[10px] text-slate-500">Students</div></div>}
        {p.rating_average != null && <div className="rounded-md bg-white border border-slate-200 p-3"><Star className="h-4 w-4 fill-warn text-warn mx-auto" /><div className="heading text-[15px] text-slate-900 mt-1">{Number(p.rating_average).toFixed(1)}</div><div className="text-[10px] text-slate-500">Rating</div></div>}
        {p.years_experience != null && <div className="rounded-md bg-white border border-slate-200 p-3"><Briefcase className="h-4 w-4 text-brand-600 mx-auto" /><div className="heading text-[15px] text-slate-900 mt-1">{p.years_experience}y</div><div className="text-[10px] text-slate-500">Experience</div></div>}
      </section>

      {bio && (
        <section className="px-4 mt-5">
          <h2 className="heading text-[15px] font-bold text-slate-900">About</h2>
          <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">{bio}</p>
        </section>
      )}

      <MobileDetailBar
        cta="View courses"
        CtaIcon={GraduationCap}
        left={<div className="heading text-[15px] text-slate-900">{name.split(' ')[0]}&apos;s courses</div>}
      />
    </div>
  );
}
