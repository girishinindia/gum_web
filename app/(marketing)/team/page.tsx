import { Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';

const LEADERSHIP = [
  { name: 'Vikram Iyer',     role: 'Founder & CEO',           bio: 'ex-Google, IIT Bombay alum',          initial: 'V', accent: 'from-brand-500 to-brand-700' },
  { name: 'Nandita Rao',     role: 'Co-founder & Head of Ed', bio: 'Cambridge PhD, ex-NIE Singapore',     initial: 'N', accent: 'from-rose-500 to-amber-500' },
  { name: 'Rohit Sharma',    role: 'CTO',                     bio: 'ex-Razorpay, scaled 0→10M users',     initial: 'R', accent: 'from-emerald-500 to-brand-500' },
  { name: 'Shweta Kapoor',   role: 'Head of Placements',      bio: '15+ years in tech recruiting',         initial: 'S', accent: 'from-violet-500 to-brand-500' },
];

const TEAM = [
  { name: 'Karthik V.',    role: 'Sr. Mentor — Data',        initial: 'K' },
  { name: 'Pooja N.',      role: 'Sr. Mentor — Cloud',       initial: 'P' },
  { name: 'Aniket R.',     role: 'Head of AI Curriculum',    initial: 'A' },
  { name: 'Sneha K.',      role: 'Frontend Lead — Platform', initial: 'S' },
  { name: 'Aditya P.',     role: 'Career Counsellor',         initial: 'A' },
  { name: 'Neha G.',       role: 'Design Director',          initial: 'N' },
  { name: 'Ravi K.',       role: 'Sr. Engineer — Platform',  initial: 'R' },
  { name: 'Priya I.',      role: 'Mentor — DevOps',          initial: 'P' },
];

export const metadata = {
  title: 'Our Team',
  description: 'Meet the team behind Grow Up More — educators, engineers, and mentors building the platform.',
};

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="The Team"
        title={<>People behind the <span className="text-gradient">platform</span></>}
        subtitle="A small, opinionated team of educators, engineers, designers and career counsellors."
      />

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Eyebrow>Leadership</Eyebrow>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {LEADERSHIP.map((p, i) => (
              <Reveal key={p.name} delay={(i % 4) * 0.06}>
                <div className="rounded-md bg-white border border-slate-200 shadow-card p-6 text-center hover:-translate-y-1 hover:shadow-cardHover transition-all">
                  <div className={`mx-auto h-24 w-24 rounded-full bg-gradient-to-br ${p.accent} text-white heading text-3xl flex items-center justify-center shadow-btn`}>{p.initial}</div>
                  <h3 className="mt-4 heading text-base text-slate-900">{p.name}</h3>
                  <p className="text-[12px] text-brand-700 font-semibold mt-0.5">{p.role}</p>
                  <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">{p.bio}</p>
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <Link href="#" className="h-8 w-8 rounded-full bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-700 flex items-center justify-center"><Linkedin className="h-3.5 w-3.5" /></Link>
                    <Link href="#" className="h-8 w-8 rounded-full bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-700 flex items-center justify-center"><Twitter className="h-3.5 w-3.5" /></Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Eyebrow>Mentors &amp; Operations</Eyebrow>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {TEAM.map((p, i) => (
              <Reveal key={p.name} delay={(i % 8) * 0.04}>
                <div className="rounded-md bg-white border border-slate-200 shadow-card p-4 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-base flex items-center justify-center">{p.initial}</div>
                  <h4 className="mt-2 text-xs font-semibold text-slate-900 leading-tight">{p.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{p.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
