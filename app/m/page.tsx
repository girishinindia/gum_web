import Link from 'next/link';
import {
  ArrowRight, Radio, Star, Brain,
} from 'lucide-react';
import { api, sortSubCategoriesByEnglish } from '@/lib/api';
import { MobileCategoriesGrid } from '@/components/mobile/MobileCategoriesGrid';
import { MobileHero } from '@/components/mobile/MobileHero';
import { UPCOMING_WEBINARS, BUNDLES, FEATURED_INSTRUCTORS, STUDENT_REVIEWS } from '@/lib/homeContent';

export const revalidate = 300;

export default async function MobileHomePage() {
  const live = await api.subCategories();
  // Take 12 categories so the responsive grid always renders tidy rows:
  // 3×4 on phone (4 cols), 2×6 on tablet portrait (6 cols), etc.
  const cats = sortSubCategoriesByEnglish(live ?? []).slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Hero + quick chips — client component pulled in so every string
          (badge, title, "Explore Courses" CTA, chip labels) swaps live
          when the user picks a different language in the drawer. */}
      <MobileHero />

      {/* Featured AI&ML card */}
      <section className="px-5">
        <div className="relative rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white p-5 overflow-hidden shadow-cardHover">
          <div aria-hidden className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/15 backdrop-blur shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider opacity-80">FEATURED</div>
              <div className="heading text-lg mt-0.5">AI &amp; ML</div>
              <div className="text-[12px] opacity-85">50+ courses · multi-language</div>
              <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full w-3/4 bg-white rounded-full" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — 4 column grid. Renders via a client component so
          translated names refresh when the user switches language in the
          drawer (mirrors the desktop mega-menu behaviour). */}
      {cats.length > 0 && (
        <section className="px-5">
          <SectionHeader title="Categories" href="/m/courses" />
          <div className="mt-3">
            <MobileCategoriesGrid initialCategories={cats} />
          </div>
        </section>
      )}

      {/* Upcoming webinars — horizontal scroll */}
      <section>
        <div className="px-5">
          <SectionHeader title="Upcoming Webinars" href="/m/webinars" />
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pl-5 pr-7 pb-2 scrollbar-none">
          {UPCOMING_WEBINARS.map((w) => (
            <Link
              key={w.id}
              href={`/m/webinars/${w.id}`}
              className="shrink-0 w-60 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden active:scale-[0.97] transition-all"
            >
              <div className={`relative aspect-[16/9] bg-gradient-to-br ${w.cover}`}>
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-rose-600">
                  <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white text-[10px]">
                  <div className="font-semibold">{w.host}</div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="heading text-[13px] font-semibold text-slate-900 line-clamp-2 min-h-[34px]">{w.title}</h3>
                <div className="mt-2 text-[10.5px] text-slate-500 flex justify-between">
                  <span>{w.date}</span>
                  <span>{w.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bundles */}
      <section>
        <div className="px-5">
          <SectionHeader title="Course Bundles" href="/m/bundles" />
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pl-5 pr-7 pb-2 scrollbar-none">
          {BUNDLES.map((b) => (
            <Link
              key={b.id}
              href={`/m/bundles/${b.slug}`}
              className="shrink-0 w-64 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden active:scale-[0.97] transition-all"
            >
              <div className={`relative h-24 bg-gradient-to-br ${b.cover}`}>
                <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full">SAVE {b.savePercent}%</div>
              </div>
              <div className="p-3">
                <h3 className="heading text-[13px] font-semibold text-slate-900 line-clamp-1">{b.name}</h3>
                <div className="mt-1 text-[11px] text-slate-500 line-clamp-2 min-h-[28px]">{b.desc}</div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="heading text-base text-slate-900">₹{b.price.toLocaleString('en-IN')}</span>
                  <span className="text-[10.5px] text-slate-400 line-through">₹{b.originalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Instructors — same responsive scaling story as the category grid:
          3 cols on phone, more columns as the viewport widens so each
          instructor tile stays a sensible size on tablet. */}
      <section className="px-5">
        <SectionHeader title="Top Instructors" href="/m/instructors" />
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {FEATURED_INSTRUCTORS.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              href={`/m/instructors/${p.id}`}
              className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 p-2 sm:p-3 md:p-4 rounded-md bg-white border border-slate-200 active:scale-95 transition-all"
            >
              {/* Avatar scales 48 → 56 → 64 px so the tile fills nicely on
                  larger viewports instead of looking under-occupied. */}
              <div className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br ${p.accent} text-white heading text-sm sm:text-base md:text-lg flex items-center justify-center shadow-btn`}>
                {p.initial}
              </div>
              <div className="text-[10.5px] sm:text-[12px] md:text-[13px] font-semibold text-slate-900 leading-tight text-center line-clamp-1">{p.name}</div>
              <div className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-[10.5px] md:text-[11px] font-semibold text-slate-600">
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-warn text-warn" /> {p.rating}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews snippet */}
      <section className="px-5">
        <SectionHeader title="Student Reviews" href="/m/reviews" />
        <div className="mt-3 space-y-3">
          {STUDENT_REVIEWS.slice(0, 3).map((r) => (
            <div key={r.id} className="rounded-md bg-white border border-slate-200 p-3.5 shadow-card">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-[11px] font-bold flex items-center justify-center">{r.initial}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-slate-900 truncate">{r.name}</div>
                  <div className="text-[10.5px] text-brand-700 truncate">{r.course}</div>
                </div>
                <div className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold">
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className={k < r.rating ? 'h-2.5 w-2.5 fill-warn text-warn' : 'h-2.5 w-2.5 text-slate-200'} />)}
                </div>
              </div>
              <p className="mt-2 text-[12px] text-slate-700 leading-snug line-clamp-3">&ldquo;{r.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-5 pt-2 pb-6">
        <div className="rounded-lg bg-hero-grad text-white p-5 text-center shadow-cardHover">
          <div className="heading text-lg">Ready to start?</div>
          <p className="mt-1 text-[12px] opacity-85">Join 50K+ learners across 23 states.</p>
          <Link href="/m/courses" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white text-brand-700 px-4 py-2 text-[12.5px] font-bold active:scale-95 transition-all">
            Browse all courses <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="heading text-[15px] font-bold text-slate-900">{title}</h2>
      {href && (
        <Link href={href} className="text-[11.5px] font-semibold text-brand-700 inline-flex items-center gap-0.5 active:scale-95 transition-all">
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
