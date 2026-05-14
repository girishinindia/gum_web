import Link from 'next/link';
import { Star, Users, BookOpen, BadgeCheck, Linkedin, Twitter, Globe } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const COURSES = [
  { id:1, slug:'ai-machine-learning',  name:'AI & Machine Learning Pro',  rating:4.9, students:'8.4k', cover:'from-brand-700 to-brand-500' },
  { id:2, slug:'generative-ai-builder',name:'Generative AI Builder',      rating:4.9, students:'4.2k', cover:'from-violet-700 to-rose-500' },
  { id:3, slug:'ml-system-design',     name:'ML System Design',           rating:4.8, students:'2.1k', cover:'from-emerald-700 to-brand-500' },
];

export default function MobileInstructorDetail() {
  return (
    <div>
      <MobilePageHeader title="Aniket Rao" />

      <div className="px-4 pt-2 text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white heading text-3xl flex items-center justify-center shadow-cardHover">AR</div>
        <h1 className="mt-3 heading text-xl text-slate-900">Aniket Rao</h1>
        <p className="text-[12px] text-slate-500">Sr. ML Engineer · ex-Google</p>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 text-[11px] font-bold">
          <BadgeCheck className="h-3 w-3" /> Top Rated
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {[
            { Icon: BookOpen, value: '8',    label: 'Courses' },
            { Icon: Users,    value: '24k+', label: 'Students' },
            { Icon: Star,     value: '4.9',  label: 'Rating' },
          ].map((s) => (
            <div key={s.label} className="rounded-md bg-white border border-slate-200 p-2">
              <s.Icon className="h-3.5 w-3.5 text-brand-600 mx-auto" />
              <div className="heading text-sm text-slate-900 mt-0.5">{s.value}</div>
              <div className="text-[9.5px] text-slate-500 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          {[Linkedin, Twitter, Globe].map((I, i) => (
            <Link key={i} href="#" className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center active:scale-95 transition-all">
              <I className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <section className="px-4 mt-5">
        <h2 className="heading text-[14px] font-bold text-slate-900">About</h2>
        <p className="mt-1 text-[12.5px] text-slate-700 leading-relaxed">
          Aniket led recommendation systems at YouTube for 5 years, then went on to build the ML platform at 3 successful startups (2 acquired).
        </p>

        <h3 className="heading text-[13px] font-bold text-slate-900 mt-4">Expertise</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['Deep Learning','RAG / LLMs','MLOps','PyTorch','Vector DBs','LangChain'].map((t) => (
            <span key={t} className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[11px] text-slate-700">{t}</span>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5 pb-4">
        <h2 className="heading text-[14px] font-bold text-slate-900">Courses by Aniket</h2>
        <ul className="mt-2 space-y-2">
          {COURSES.map((c) => (
            <li key={c.id}>
              <Link href={`/m/courses/${c.slug}`} className="flex gap-3 p-3 rounded-md bg-white border border-slate-200 shadow-card active:scale-[0.98] transition-all">
                <div className={`h-16 w-16 rounded-md bg-gradient-to-br ${c.cover} shrink-0 flex items-center justify-center text-white`}>
                  <BookOpen className="h-5 w-5 opacity-90" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="heading text-[13px] font-bold text-slate-900 line-clamp-2">{c.name}</h3>
                  <div className="mt-1 flex items-center gap-3 text-[10.5px] text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700"><Star className="h-2.5 w-2.5 fill-warn text-warn" /> {c.rating}</span>
                    <span>{c.students} students</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
