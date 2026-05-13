import Link from 'next/link';
import { BookOpen, Clock, Trophy, Flame, ChevronRight, PlayCircle, Calendar, ArrowRight, Award, Target } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';

const STATS = [
  { label: 'Active courses',  value: 3,  Icon: BookOpen, accent: 'from-brand-500 to-brand-700' },
  { label: 'Hours learned',   value: 42, Icon: Clock,    accent: 'from-emerald-500 to-brand-500' },
  { label: 'Streak (days)',   value: 17, Icon: Flame,    accent: 'from-amber-500 to-rose-500' },
  { label: 'Certificates',    value: 2,  Icon: Trophy,   accent: 'from-violet-500 to-brand-500' },
];

const CONTINUE = [
  { id:1, name:'Data Science with Python', module:'Module 4 · Statistics', percent:62, cover:'from-brand-700 via-brand-600 to-brand-500' },
  { id:2, name:'MERN Full-Stack',           module:'Module 7 · Auth & deployment', percent:38, cover:'from-emerald-700 via-emerald-600 to-brand-500' },
  { id:3, name:'Generative AI Builder',     module:'Module 2 · Embeddings deep-dive', percent:81, cover:'from-violet-700 via-rose-600 to-amber-500' },
];

const UPCOMING = [
  { type:'Live class', title:'GenAI RAG patterns (live)',     when:'Today · 7:00 PM' },
  { type:'Assignment', title:'Capstone — submit project draft', when:'Tomorrow · 11:59 PM' },
  { type:'Quiz',       title:'Statistics — module 4 quiz',     when:'Sat · open until Sun' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl">
      <Eyebrow>Welcome back, Anjali</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">
        Today&apos;s plan — <span className="text-gradient">3 modules left</span> to finish your weekly goal
      </h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-md bg-white border border-slate-200 shadow-card p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${s.accent} text-white shadow-btn`}><s.Icon className="h-4 w-4" /></div>
            <div className="mt-3 heading text-3xl text-slate-900">{s.value}</div>
            <div className="text-[12px] uppercase tracking-wider text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="heading text-xl text-slate-900">Continue learning</h2>
          <Link href="/my-courses" className="text-[13px] font-semibold text-brand-700 hover:underline inline-flex items-center gap-1">My courses <ChevronRight className="h-3 w-3" /></Link>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CONTINUE.map((c) => (
            <Link key={c.id} href={`/learn/${c.id}/1/1`} className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all">
              <div className={`relative aspect-[16/9] bg-gradient-to-br ${c.cover} flex items-center justify-center`}>
                <PlayCircle className="h-12 w-12 text-white/90 group-hover:scale-110 transition-transform" />
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold">{c.module}</div>
                <h3 className="mt-1 heading text-base text-slate-900 group-hover:text-brand-700 transition-colors">{c.name}</h3>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-accent rounded-full" style={{ width: c.percent + '%' }} />
                </div>
                <div className="mt-2 text-[11.5px] text-slate-500 flex justify-between"><span>{c.percent}% complete</span><span>Continue →</span></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column: Upcoming + Goals */}
      <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <h2 className="heading text-xl text-slate-900">Upcoming this week</h2>
          <ul className="mt-4 rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100">
            {UPCOMING.map((u, i) => (
              <li key={i} className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center"><Calendar className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">{u.type}</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">{u.title}</div>
                </div>
                <div className="text-[12px] text-slate-500 shrink-0">{u.when}</div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-gradient-to-br from-brand-600 to-accent text-white p-6 shadow-cardHover overflow-hidden relative">
          <div aria-hidden className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <Target className="h-9 w-9" />
          <h3 className="mt-4 heading text-2xl">Weekly goal</h3>
          <p className="mt-1 text-white/85 text-sm">Complete 6 modules · 8 hours</p>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: '50%' }} />
          </div>
          <div className="mt-2 text-[12px] text-white/85">3 of 6 modules · 4h logged</div>
          <ButtonLink href="/my-courses" variant="white" size="sm" className="mt-5 text-brand-700 rounded-full">Pick up where you left off</ButtonLink>
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-10">
        <h2 className="heading text-xl text-slate-900">Recent achievements</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {['7-day streak','First quiz','5 lessons','Module mastery','Mentor reply','Profile 100%'].map((b, i) => (
            <div key={b} className="rounded-md bg-white border border-slate-200 shadow-card p-4 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-btn"><Award className="h-5 w-5" /></div>
              <div className="mt-2 text-[12px] font-semibold text-slate-800 leading-tight">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
