import Link from 'next/link';
import { Calendar, Clock, Radio, ArrowRight, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import { UPCOMING_WEBINARS } from '@/lib/homeContent';
import { cn } from '@/lib/cn';

export function UpcomingWebinars() {
  return (
    <section id="webinars" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <Eyebrow>
                <span className="inline-flex items-center gap-1.5">
                  <Radio className="h-3 w-3 text-rose-500 animate-pulse" /> Upcoming Webinars
                </span>
              </Eyebrow>
              <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                Free live sessions with top mentors
              </h2>
              <p className="mt-4 text-slate-600 max-w-md">
                Hop on a live class this week — career roadmaps, hands-on coding and Q&amp;A with industry experts.
              </p>
            </div>
            <ButtonLink href="/webinars" variant="outline" size="md" className="rounded-full self-start lg:self-auto">
              See all webinars <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {UPCOMING_WEBINARS.map((w, i) => (
            <Reveal key={w.id} delay={(i % 4) * 0.06}>
              <Link
                href={`/webinars/${w.id}`}
                className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
              >
                <div className={cn('relative aspect-[16/10] bg-gradient-to-br', w.cover)}>
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                  <div aria-hidden className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-rose-600 shadow-sm">
                    <Radio className="h-3 w-3 animate-pulse" /> LIVE
                  </div>
                  <div className={cn(
                    'absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold shadow-sm',
                    w.tag === 'Free' ? 'bg-success/90 text-white' : 'bg-amber-500/95 text-white',
                  )}>
                    {w.tag === 'Free' ? <Sparkles className="h-3 w-3" /> : null} {w.tag}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[10px] font-mono tracking-widest opacity-80 uppercase">Hosted by</div>
                    <div className="heading text-sm leading-tight mt-0.5">{w.host}</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="heading text-[15px] font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors min-h-[40px]">
                    {w.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-[11.5px] text-slate-500 pt-3 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {w.date}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {w.time}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-brand-700 font-semibold inline-flex items-center gap-1">
                    {w.duration} · Reserve seat <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
