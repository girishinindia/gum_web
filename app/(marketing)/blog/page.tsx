import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { BLOG_POSTS } from '@/lib/homeContent';
import { cn } from '@/lib/cn';

const CATEGORIES = ['All','Career','AI / ML','Data Science','Full Stack','Cyber Security','DevOps','Stories'];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="The Grow Up More Blog"
        title={<>Career playbooks &amp; <span className="text-gradient">deep technical reads</span></>}
        subtitle="Written by our mentors and recent placements — actionable, opinionated and free."
      />

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Category chips */}
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((c, i) => (
                <button key={c} className={cn(
                  'rounded-full px-4 py-1.5 text-[12px] font-semibold border transition-all',
                  i === 0 ? 'bg-brand-500 text-white border-brand-500 shadow-btn' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:text-brand-700',
                )}>{c}</button>
              ))}
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...BLOG_POSTS, ...BLOG_POSTS, ...BLOG_POSTS].map((p, i) => (
              <Reveal key={`${p.id}-${i}`} delay={(i % 3) * 0.06}>
                <Link href={`/blog/${p.slug}`} className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all">
                  <div className={cn('relative aspect-[16/9] bg-gradient-to-br', p.cover)}>
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                    <div className="absolute top-3 left-3 inline-flex bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-brand-700 uppercase tracking-wider">{p.category}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="heading text-lg font-semibold text-slate-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[52px]">{p.title}</h3>
                    <p className="mt-2 text-[13px] text-slate-600 line-clamp-2 min-h-[40px]">{p.excerpt}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.date}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.readMin} min</span>
                      </div>
                      <span className="text-brand-700 font-semibold inline-flex items-center gap-1">Read <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" /></span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
