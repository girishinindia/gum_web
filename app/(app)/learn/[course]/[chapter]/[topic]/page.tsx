import Link from 'next/link';
import { ChevronLeft, ChevronRight, PlayCircle, CheckCircle2, Circle, Lock, Download, MessageSquare, BookOpen, FileText, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SyllabusItem {
  name:    string;
  mins:    string;
  done:    boolean;
  current: boolean;
  type?:   string;
  locked?: boolean;
}

const SYLLABUS: { name: string; items: SyllabusItem[] }[] = [
  { name:'Module 1 · Foundations', items:[
    { name:'Setup & tooling', mins:'12 min', done:true,  current:false },
    { name:'Python basics',   mins:'18 min', done:true,  current:false },
    { name:'Data structures', mins:'22 min', done:false, current:true  },
    { name:'Functions',       mins:'15 min', done:false, current:false },
    { name:'Module quiz',     mins:'10 min', done:false, current:false, type:'quiz' },
  ]},
  { name:'Module 2 · Data wrangling', items:[
    { name:'pandas intro',     mins:'24 min', done:false, current:false, locked:true },
    { name:'DataFrames',       mins:'30 min', done:false, current:false, locked:true },
  ]},
];

const TABS = ['Overview','Resources','Discussion','Notes'];

export default function LearnPage() {
  return (
    <div className="max-w-[1400px] grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Player + tabs */}
      <div>
        <Link href="/my-courses" className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 hover:text-brand-700"><ChevronLeft className="h-3.5 w-3.5" /> My courses</Link>

        <div className="mt-3 aspect-video rounded-lg bg-gradient-to-br from-slate-800 via-slate-900 to-brand-900 flex items-center justify-center relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.15),_transparent_55%)]" />
          <button className="h-20 w-20 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-cardHover hover:scale-105 transition-transform">
            <PlayCircle className="h-10 w-10 text-brand-700" />
          </button>
          <div className="absolute bottom-3 left-3 right-3 text-white/85 text-[11.5px] flex items-center gap-2">
            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-brand-400" style={{ width: '38%' }} /></div>
            <span>8:24 / 22:10</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-wider text-brand-700 font-semibold">Module 1 · Lesson 3</div>
          <h1 className="mt-1 heading text-2xl sm:text-3xl text-slate-900">Data structures in Python</h1>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="outline" className="rounded-full"><ChevronLeft className="h-4 w-4" /> Previous</Button>
            <Button variant="primary" className="rounded-full">Mark complete · Next <ChevronRight className="h-4 w-4" /></Button>
          </div>

          {/* Tab strip */}
          <div className="mt-7 border-b border-slate-200 flex items-center gap-1">
            {TABS.map((t, i) => (
              <button key={t} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${i === 0 ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-brand-700'}`}>{t}</button>
            ))}
          </div>

          <div className="mt-6 grid lg:grid-cols-[1fr_240px] gap-6">
            <article className="prose prose-slate max-w-none text-[15px] leading-[1.75] text-slate-700 space-y-3">
              <p>In this lesson, we cover Python&apos;s four built-in collection types — <em>list, tuple, dict, set</em> — when to reach for each, and the common pitfalls beginners hit.</p>
              <h3 className="heading text-lg text-slate-900 mt-5">Learning outcomes</h3>
              <ul className="list-disc list-outside pl-5 space-y-1.5">
                <li>Pick the right collection type for the job</li>
                <li>Understand mutability vs immutability</li>
                <li>Iterate efficiently with list comprehensions</li>
              </ul>
            </article>

            <aside className="space-y-3">
              {[
                { Icon: FileText,    label: 'Slides — PDF',     hint: '2.4 MB' },
                { Icon: Download,    label: 'Notebook (Colab)', hint: 'Open' },
                { Icon: Bookmark,    label: 'Add bookmark',     hint: '+' },
                { Icon: MessageSquare, label: 'Ask the mentor', hint: 'Open chat' },
              ].map((a) => (
                <button key={a.label} className="w-full rounded-md bg-white border border-slate-200 hover:border-brand-300 p-3 flex items-center gap-3 text-left transition-colors">
                  <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center"><a.Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{a.label}</div>
                    <div className="text-[11px] text-slate-500">{a.hint}</div>
                  </div>
                </button>
              ))}
            </aside>
          </div>
        </div>
      </div>

      {/* Syllabus sidebar */}
      <aside className="rounded-md bg-white border border-slate-200 shadow-card p-4 lg:sticky lg:top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">Course content</div>
        <h2 className="heading text-base text-slate-900">Data Science with Python</h2>
        <div className="mt-1 text-[11px] text-slate-500">5 modules · 40 lessons · 45h</div>

        <div className="mt-4 space-y-4">
          {SYLLABUS.map((m) => (
            <div key={m.name}>
              <div className="text-[12.5px] font-semibold text-slate-800 px-2">{m.name}</div>
              <ul className="mt-1.5 space-y-0.5">
                {m.items.map((it) => (
                  <li key={it.name}>
                    <button className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-left transition-colors text-[13px] ${it.current ? 'bg-brand-50 text-brand-700 font-semibold' : it.locked ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'}`}>
                      {it.done ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" /> : it.locked ? <Lock className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                      <span className="flex-1 truncate">{it.name}</span>
                      <span className="text-[10.5px] text-slate-400">{it.mins}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
