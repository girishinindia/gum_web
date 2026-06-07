import Link from 'next/link';
import { Star, Users, Clock, PlayCircle, BookOpen, CheckCircle2, Award, BadgeCheck, MessageSquare, Globe, ChevronRight, Heart, ShoppingCart, Briefcase, GraduationCap, AlertCircle } from 'lucide-react';
import { ButtonLink, Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { CourseDetailTabs } from '@/components/course/CourseDetailTabs';

const SYLLABUS = [
  { name: 'Foundations', lessons: 8, hours: 6, items: ['Setup & tooling', 'Python basics', 'Data structures', 'Functions & modules', 'Error handling', 'I/O', 'Standard library', 'Mini project'] },
  { name: 'Data wrangling with pandas', lessons: 10, hours: 9, items: ['Series & DataFrame', 'Indexing', 'Cleaning data', 'Joins & merges', 'Group by', 'Time series', 'Visualization', 'Capstone exercise 1', 'Capstone exercise 2', 'Quiz'] },
  { name: 'Machine learning basics', lessons: 12, hours: 14 },
  { name: 'Real-world projects', lessons: 6, hours: 10 },
  { name: 'Career prep + placement', lessons: 4, hours: 6 },
];

const INCLUDES = [
  { icon: PlayCircle, label: '64 lessons · 45h of video' },
  { icon: BookOpen,   label: '12 hands-on projects' },
  { icon: Award,      label: 'Verified certificate' },
  { icon: MessageSquare, label: 'Mentor support · Mon–Sat' },
  { icon: Globe,      label: 'Hindi + English captions' },
];

export default function CourseDetailPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-10 sm:pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/courses" className="hover:text-brand-700">Courses</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Data Science with Python</span>
          </div>

          <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-10">
            <div>
              <Eyebrow>Data Science · Beginner</Eyebrow>
              <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                Data Science with Python — <span className="text-gradient">end-to-end roadmap</span>
              </h1>
              <p className="mt-4 text-slate-600 max-w-2xl">
                From Python basics to production ML — taught in Hindi + English, with 12 real projects and 1:1 mentor reviews.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800"><Star className="h-4 w-4 fill-warn text-warn" /> 4.8 (2,431 reviews)</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> 12,840 enrolled</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> 8 weeks · 45h</span>
                <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4" /> Hindi / English</span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading flex items-center justify-center shadow-btn">AS</div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Anjali Sharma</div>
                  <div className="text-[11px] text-slate-500">Lead Data Scientist · ex-Flipkart</div>
                </div>
              </div>
            </div>

            {/* Purchase card */}
            <Reveal>
              <div className="relative rounded-md bg-white border border-slate-200 shadow-cardHover overflow-hidden lg:sticky lg:top-24 self-start">
                <div className="aspect-video relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center">
                  <button aria-label="Preview" className="h-16 w-16 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-cardHover hover:scale-105 transition-transform">
                    <PlayCircle className="h-8 w-8 text-brand-700" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-baseline gap-2">
                    <span className="heading text-3xl text-slate-900">₹29,999</span>
                    <span className="text-sm text-slate-400 line-through">₹49,999</span>
                    <span className="ml-auto text-[11px] font-bold bg-success/15 text-success rounded-full px-2 py-0.5">40% OFF</span>
                  </div>
                  <p className="mt-1 text-[11px] text-rose-600 font-semibold">⏱ Early-bird ends in 3d 14h</p>

                  <div className="mt-4 space-y-2.5">
                    <Button variant="primary" className="w-full rounded-full"><ShoppingCart className="h-4 w-4" /> Add to cart</Button>
                    <Button variant="outline" className="w-full rounded-full">Buy now</Button>
                    <button className="w-full text-sm text-slate-600 hover:text-brand-700 inline-flex items-center justify-center gap-1.5"><Heart className="h-4 w-4" /> Save to wishlist</button>
                  </div>

                  <ul className="mt-5 space-y-2.5 pt-5 border-t border-slate-100">
                    {INCLUDES.map((b) => (
                      <li key={b.label} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <b.icon className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" /> {b.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Sticky tab bar */}
      <CourseDetailTabs instructorName="Anjali Sharma" instructorInitials="AS" />

      {/* What you'll learn */}
      <section id="overview" className="py-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">What you&apos;ll learn</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {['Master pandas, NumPy & matplotlib','Build ML models end-to-end','Deploy to production with FastAPI','Crack data science interviews','Real-world capstone projects','Statistics & probability deep-dive'].map((t) => (
              <div key={t} className="flex items-start gap-2.5 rounded-md bg-white border border-slate-200 p-4 shadow-card text-sm text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syllabus accordion */}
      <section id="syllabus" className="py-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">Syllabus</h2>
          <div className="mt-2 text-sm text-slate-500">5 modules · 40 lessons · 45 hours</div>
          <div className="mt-6 space-y-3">
            {SYLLABUS.map((m, i) => (
              <details key={m.name} open={i === 0} className="group rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between hover:bg-brand-50/30">
                  <div>
                    <div className="heading text-base text-slate-900">Module {i + 1} · {m.name}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{m.lessons} lessons · {m.hours}h</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                {m.items && (
                  <ul className="px-5 pb-4 pt-1 space-y-2 border-t border-slate-100">
                    {m.items.map((it) => (
                      <li key={it} className="text-sm text-slate-600 flex items-center gap-2"><PlayCircle className="h-3.5 w-3.5 text-brand-500" /> {it}</li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section id="requirements" className="py-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">Requirements</h2>
          <ul className="mt-6 space-y-3">
            {[
              'No prior programming experience needed — we start from scratch',
              'A laptop or PC with internet access',
              'Basic understanding of English or Hindi (course is bilingual)',
              'Willingness to practice 1–2 hours daily for best results',
              'Google Colab account (free) — no expensive hardware required',
            ].map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm text-slate-700">
                <AlertCircle className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" /> {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews summary */}
      <section id="reviews" className="py-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">Student feedback</h2>
          <div className="mt-6 grid lg:grid-cols-[300px_1fr] gap-8">
            <div className="rounded-md bg-white border border-slate-200 shadow-card p-6 text-center">
              <div className="heading text-5xl text-gradient">4.8</div>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-warn text-warn" />)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">2,431 reviews</div>
              <div className="mt-5 space-y-1.5">
                {[5,4,3,2,1].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="w-3">{s}★</span>
                    <span className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <span className="block h-full bg-warn rounded-full" style={{ width: [78,15,5,1,1][i] + '%' }} />
                    </span>
                    <span className="w-8 text-right">{[78,15,5,1,1][i]}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { n:'Rohan M.', when:'2 days ago', text:'Excellent breakdown of concepts in Hindi. The capstone project landed me my first interview.' },
                { n:'Sneha K.', when:'1 week ago', text:'Mentor reviews on every assignment were the highlight — really pushed me to ship things.' },
                { n:'Karthik V.', when:'2 weeks ago', text:'I tried 3 other Data Science courses before this. None covered statistics this clearly.' },
              ].map((r) => (
                <div key={r.n} className="rounded-md bg-white border border-slate-200 shadow-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-sm font-bold flex items-center justify-center">{r.n[0]}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{r.n}</div>
                        <div className="text-[11px] text-slate-500">{r.when}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-warn text-warn" />)}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">&ldquo;{r.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructor detail */}
      <section id="instructor" className="py-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">About the instructor</h2>
          <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card p-6 flex flex-col sm:flex-row items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-3xl flex items-center justify-center shadow-cardHover shrink-0">AS</div>
            <div className="flex-1">
              <h3 className="heading text-xl text-slate-900">Anjali Sharma</h3>
              <p className="text-sm text-brand-700 font-semibold mt-0.5">Lead Data Scientist · ex-Flipkart</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-warn text-warn" /> 4.9 Instructor rating</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> 28,400 students</span>
                <span className="inline-flex items-center gap-1.5"><PlayCircle className="h-4 w-4" /> 5 courses</span>
                <span className="inline-flex items-center gap-1.5"><Award className="h-4 w-4" /> 12 years experience</span>
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Anjali Sharma is a Lead Data Scientist with 12 years of industry experience spanning Flipkart, Amazon, and two AI startups. She has trained over 28,000 students across India in Python, machine learning, and data engineering. Known for her Hindi-first teaching style and hands-on capstone projects that mirror real company workflows.
              </p>
              <ButtonLink href="/instructors/anjali-sharma" variant="outline" size="sm" className="mt-4 rounded-full">
                View full profile
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Career outcomes */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">Career outcomes</h2>
          <p className="mt-2 text-sm text-slate-500">Roles our graduates land after completing this course</p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role: 'Data Analyst', salary: '₹6–12 LPA', desc: 'Analyse business data, build dashboards, deliver insights to stakeholders.' },
              { role: 'ML Engineer', salary: '₹10–20 LPA', desc: 'Build and deploy machine learning models in production environments.' },
              { role: 'Data Scientist', salary: '₹8–18 LPA', desc: 'Combine statistics, programming & domain expertise to solve business problems.' },
              { role: 'BI Analyst', salary: '₹5–10 LPA', desc: 'Create reports and visualisations that drive data-informed decisions.' },
              { role: 'Analytics Consultant', salary: '₹8–15 LPA', desc: 'Advise companies on data strategy, KPIs, and experimentation frameworks.' },
              { role: 'AI Product Manager', salary: '₹12–25 LPA', desc: 'Define and ship AI-powered products with cross-functional teams.' },
            ].map((c) => (
              <div key={c.role} className="rounded-md bg-white border border-slate-200 shadow-card p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700 mb-3">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="heading text-base text-slate-900">{c.role}</h3>
                <p className="text-[12px] font-semibold text-brand-600 mt-0.5">{c.salary}</p>
                <p className="text-sm text-slate-500 mt-2">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related courses */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">Related courses</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Machine Learning A-Z',      tag: 'AI & ML',          price: '₹24,999', cover: 'from-violet-700 to-brand-500' },
              { name: 'Generative AI Builder',      tag: 'Gen AI',           price: '₹22,999', cover: 'from-rose-600 to-amber-500' },
              { name: 'Cloud & DevOps Bootcamp',    tag: 'Cloud Computing',  price: '₹19,999', cover: 'from-emerald-700 to-brand-500' },
              { name: 'Statistics for Data Science', tag: 'Data Science',    price: 'Free',     cover: 'from-brand-600 to-violet-500' },
            ].map((c) => (
              <Link key={c.name} href="/courses" className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all">
                <div className={`aspect-video bg-gradient-to-br ${c.cover} flex items-center justify-center`}>
                  <GraduationCap className="h-8 w-8 text-white/80" />
                </div>
                <div className="p-4">
                  <div className="text-[10.5px] font-bold text-brand-600 uppercase tracking-wider">{c.tag}</div>
                  <h3 className="mt-1 heading text-sm text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">{c.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{c.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <BadgeCheck className="h-10 w-10 text-brand-600 mx-auto" />
          <h2 className="mt-4 heading text-3xl sm:text-4xl text-slate-900">Start your Data Science journey today</h2>
          <p className="mt-3 text-slate-600">Lifetime access · Verified certificate · Placement assistance</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <ButtonLink href="#" variant="primary" size="lg" className="rounded-full">Enroll Now</ButtonLink>
            <ButtonLink href="/courses" variant="outline" size="lg" className="rounded-full">Browse more</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
