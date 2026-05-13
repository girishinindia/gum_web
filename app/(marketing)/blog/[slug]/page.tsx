import Link from 'next/link';
import { Calendar, Clock, ChevronRight, Bookmark, Share2 } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function BlogPostPage() {
  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link><ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-brand-700">Blog</Link><ChevronRight className="h-3 w-3" />
          <span className="truncate">How to land your first Data Science job</span>
        </div>

        <article className="mt-6">
          <Eyebrow>Career · 8 min read</Eyebrow>
          <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
            How to land your first <span className="text-gradient">Data Science job</span> in India
          </h1>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-sm font-bold flex items-center justify-center">A</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">Anjali Sharma</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> 12 May 2026</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> 8 min</span>
              </div>
            </div>
            <button className="h-9 w-9 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 flex items-center justify-center"><Bookmark className="h-4 w-4" /></button>
            <button className="h-9 w-9 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 flex items-center justify-center"><Share2 className="h-4 w-4" /></button>
          </div>

          <Reveal>
            <div className="mt-8 aspect-[16/9] rounded-lg bg-gradient-to-br from-brand-600 to-accent shadow-cardHover" />
          </Reveal>

          <div className="prose prose-slate max-w-none mt-10 text-[16px] leading-[1.8] text-slate-700 space-y-5">
            <p className="text-lg text-slate-900 font-medium">Six months. That&apos;s how long it takes to go from zero programming experience to a paid Data Science role in India — if you follow the right roadmap.</p>
            <p>Most learners I meet are stuck on the same three problems: they pick courses that are too theoretical, they don&apos;t build a portfolio recruiters can browse, and they apply to roles they aren&apos;t calibrated for. This guide fixes all three.</p>

            <h2 className="heading text-2xl text-slate-900 mt-10">Month 1–2 — Foundations</h2>
            <p>Start with Python (free, in your language). Spend 90 minutes a day, six days a week. By the end of month two you should be able to solve LeetCode easy problems and pandas data-wrangling exercises without looking up syntax.</p>
            <ul className="list-disc list-outside pl-5 space-y-1.5">
              <li>Python basics + data structures</li>
              <li>NumPy &amp; pandas — fluency over speed</li>
              <li>Statistics &amp; probability — read the chapter, then code the examples</li>
            </ul>

            <h2 className="heading text-2xl text-slate-900 mt-10">Month 3–4 — Real projects</h2>
            <p>Build three projects, each shipped to GitHub with a README. Pick projects that hiring managers can grok in 60 seconds: <em>"This person took customer-support emails, clustered them by topic, and built a dashboard for ops"</em> beats <em>"This person trained a neural net on MNIST"</em> every time.</p>

            <h2 className="heading text-2xl text-slate-900 mt-10">Month 5–6 — Interview prep + applications</h2>
            <p>Apply to 5 roles per week. Customise the cover letter per company in 90 seconds (we&apos;ll cover the template in part two). Mock interviews twice a week with a peer. Aim for 25 applications → 8 first-rounds → 3 final rounds → 1 offer in the final month.</p>

            <blockquote className="border-l-4 border-brand-500 bg-brand-50/40 rounded-r-md px-5 py-4 italic text-slate-700">
              You don&apos;t need to be the best Data Scientist in your batch. You need to be the most legible one to a hiring manager who has 90 seconds to make a call.
            </blockquote>

            <h2 className="heading text-2xl text-slate-900 mt-10">Final word</h2>
            <p>Stick to the roadmap. Ship the projects. Apply at volume. Six months from now, you&apos;ll wonder why you ever doubted yourself.</p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">Was this helpful?</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-full text-sm bg-white border border-slate-200 hover:border-brand-300">👍 Yes</button>
              <button className="px-3 py-1.5 rounded-full text-sm bg-white border border-slate-200 hover:border-brand-300">👎 No</button>
            </div>
          </div>
        </article>

        <div className="mt-14 text-center">
          <ButtonLink href="/blog" variant="outline" size="md" className="rounded-full">All articles</ButtonLink>
        </div>
      </div>
    </section>
  );
}
