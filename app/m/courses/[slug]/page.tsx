import { Star, Users, Clock, PlayCircle, BookOpen, CheckCircle2, Award, Heart, Share2, ChevronRight, MessageSquare, Globe } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

export default function MobileCourseDetail() {
  return (
    <div>
      <MobilePageHeader
        title="Data Science with Python"
        subtitle="Course details"
        action={
          <button
            type="button"
            aria-label="Share"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all"
          >
            <Share2 className="h-4 w-4" />
          </button>
        }
      />

      {/* Hero cover */}
      <div className="px-3">
        <div className="relative aspect-video rounded-md bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center overflow-hidden">
          <button aria-label="Preview" className="h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-cardHover active:scale-95 transition-all">
            <PlayCircle className="h-7 w-7 text-brand-700" />
          </button>
          <div className="absolute top-2 left-2 bg-white/95 text-[9.5px] font-bold text-brand-700 rounded-full px-2 py-0.5">हिन्दी में</div>
        </div>
      </div>

      <section className="px-4 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Data Science · Beginner</div>
        <h1 className="mt-1 heading text-2xl text-slate-900 leading-tight">Data Science with Python — end-to-end roadmap</h1>
        <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">From Python basics to production ML — taught in Hindi + English, with 12 real projects and 1:1 mentor reviews.</p>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Star className="h-3 w-3 fill-warn text-warn" /> 4.8 (2,431)</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> 12,840</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> 8 weeks · 45h</span>
          <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> Hindi / English</span>
        </div>

        {/* Instructor row */}
        <div className="mt-4 flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-sm font-bold flex items-center justify-center">AS</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-900">Anjali Sharma</div>
            <div className="text-[10.5px] text-slate-500">Lead Data Scientist · ex-Flipkart</div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </section>

      {/* What you'll learn */}
      <section className="px-4 mt-5">
        <h2 className="heading text-[15px] font-bold text-slate-900">What you&apos;ll learn</h2>
        <ul className="mt-2 space-y-1.5">
          {['Master pandas, NumPy & matplotlib','Build ML models end-to-end','Deploy to production with FastAPI','Crack data science interviews'].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[12.5px] text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Syllabus accordion */}
      <section className="px-4 mt-5">
        <h2 className="heading text-[15px] font-bold text-slate-900">Syllabus</h2>
        <div className="mt-2 text-[11px] text-slate-500">5 modules · 40 lessons · 45h</div>
        <div className="mt-3 space-y-2">
          {[
            { name:'Foundations', lessons:8, hours:6 },
            { name:'Data wrangling with pandas', lessons:10, hours:9 },
            { name:'Machine learning basics', lessons:12, hours:14 },
            { name:'Real-world projects', lessons:6, hours:10 },
            { name:'Career prep + placement', lessons:4, hours:6 },
          ].map((m, i) => (
            <details key={m.name} open={i === 0} className="group rounded-md bg-white border border-slate-200">
              <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between">
                <div>
                  <div className="heading text-[13px] text-slate-900">Module {i + 1} · {m.name}</div>
                  <div className="text-[10.5px] text-slate-500 mt-0.5">{m.lessons} lessons · {m.hours}h</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <ul className="px-3 pb-2 pt-0.5 border-t border-slate-100 space-y-1">
                {Array.from({ length: 4 }).map((_, k) => (
                  <li key={k} className="flex items-center gap-2 text-[12px] text-slate-600 py-1">
                    <PlayCircle className="h-3.5 w-3.5 text-brand-500" />
                    <span className="flex-1 truncate">Lesson topic {k + 1}</span>
                    <span className="text-[10px] text-slate-400">12 min</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="px-4 mt-5">
        <h2 className="heading text-[15px] font-bold text-slate-900">What&apos;s included</h2>
        <ul className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-slate-700">
          {[
            { Icon: PlayCircle,    label: '45h video' },
            { Icon: BookOpen,      label: '12 projects' },
            { Icon: Award,         label: 'Certificate' },
            { Icon: MessageSquare, label: 'Mentor support' },
          ].map((b) => (
            <li key={b.label} className="flex items-center gap-2 rounded-md bg-white border border-slate-200 p-2.5">
              <b.Icon className="h-4 w-4 text-brand-600" /> {b.label}
            </li>
          ))}
        </ul>
      </section>

      {/* Sticky bottom Enroll bar */}
      <div className="fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/70 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="heading text-lg text-slate-900">₹29,999</span>
              <span className="text-[10.5px] text-slate-400 line-through">₹49,999</span>
              <span className="text-[9.5px] font-bold bg-success/15 text-success rounded-full px-1.5 py-0.5">40% OFF</span>
            </div>
            <div className="text-[10.5px] text-rose-600 font-semibold">⏱ Early-bird ends 3d 14h</div>
          </div>
          <button aria-label="Wishlist" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all">
            <Heart className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all">
            Enroll
          </button>
        </div>
      </div>

      {/* Spacer so content doesn't sit behind the sticky bar */}
      <div className="h-24" />
    </div>
  );
}
