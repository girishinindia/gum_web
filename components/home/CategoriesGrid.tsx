'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ButtonLink } from '@/components/ui/Button';
import {
  Database, Brain, Code2, Shield, Cloud, Smartphone, Palette, LineChart, Bot, Layers, Sparkles,
  Globe, Server, Wrench, Gamepad2, Cog, ArrowRight, type LucideIcon,
} from 'lucide-react';
import {
  subCategoryName,
  fetchSubCategoriesForLanguage,
  type SubCategory,
} from '@/lib/api';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { useT } from '@/lib/i18n/useT';

/**
 * Desktop home-page "Explore Our Course Categories" grid — client component.
 *
 * Wraps the previously server-only `Categories` section so it can listen
 * to the LanguageProvider and overlay translated names onto the existing
 * English-ordered list when the user switches language. Mirrors exactly the
 * same logic the `CoursesMegaMenu` and the mobile `MobileCategoriesGrid`
 * already use — single source of truth for the language-switch behaviour.
 *
 * Initial data comes from the server (English / SSR locale), so the first
 * paint always has tiles. Translations swap in after hydration when the
 * user is on a non-English language.
 */
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  'data-science':    Database,
  'ai-ml':           Brain,
  'ai-machine-learning': Brain,
  'artificial-intelligence-machine-learning': Brain,
  'full-stack':      Code2,
  'web-development': Globe,
  'mobile-app-development': Smartphone,
  'mobile-development': Smartphone,
  'desktop-development': Server,
  'game-development':Gamepad2,
  'software-engineering': Cog,
  'cyber-security':  Shield,
  'cybersecurity':   Shield,
  'cloud-computing': Cloud,
  'cloud-devops':    Cloud,
  'devops-infrastructure': Cloud,
  'mobile':          Smartphone,
  'design':          Palette,
  'ui-ux-design-courses': Palette,
  'analytics':       LineChart,
  'data-analysis':   LineChart,
  'data-science-analytics': LineChart,
  'automation':      Bot,
  'rpa-automation':  Bot,
  'testing-qa':      Wrench,
  'software-testing-qa': Wrench,
  'fundamentals':    Layers,
  'it-fundamentals': Layers,
  'gen-ai':          Sparkles,
  'programming':     Code2,
  'programming-languages': Code2,
  'databases':       Database,
  'database':        Database,
  'networking':      Globe,
  'blockchain-web3': Sparkles,
  'ar-vr-emerging-tech': Sparkles,
  'iot-embedded-systems': Cog,
  'office-productivity': Layers,
  'digital-marketing-seo': LineChart,
  'erp-crm-business-software': Server,
  'no-code-low-code': Wrench,
  'it-certifications': Shield,
  'animation-multimedia': Palette,
};

const TILE_PALETTES = [
  { chip: 'bg-brand-100 text-brand-700' },
  { chip: 'bg-violet-100 text-violet-700' },
  { chip: 'bg-emerald-100 text-emerald-700' },
  { chip: 'bg-amber-100 text-amber-700' },
  { chip: 'bg-rose-100 text-rose-700' },
  { chip: 'bg-sky-100 text-sky-700' },
];

const BADGES = [
  { label: 'LOGIC',    cls: 'bg-emerald-100 text-emerald-700' },
  { label: 'POPULAR',  cls: 'bg-success/15 text-success' },
  { label: 'HOT',      cls: 'bg-orange-100 text-orange-700' },
  { label: 'BEST',     cls: 'bg-violet-100 text-violet-700' },
  { label: 'BESTEST',  cls: 'bg-rose-100 text-rose-700' },
  { label: 'HOTTEST',  cls: 'bg-amber-100 text-amber-700' },
];

interface Props {
  initialCategories: SubCategory[];
}

export function CategoriesGrid({ initialCategories }: Props) {
  const t = useT();
  const { active } = useLanguage();
  const [items, setItems] = useState<SubCategory[]>(initialCategories);

  // Re-fetch and overlay translated names whenever the user picks a
  // different language. English uses the SSR list as-is. Other languages
  // hit `/sub-category-translations?language_id=…`, then we walk the
  // English-ordered list and replace `english_name` with the translation
  // when present — falling back to English if the translation is missing.
  useEffect(() => {
    if (!active) return;
    if (active.iso_code === 'en') {
      setItems(initialCategories);
      return;
    }
    let cancelled = false;
    fetchSubCategoriesForLanguage(active.id).then((rows) => {
      if (cancelled) return;
      if (rows.length === 0) { setItems(initialCategories); return; }
      const translatedById = new Map<number, string>();
      for (const r of rows) {
        if (r.id != null && r.english_name) translatedById.set(r.id, r.english_name);
      }
      const ordered = initialCategories.map((eng) => {
        const tr = translatedById.get(eng.id);
        return tr ? { ...eng, english_name: tr } : eng;
      });
      setItems(ordered);
    });
    return () => { cancelled = true; };
  }, [active, initialCategories]);

  if (items.length === 0) return null;

  return (
    <section id="categories" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <Eyebrow>{t.sections.categoriesEyebrow}</Eyebrow>
              <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
                {t.sections.categoriesTitle}
              </h2>
              <p className="mt-4 text-slate-600 max-w-md">{t.sections.categoriesDesc}</p>
            </div>
            <ButtonLink href="/courses" variant="outline" size="md" className="rounded-full self-start lg:self-auto">
              {t.common.allCourses} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((c, i) => {
            const Icon = ICON_BY_SLUG[c.slug] ?? Layers;
            const palette = TILE_PALETTES[i % TILE_PALETTES.length];
            const badge   = BADGES[i % BADGES.length];
            const displayName = subCategoryName(c);
            return (
              <Reveal key={c.id ?? c.slug} delay={(i % 6) * 0.04}>
                <Link
                  href={`/courses?category=${c.slug}`}
                  className="group relative block rounded-md bg-white border border-slate-200 shadow-card p-5 hover:-translate-y-1 hover:shadow-cardHover hover:border-brand-200 transition-all text-center min-h-[170px]"
                >
                  <span className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-wider ${badge.cls}`}>
                    ⚡ {badge.label}
                  </span>
                  <div className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-md ${palette.chip} mt-5`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 heading text-sm text-slate-900 group-hover:text-brand-700 transition-colors leading-tight">{displayName}</h3>
                  {typeof c.course_count === 'number' && (
                    <p className="mt-1.5 text-[11px] text-slate-500">{c.course_count} Courses</p>
                  )}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
