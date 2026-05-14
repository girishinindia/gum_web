'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BookOpen, Database, Brain, Code2, Shield, Cloud, Smartphone, Palette,
  LineChart, Bot, Layers, Sparkles, Globe, Server, Wrench, Gamepad2, Cog,
  type LucideIcon,
} from 'lucide-react';
import { subCategoryName, fetchSubCategoriesForLanguage, type SubCategory } from '@/lib/api';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/cn';

/**
 * Same slug → icon map used by the desktop `CoursesMegaMenu`, so the same
 * sub-category renders with the same glyph on both portals.
 */
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  'data-science': Database, 'ai-ml': Brain, 'ai-machine-learning': Brain,
  'artificial-intelligence-machine-learning': Brain,
  'full-stack': Code2, 'web-development': Globe, 'mobile-app-development': Smartphone,
  'mobile-development': Smartphone, 'desktop-development': Server,
  'game-development': Gamepad2, 'software-engineering': Cog,
  'cyber-security': Shield, 'cybersecurity': Shield,
  'cloud-computing': Cloud, 'cloud-devops': Cloud, 'devops-infrastructure': Cloud,
  'mobile': Smartphone, 'design': Palette, 'ui-ux-design-courses': Palette,
  'analytics': LineChart, 'data-analysis': LineChart, 'data-science-analytics': LineChart,
  'automation': Bot, 'rpa-automation': Bot,
  'testing-qa': Wrench, 'software-testing-qa': Wrench,
  'fundamentals': Layers, 'it-fundamentals': Layers,
  'gen-ai': Sparkles,
  'programming': Code2, 'programming-languages': Code2,
  'databases': Database, 'database': Database,
  'networking': Globe,
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

interface Props {
  initialCategories: SubCategory[];
}

/**
 * 4-column category grid that mirrors the desktop mega-menu's language
 * behaviour: at SSR time it ships the English (or whatever was active
 * server-side) names; when the user flips the language switcher in the
 * drawer, we hit `/sub-category-translations?language_id=…` and overlay
 * the translated names onto the same English-ordered list (so position
 * stays stable across languages).
 */
export function MobileCategoriesGrid({ initialCategories }: Props) {
  const { active } = useLanguage();
  const [categories, setCategories] = useState<SubCategory[]>(initialCategories);

  useEffect(() => {
    if (!active) return;
    if (active.iso_code === 'en') {
      setCategories(initialCategories);
      return;
    }
    let cancelled = false;
    fetchSubCategoriesForLanguage(active.id)
      .then((rows) => {
        if (cancelled) return;
        if (rows.length === 0) { setCategories(initialCategories); return; }
        const translatedById = new Map<number, string>();
        for (const r of rows) {
          if (r.id != null && r.english_name) translatedById.set(r.id, r.english_name);
        }
        // Walk the English list, overlay translated names, preserve order.
        const ordered = initialCategories.map((eng) => {
          const t = translatedById.get(eng.id);
          return t ? { ...eng, english_name: t } : eng;
        });
        setCategories(ordered);
      });
    return () => { cancelled = true; };
  }, [active, initialCategories]);

  if (categories.length === 0) return null;

  return (
    // Responsive column count keeps each tile a sensible size across the
    // whole mobile/tablet range:
    //   • default (< 640 px, phone portrait)   → 4 cols, ~80–100 px tile
    //   • sm     (≥ 640 px, phone landscape)   → 5 cols
    //   • md     (≥ 768 px, tablet portrait)   → 6 cols
    //   • (lg+ = desktop, served via /courses) → n/a
    // `max-h-[120px]` caps tile height on bigger viewports so the squares
    // never balloon into half-page blocks like they did with a fixed 4-col
    // grid on a 1000 px tablet.
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
      {categories.map((c) => {
        const Icon = ICON_BY_SLUG[c.slug] ?? BookOpen;
        return (
          <Link
            key={c.id ?? c.slug}
            href={`/m/courses?category=${c.slug}`}
            // Tile + content scale up at each breakpoint so the bigger
            // tablet cards don't look icon-deprived. Padding, gap, label
            // size and icon size all step up together.
            className={cn(
              'aspect-square max-h-[120px] sm:max-h-[140px] md:max-h-[160px]',
              'flex flex-col items-center justify-center gap-1 sm:gap-1.5 md:gap-2',
              'rounded-md bg-white border border-slate-200 active:scale-95 transition-all',
              'p-1 sm:p-2 md:p-3 text-center',
            )}
          >
            <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </div>
            <div className="text-[10px] sm:text-[11.5px] md:text-[13px] font-semibold text-slate-800 line-clamp-2 leading-tight">
              {subCategoryName(c)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
