import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Briefcase, MapPin, Clock, TrendingUp, Banknote } from 'lucide-react';
import { api } from '@/lib/api';
import { CareerApplyForm } from '@/components/careers/CareerApplyForm';

export const revalidate = 120;

const TYPE_LABEL: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship', 'contract': 'Contract',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await api.jobBySlug(slug);
  return {
    title: job ? `${job.title} — Careers` : 'Careers',
    description: job?.description?.slice(0, 160) || 'Apply for a role at Grow Up More.',
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await api.jobBySlug(slug);

  if (!job) {
    return (
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h1 className="heading text-2xl text-slate-900">This position is no longer open</h1>
          <p className="mt-3 text-slate-600">The role you&apos;re looking for has been filled or has expired.</p>
          <Link href="/careers" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-600 text-white px-5 py-2.5 text-sm font-bold">View open roles</Link>
        </div>
      </section>
    );
  }

  const skills = (job.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const meta = [
    job.department ? { Icon: Briefcase, label: job.department } : null,
    job.location ? { Icon: MapPin, label: job.location } : null,
    { Icon: Clock, label: TYPE_LABEL[job.employment_type] || job.employment_type },
    job.experience ? { Icon: TrendingUp, label: job.experience } : null,
    job.salary_range ? { Icon: Banknote, label: job.salary_range } : null,
  ].filter(Boolean) as { Icon: any; label: string }[];

  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/careers" className="hover:text-brand-700">Careers</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[220px]">{job.title}</span>
        </div>

        <h1 className="mt-5 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">{job.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
          {meta.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-1.5"><m.Icon className="h-4 w-4 text-brand-600" /> {m.label}</span>
          ))}
        </div>

        <div className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 lg:gap-12 items-start">
          {/* Apply form */}
          <div className="rounded-md bg-white border border-slate-200 shadow-card p-6 order-2 lg:order-1">
            <h2 className="heading text-lg text-slate-900">Apply for this role</h2>
            <p className="text-[13px] text-slate-500 mt-1 mb-5">Fields marked <span className="text-rose-500">*</span> are required.</p>
            <CareerApplyForm positionId={job.id} positionTitle={job.title} />
          </div>

          {/* Details sidebar */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-28 self-start space-y-5">
            <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
              <h3 className="heading text-sm text-slate-900">About this role</h3>
              <p className="mt-2 text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
            {job.requirements && (
              <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
                <h3 className="heading text-sm text-slate-900">Requirements</h3>
                <p className="mt-2 text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}
            {skills.length > 0 && (
              <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
                <h3 className="heading text-sm text-slate-900">Skills</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="rounded-full bg-brand-50 text-brand-700 text-[11.5px] font-semibold px-2.5 py-1">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
