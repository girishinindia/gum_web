import Link from 'next/link';
import { Video, Clock, Users, ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { UPCOMING_WEBINARS } from '@/lib/homeContent';
import { cn } from '@/lib/cn';

export default function LiveSessionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Live Sessions"
        title={<>Real-time learning with <span className="text-gradient">industry experts</span></>}
        subtitle="Join interactive live sessions, ask questions, and learn alongside a community of peers."
      />

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {UPCOMING_WEBINARS.map((w, i) => (
              <Reveal key={w.id} delay={(i % 4) * 0.06}>
                <Link
                  href={`/webinars/${w.id}`}
                  className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
                >
                  <div className={cn('relative h-28 bg-gradient-to-br', w.cover)}>
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-rose-600 shadow-sm">
                      <Video className="h-3 w-3 animate-pulse" /> LIVE
                    </div>
                    <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-black/40 backdrop-blur text-white rounded-full px-2.5 py-1 text-[10.5px] font-semibold">
                      <Clock className="h-3 w-3" /> {w.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="heading text-[15px] font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors min-h-[40px]">
                      {w.title}
                    </h3>
                    <div className="mt-1.5 text-[12px] text-slate-500">by {w.host}</div>
                    <div className="mt-3 flex items-center justify-between text-[11.5px] text-slate-500 pt-3 border-t border-slate-100">
                      <span>{w.date} · {w.time}</span>
                      <span className="inline-flex items-center gap-1 text-brand-700 font-semibold">
                        <Users className="h-3 w-3" /> Reserve <ArrowRight className="h-3 w-3" />
                      </span>
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
