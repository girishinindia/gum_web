import { MapPin, Briefcase, GraduationCap, Award, Linkedin, Github, Twitter, Globe } from 'lucide-react';
import Link from 'next/link';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function PublicProfilePage() {
  return (
    <div className="max-w-5xl">
      <div className="rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-brand-700 via-brand-600 to-accent" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-5">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-3xl flex items-center justify-center border-4 border-white shadow-cardHover">A</div>
            <div className="mt-3 sm:mt-0 flex-1">
              <h1 className="heading text-2xl text-slate-900">Anjali Sharma</h1>
              <p className="text-sm text-slate-500">Data Analyst · ex-Grow Up More cohort 12</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-slate-500">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Bengaluru, India</span>
                <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" /> Flipkart</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[Linkedin,Github,Twitter,Globe].map((I, i) => (
                <Link key={i} href="#" className="h-9 w-9 rounded-full bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-700 flex items-center justify-center"><I className="h-4 w-4" /></Link>
              ))}
            </div>
          </div>

          <div className="mt-7 grid sm:grid-cols-2 gap-5">
            <section>
              <Eyebrow>About</Eyebrow>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">Data analyst with a focus on retail &amp; recommendation systems. Came to data from a non-CS background — Hindi-first learner, now mentor for 4 cohorts.</p>
            </section>
            <section>
              <Eyebrow>Skills</Eyebrow>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Python','SQL','pandas','dbt','Looker','PowerBI','Tableau','Statistics'].map((s) => (
                  <span key={s} className="rounded-full bg-brand-50 text-brand-700 text-[12px] font-semibold px-2.5 py-1">{s}</span>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-7">
            <Eyebrow>Experience</Eyebrow>
            <ul className="mt-3 space-y-3">
              {[
                { role:'Data Analyst', org:'Flipkart',    when:'2025 – Now', Icon:Briefcase },
                { role:'Data Intern',  org:'Razorpay',    when:'2024 – 2025', Icon:Briefcase },
                { role:'B.Sc Stats',   org:'Mumbai Univ', when:'2020 – 2024', Icon:GraduationCap },
              ].map((x, i) => (
                <li key={i} className="rounded-md bg-slate-50 border border-slate-200 p-3 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-white text-brand-700 flex items-center justify-center shadow-card"><x.Icon className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{x.role}</div>
                    <div className="text-[12px] text-slate-500">{x.org} · {x.when}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-7">
            <Eyebrow>Certificates</Eyebrow>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {['Data Science with Python','Generative AI Builder'].map((c) => (
                <div key={c} className="rounded-md bg-white border border-slate-200 shadow-card p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white flex items-center justify-center"><Award className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{c}</div>
                    <div className="text-[11px] text-brand-700 font-semibold">Verified by Grow Up More</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
