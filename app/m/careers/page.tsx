import Link from 'next/link';
import { Briefcase, MapPin } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { api } from '@/lib/api';

export const revalidate = 120;

const TYPE_LABEL: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship', 'contract': 'Contract',
};

export default async function MobileCareersPage() {
  const jobs = (await api.jobs()) || [];
  return (
    <div>
      <MobilePageHeader title="Careers" subtitle="Open roles at Grow Up More" />
      {jobs.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-slate-500">No open positions right now. Please check back soon!</div>
      ) : (
        <div className="px-3 pt-2 pb-4 space-y-2.5">
          {jobs.map((o) => (
            <Link key={o.id} href={`/m/careers/${o.slug}`} className="block rounded-lg bg-white border border-slate-200 shadow-card p-3.5">
              <h3 className="heading text-[14px] text-slate-900 leading-tight">{o.title}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                {o.department && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" /> {o.department}</span>}
                {o.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.location}</span>}
                <span className="rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 font-semibold">{TYPE_LABEL[o.employment_type] || o.employment_type}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
