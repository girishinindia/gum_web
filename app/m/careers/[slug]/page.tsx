import Link from 'next/link';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { api } from '@/lib/api';
import { CareerApplyForm } from '@/components/careers/CareerApplyForm';

export const revalidate = 120;

const TYPE_LABEL: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship', 'contract': 'Contract',
};

export default async function MobileJobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await api.jobBySlug(slug);

  if (!job) {
    return (
      <div>
        <MobilePageHeader title="Careers" subtitle="Open roles" />
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          This position is no longer open. <Link href="/m/careers" className="text-brand-700 font-semibold">View open roles</Link>
        </div>
      </div>
    );
  }

  const skills = (job.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const sub = [job.department, job.location, TYPE_LABEL[job.employment_type] || job.employment_type].filter(Boolean).join(' · ');

  return (
    <div>
      <MobilePageHeader title={job.title} subtitle={sub} />
      <div className="px-3 py-3 space-y-4">
        <div className="rounded-lg bg-white border border-slate-200 shadow-card p-4">
          <h2 className="heading text-[13px] text-slate-900">About this role</h2>
          <p className="mt-1.5 text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          {job.requirements && (
            <>
              <h2 className="heading text-[13px] text-slate-900 mt-3">Requirements</h2>
              <p className="mt-1.5 text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
            </>
          )}
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((s) => <span key={s} className="rounded-full bg-brand-50 text-brand-700 text-[10.5px] font-semibold px-2 py-0.5">{s}</span>)}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white border border-slate-200 shadow-card p-4">
          <h2 className="heading text-[14px] text-slate-900 mb-3">Apply for this role</h2>
          <CareerApplyForm positionId={job.id} positionTitle={job.title} />
        </div>
      </div>
    </div>
  );
}
