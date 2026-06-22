import Link from 'next/link';
import { MapPin, Briefcase, ArrowRight, Users, Heart, Rocket } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { api } from '@/lib/api';

const PERKS = [
  { Icon: Heart,     title: 'Generous leave',     desc: '30 paid days + 5 sick + India\'s 14 public holidays' },
  { Icon: Users,     title: 'Hybrid by default',  desc: 'Remote-first with 1 quarterly offsite, fully reimbursed' },
  { Icon: Rocket,    title: 'Real ownership',     desc: 'ESOPs on day 1 · transparent compensation bands' },
  { Icon: Briefcase, title: 'Learning budget',    desc: '₹50,000 / year for books, conferences, courses' },
];

const TYPE_LABEL: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship', 'contract': 'Contract',
};

export const metadata = {
  title: 'Careers',
  description: 'Explore careers at Grow Up More — join our mission to make job-ready IT education accessible to everyone.',
};

export const revalidate = 120;

export default async function CareersPage() {
  const jobs = (await api.jobs()) || [];

  return (
    <>
      <PageHero
        eyebrow="Careers at Grow Up More"
        title={<>Build the future of <span className="text-gradient">accessible education</span></>}
        subtitle="We're a small team obsessed with shipping. Generous comp, real ownership, no-meeting Fridays."
      />

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={(i % 4) * 0.06}>
                <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700"><p.Icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 heading text-base text-slate-900">{p.title}</h3>
                  <p className="mt-1.5 text-[12px] text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <Eyebrow>Open Positions</Eyebrow>
          <h2 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">{jobs.length} open role{jobs.length !== 1 ? 's' : ''}</h2>
          <p className="mt-3 text-slate-600">Don&apos;t see a role that fits? Email <span className="text-brand-700 font-semibold">careers@growupmore.com</span> — we hire exceptional people year-round.</p>

          {jobs.length === 0 ? (
            <div className="mt-8 rounded-md bg-white border border-slate-200 shadow-card p-10 text-center text-slate-500">
              No open positions right now. Please check back soon!
            </div>
          ) : (
            <div className="mt-8 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
              {jobs.map((o, i) => (
                <Link
                  key={o.id}
                  href={`/careers/${o.slug}`}
                  className={`group flex items-center gap-4 p-5 transition-colors hover:bg-brand-50/30 ${i > 0 ? 'border-t border-slate-100' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="heading text-base text-slate-900 group-hover:text-brand-700 truncate">{o.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-slate-500">
                      {o.department && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" /> {o.department}</span>}
                      {o.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.location}</span>}
                      <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 rounded-full px-2 py-0.5 font-semibold">{TYPE_LABEL[o.employment_type] || o.employment_type}</span>
                      {o.experience && <span className="text-slate-400">{o.experience}</span>}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-brand-600 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
