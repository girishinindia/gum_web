import Link from 'next/link';
import { ArrowRight, Layers, Users, Star, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import { BUNDLES } from '@/lib/homeContent';
import { cn } from '@/lib/cn';
import type { Bundle } from '@/lib/api';

function inr(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

const COVER_GRADIENTS = [
  'from-brand-700 via-brand-600 to-brand-500',
  'from-emerald-700 via-emerald-600 to-brand-500',
  'from-violet-700 via-rose-600 to-amber-500',
];

function toCard(b: Bundle, idx: number) {
  const price = b.price ?? 0;
  const originalPrice = b.original_price ?? price;
  const savePercent = b.discount_percent ?? (originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0);
  return {
    id:           b.id,
    slug:         b.slug,
    name:         b.name,
    desc:         b.description ?? '',
    courseCount:   b.course_count ?? 0,
    students:     b.student_count ?? 0,
    rating:       b.rating_average ?? 0,
    price,
    originalPrice,
    savePercent,
    cover:        b.thumbnail_url || COVER_GRADIENTS[idx % COVER_GRADIENTS.length],
    hasThumbnail: !!b.thumbnail_url,
  };
}

interface Props { data?: Bundle[] | null }

export function Bundles({ data }: Props) {
  return (
    <section id="bundles" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <Eyebrow>Bundles &amp; Savings</Eyebrow>
              <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                Career packs that save you <span className="text-gradient">up to 54%</span>
              </h2>
              <p className="mt-4 text-slate-600 max-w-md">
                Curated multi-course bundles built for specific career outcomes — one purchase, one structured roadmap.
              </p>
            </div>
            <ButtonLink href="/bundles" variant="outline" size="md" className="rounded-full self-start lg:self-auto">
              All bundles <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data && data.length > 0 ? data.map((b, i) => toCard(b, i)) : BUNDLES.map(b => ({ ...b, hasThumbnail: false }))).map((b, i) => (
            <Reveal key={b.id} delay={(i % 3) * 0.08}>
              <Link
                href={`/bundles/${b.slug}`}
                className="group relative block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
              >
                {/* Save banner ribbon */}
                <div className="absolute top-0 right-0 z-10 bg-gradient-to-br from-rose-500 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-md shadow-md">
                  SAVE {b.savePercent}%
                </div>

                {b.hasThumbnail ? (
                  <div className="relative h-32 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.cover} alt={b.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="relative h-full flex items-end p-5">
                      <div className="text-white drop-shadow-md">
                        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider">
                          <Layers className="h-3 w-3" /> {b.courseCount} courses
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={cn('relative h-32 bg-gradient-to-br', b.cover)}>
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                    <div aria-hidden className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative h-full flex items-end p-5">
                      <div className="text-white">
                        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider">
                          <Layers className="h-3 w-3" /> {b.courseCount} courses
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <h3 className="heading text-lg font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
                    {b.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2 min-h-[40px]">{b.desc}</p>

                  <div className="mt-3 flex items-center gap-4 text-[12px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.students.toLocaleString('en-IN')}+ students</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <Star className="h-3.5 w-3.5 fill-warn text-warn" /> {b.rating}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <div className="heading text-2xl text-slate-900 leading-none">{inr(b.price)}</div>
                      <div className="text-[12px] text-slate-400 line-through mt-1">{inr(b.originalPrice)}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                      Enroll <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-8 flex items-center justify-center text-[13px] text-slate-500">
            <Sparkles className="h-4 w-4 text-amber-500 mr-1.5" /> Bundle pricing locked for the next batch only.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
