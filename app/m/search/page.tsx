'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, X, TrendingUp, Clock, BookOpen, UserSquare2, Radio, FileText, type LucideIcon } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const TRENDING = ['Python', 'AI', 'Full Stack', 'Hindi courses', 'Cloud', 'Cyber Security'];
const RECENT   = ['Generative AI', 'Data Science roadmap', 'Refund policy'];

const SUGGESTIONS: { Icon: LucideIcon; label: string; sub: string; href: string }[] = [
  { Icon: BookOpen,    label: 'Data Science with Python',  sub: 'Course · 4.8 ★ · 12k+ enrolled', href: '/m/courses/data-science-foundations' },
  { Icon: BookOpen,    label: 'AI & Machine Learning Pro', sub: 'Course · 4.9 ★ · 8k enrolled',   href: '/m/courses/ai-machine-learning'      },
  { Icon: UserSquare2, label: 'Aniket Rao',                sub: 'Instructor · AI / ML',          href: '/m/instructors/1'                    },
  { Icon: Radio,       label: 'Generative AI for Beginners',sub: 'Webinar · Sat 7 PM',           href: '/m/webinars/1'                       },
  { Icon: FileText,    label: 'Building RAG agents in 2026',sub: 'Blog · 12 min read',           href: '/m/blog/building-rag-agents-in-2026' },
];

export default function MobileSearchPage() {
  const [q, setQ] = useState('');

  return (
    <div>
      <MobilePageHeader title="Search" subtitle="Courses, mentors, blog & more" />

      {/* Search input */}
      <div className="px-3">
        <div className="flex items-center gap-2 rounded-full bg-white border-2 border-brand-200 px-3 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-brand-600" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="What do you want to learn?"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear" className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-all">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trending — visible when no query */}
      {!q && (
        <>
          <section className="px-4 mt-5">
            <h2 className="heading text-[13px] font-bold text-slate-900 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-brand-600" /> Trending</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <button
                  key={t}
                  onClick={() => setQ(t)}
                  className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 active:scale-95 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section className="px-4 mt-5">
            <h2 className="heading text-[13px] font-bold text-slate-900 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-500" /> Recent</h2>
            <ul className="mt-2 space-y-0.5">
              {RECENT.map((r) => (
                <li key={r}>
                  <button onClick={() => setQ(r)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13px] text-slate-700 active:bg-brand-50">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="flex-1 text-left">{r}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Suggestions when typing */}
      {q && (
        <section className="px-3 mt-3">
          <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-1">Results for &ldquo;{q}&rdquo;</div>
          <ul className="rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
            {SUGGESTIONS.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className="flex items-center gap-3 p-3 active:bg-brand-50">
                  <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <s.Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">{s.label}</div>
                    <div className="text-[10.5px] text-slate-500 truncate">{s.sub}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
