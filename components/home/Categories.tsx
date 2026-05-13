import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import { api } from '@/lib/api';
import {
  Database, Brain, Code2, Shield, Cloud, Smartphone, Palette, LineChart, Bot, Layers, Sparkles,
  Globe, Server, Wrench, Gamepad2, Cog, ArrowRight, type LucideIcon,
} from 'lucide-react';

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  'data-science':    Database,
  'ai-ml':           Brain,
  'ai-machine-learning': Brain,
  'full-stack':      Code2,
  'web-development': Globe,
  'mobile-app-development': Smartphone,
  'desktop-development': Server,
  'game-development':Gamepad2,
  'software-engineering': Cog,
  'cyber-security':  Shield,
  'cloud-computing': Cloud,
  'cloud-devops':    Cloud,
  'mobile':          Smartphone,
  'design':          Palette,
  'analytics':       LineChart,
  'data-analysis':   LineChart,
  'automation':      Bot,
  'testing-qa':      Wrench,
  'fundamentals':    Layers,
  'gen-ai':          Sparkles,
  'programming':     Code2,
  'databases':       Database,
};

// Per-tile gradient palette for the inner icon chip (matches PHP rotation)
const TILE_PALETTES = [
  { chip: 'bg-brand-100 text-brand-700' },
  { chip: 'bg-violet-100 text-violet-700' },
  { chip: 'bg-emerald-100 text-emerald-700' },
  { chip: 'bg-amber-100 text-amber-700' },
  { chip: 'bg-rose-100 text-rose-700' },
  { chip: 'bg-sky-100 text-sky-700' },
];

// Badge labels — cycled to add visual interest (POPULAR / HOT / BEST etc.)
const BADGES = [
  { label: 'LOGIC',    cls: 'bg-emerald-100 text-emerald-700' },
  { label: 'POPULAR',  cls: 'bg-success/15 text-success' },
  { label: 'HOT',      cls: 'bg-orange-100 text-orange-700' },
  { label: 'BEST',     cls: 'bg-violet-100 text-violet-700' },
  { label: 'BESTEST',  cls: 'bg-rose-100 text-rose-700' },
  { label: 'HOTTEST',  cls: 'bg-amber-100 text-amber-700' },
];

export async function Categories() {
  const live = await api.subCategories();
  const items = (live ?? []).slice(0, 12);
  if (items.length === 0) return null;

  return (
    <section id="categories" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <Eyebrow>Browse Categories</Eyebrow>
              <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                Explore Our Course Categories
              </h2>
              <p className="mt-4 text-slate-600 max-w-md">
                From AI to Cyber Security — find the perfect course for your career goals.
              </p>
            </div>
            <ButtonLink href="/courses" variant="outline" size="md" className="rounded-full self-start lg:self-auto">
              View All Courses <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((c: any, i: number) => {
            const Icon = ICON_BY_SLUG[c.slug] ?? Layers;
            const palette = TILE_PALETTES[i % TILE_PALETTES.length];
            const badge   = BADGES[i % BADGES.length];
            return (
              <Reveal key={c.slug || c.name} delay={(i % 6) * 0.04}>
                <Link
                  href={`/courses?category=${c.slug}`}
                  className="group relative block rounded-md bg-white border border-slate-200 shadow-card p-5 hover:-translate-y-1 hover:shadow-cardHover hover:border-brand-200 transition-all text-center"
                >
                  <span className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-wider ${badge.cls}`}>
                    {badge.label === 'POPULAR' || badge.label === 'HOT' || badge.label === 'HOTTEST' ? '⚡' : badge.label === 'BEST' || badge.label === 'BESTEST' ? '⚡' : '⚡'} {badge.label}
                  </span>
                  <div className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-md ${palette.chip} mt-2`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 heading text-sm text-slate-900 group-hover:text-brand-700 transition-colors leading-tight">{c.name}</h3>
                  <p className="mt-1.5 text-[11px] text-slate-500">{c.course_count ?? 0} Courses</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
