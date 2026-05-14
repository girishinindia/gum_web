import { Bookmark, Share2, Calendar, Clock } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

export default function MobileBlogPost() {
  return (
    <div>
      <MobilePageHeader
        title="Career"
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

      <article className="px-4 pt-2 pb-6">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-brand-700">Career · 8 min read</div>
        <h1 className="mt-1 heading text-2xl text-slate-900 leading-tight">
          How to land your first <span className="text-gradient">Data Science job</span> in India
        </h1>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-xs font-bold flex items-center justify-center">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-slate-900">Anjali Sharma</div>
            <div className="text-[10.5px] text-slate-500 flex items-center gap-2">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> 12 May 2026</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> 8 min</span>
            </div>
          </div>
          <button className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-700 inline-flex items-center justify-center active:scale-95 transition-all">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 aspect-[16/9] rounded-md bg-gradient-to-br from-brand-600 to-accent" />

        <div className="mt-5 space-y-3 text-[14px] leading-[1.7] text-slate-700">
          <p className="text-[14px] text-slate-900 font-medium">Six months. That&apos;s how long it takes to go from zero programming experience to a paid Data Science role in India — if you follow the right roadmap.</p>
          <p>Most learners I meet are stuck on the same three problems: they pick courses that are too theoretical, they don&apos;t build a portfolio recruiters can browse, and they apply to roles they aren&apos;t calibrated for. This guide fixes all three.</p>

          <h2 className="heading text-lg text-slate-900 mt-5">Month 1–2 — Foundations</h2>
          <p>Start with Python (free, in your language). Spend 90 minutes a day, six days a week. By the end of month two you should be able to solve LeetCode easy problems and pandas data-wrangling exercises without looking up syntax.</p>

          <h2 className="heading text-lg text-slate-900 mt-5">Month 3–4 — Real projects</h2>
          <p>Build three projects, each shipped to GitHub with a README. Pick projects that hiring managers can grok in 60 seconds.</p>

          <blockquote className="border-l-4 border-brand-500 bg-brand-50/40 rounded-r-md px-4 py-3 italic text-slate-700 text-[13.5px]">
            You don&apos;t need to be the best Data Scientist in your batch. You need to be the most legible one.
          </blockquote>

          <h2 className="heading text-lg text-slate-900 mt-5">Final word</h2>
          <p>Stick to the roadmap. Ship the projects. Apply at volume. Six months from now, you&apos;ll wonder why you doubted yourself.</p>
        </div>
      </article>
    </div>
  );
}
