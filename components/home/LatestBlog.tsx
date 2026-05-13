import Link from 'next/link';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import { BLOG_POSTS } from '@/lib/homeContent';
import { cn } from '@/lib/cn';

export function LatestBlog() {
  return (
    <section id="blog" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <Eyebrow>Latest from the Blog</Eyebrow>
              <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                Career playbooks &amp; deep technical reads
              </h2>
              <p className="mt-4 text-slate-600 max-w-md">
                Written by our mentors and recent placements — actionable, opinionated, and free.
              </p>
            </div>
            <ButtonLink href="/blog" variant="outline" size="md" className="rounded-full self-start lg:self-auto">
              All articles <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
              >
                <div className={cn('relative aspect-[16/9] bg-gradient-to-br', p.cover)}>
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                  <div aria-hidden className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute top-3 left-3 inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-brand-700 shadow-sm uppercase tracking-wider">
                    {p.category}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="heading text-lg font-semibold text-slate-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[52px]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-slate-600 line-clamp-2 min-h-[40px]">{p.excerpt}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.date}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.readMin} min</span>
                    </div>
                    <span className="text-brand-700 font-semibold inline-flex items-center gap-1">
                      Read <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">by <span className="text-slate-700 font-medium">{p.author}</span></div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
