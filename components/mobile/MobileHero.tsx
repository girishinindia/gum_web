'use client';

import Link from 'next/link';
import {
  Sparkles, Flame, ArrowRight, BookOpen, Radio, Video, FileText, Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

/**
 * Mobile hero strip — badge + title + Explore-Courses CTA + secondary
 * quick-chip strip. Lives as a client component so every string is pulled
 * from the i18n dictionary via `useT()` and swaps live when the user picks
 * a different language in the drawer (mirrors the desktop hero behaviour).
 *
 * Hero title is composed from the same titleA..titleE keys the desktop
 * <Hero /> uses, so EN/HI/etc. translations stay in lockstep across both
 * portals — no duplicate strings to maintain.
 */
export function MobileHero() {
  const t = useT();

  // Same chip set + order as the desktop secondary-nav strip. Labels come
  // from `t.secondary.*` so a Hindi user sees "कोर्स बंडल / वेबिनार / लाइव सत्र".
  const CHIPS: { href: string; label: string; Icon: LucideIcon; accent: string }[] = [
    { href: '/m/bundles',       label: t.secondary.bundles,       Icon: BookOpen,  accent: 'from-brand-100 to-brand-50 text-brand-700'       },
    { href: '/m/webinars',      label: t.secondary.webinars,      Icon: Radio,     accent: 'from-amber-100 to-amber-50 text-amber-700'       },
    { href: '/m/live-sessions', label: t.secondary.liveSessions,  Icon: Video,     accent: 'from-emerald-100 to-emerald-50 text-emerald-700' },
    { href: '/m/blog',          label: t.secondary.blogs,         Icon: FileText,  accent: 'from-violet-100 to-violet-50 text-violet-700'    },
    { href: '/m/announcements', label: t.secondary.announcements, Icon: Megaphone, accent: 'from-rose-100 to-rose-50 text-rose-700'          },
  ];

  return (
    <>
      {/* Hero */}
      <section className="px-5 pt-4">
        <div className="inline-flex items-center gap-1.5 bg-white border border-brand-200 rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-brand-800">
          <Sparkles className="h-3 w-3" /> {t.hero.badgeNew}
          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-1.5 py-0.5 text-[9.5px] font-bold">
            <Flame className="h-2.5 w-2.5" /> {t.hero.badgeHot}
          </span>
        </div>

        {/* Title — composed from the same titleA..titleE keys the desktop hero
            uses. The "IT Skills" + "Launch Real" fragments are highlighted
            with the brand gradient on both portals. */}
        <h1 className="mt-3 heading text-[28px] leading-[1.05] text-slate-900 tracking-tight">
          {t.hero.titleA}{' '}
          <span className="text-gradient">{t.hero.titleB}</span>
          <br />
          {t.hero.titleC}{' '}
          <span className="text-gradient">{t.hero.titleD}</span>
          {t.hero.titleE ? <><br />{t.hero.titleE}</> : null}
        </h1>

        <Link
          href="/m/courses"
          className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-3 text-sm font-semibold shadow-btn active:scale-[0.98] transition-all"
        >
          {t.common.explore} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Quick chips — mirrors desktop secondary nav, fully translatable */}
      <section className="px-5">
        {/* `-mx-5 pl-5 pr-7` keeps the first chip flush with the section
            heading, with extra trailing padding so the last chip never
            kisses the screen edge as the strip scrolls. */}
        <div className="flex gap-2 overflow-x-auto -mx-5 pl-5 pr-7 scrollbar-none">
          {CHIPS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold bg-gradient-to-br ${c.accent} border border-white/40 shadow-sm active:scale-95 transition-all`}
            >
              <c.Icon className="h-3.5 w-3.5" /> {c.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
