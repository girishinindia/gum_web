'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown, ArrowRight, Database, Brain, Code2, Shield, Cloud, Smartphone, Palette,
  LineChart, Bot, Layers, Sparkles, Globe, Server, Wrench, Gamepad2, Cog, type LucideIcon,
} from 'lucide-react';
import { subCategoryName, fetchSubCategoriesForLanguage, type SubCategory } from '@/lib/api';
import { useLanguage } from './LanguageProvider';
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/cn';

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

// Six rotating tile palettes so each icon gets its own color (not all sky-blue).
const PALETTES = [
  { chip: 'bg-brand-100 text-brand-700',     hover: 'group-hover:bg-brand-500 group-hover:text-white' },
  { chip: 'bg-violet-100 text-violet-700',   hover: 'group-hover:bg-violet-500 group-hover:text-white' },
  { chip: 'bg-emerald-100 text-emerald-700', hover: 'group-hover:bg-emerald-500 group-hover:text-white' },
  { chip: 'bg-amber-100 text-amber-700',     hover: 'group-hover:bg-amber-500 group-hover:text-white' },
  { chip: 'bg-rose-100 text-rose-700',       hover: 'group-hover:bg-rose-500 group-hover:text-white' },
  { chip: 'bg-sky-100 text-sky-700',         hover: 'group-hover:bg-sky-500 group-hover:text-white' },
];

interface Props {
  initialCategories: SubCategory[];
}

export function CoursesMegaMenu({ initialCategories }: Props) {
  const { active } = useLanguage();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<SubCategory[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-fetch when language changes (English uses the SSR initial set; other
  // langs hit /sub-category-translations?language_id=…).
  //
  // IMPORTANT: keep the same ORDER as the English / SSR list no matter which
  // language is active — we just overlay translated names onto the existing
  // ordered list, falling back to the English name if a translation is missing.
  useEffect(() => {
    if (!active) return;
    if (active.iso_code === 'en') {
      setCategories(initialCategories);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchSubCategoriesForLanguage(active.id)
      .then((rows) => {
        if (cancelled) return;
        if (rows.length === 0) {
          setCategories(initialCategories);
          return;
        }
        // Map sub_category_id → translated name
        const translatedById = new Map<number, string>();
        for (const r of rows) {
          if (r.id != null && r.english_name) translatedById.set(r.id, r.english_name);
        }
        // Walk the English list, overlay translated names onto it (= preserve order)
        const ordered = initialCategories.map((eng) => {
          const t = translatedById.get(eng.id);
          return t ? { ...eng, english_name: t } : eng;
        });
        setCategories(ordered);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [active, initialCategories]);

  // Hover-open with grace period
  function scheduleClose() { closeTimer.current = setTimeout(() => setOpen(false), 160); }
  function cancelClose() {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'inline-flex items-center gap-1 px-3 py-2 rounded-sm text-sm font-medium transition-colors',
          open ? 'text-brand-700 bg-brand-50' : 'text-slate-700 hover:text-brand-700 hover:bg-brand-50',
        )}
      >
        {t.nav.courses}
        <ChevronDown className={cn('h-3.5 w-3.5 opacity-70 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className={cn(
            'absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[min(92vw,860px)]',
            'rounded-md overflow-hidden z-50',
            // Solid light-theme gradient — fully opaque, sky-50 → indigo-50.
            'bg-gradient-to-br from-white via-brand-50 to-indigo-50',
            'border border-slate-200/70 shadow-cardHover',
          )}
        >
          {/* Soft glow accents inside the panel — pure decoration, very subtle */}
          <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />

          {/* Grid — tight spacing, colored icons */}
          {loading ? (
            <div className="relative px-5 py-8 text-center text-sm text-slate-500">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="relative px-5 py-8 text-center text-sm text-slate-500">No categories available.</div>
          ) : (
            // CSS columns flow items top-to-bottom then onto the next column,
            // keeping the visual order alphabetical when reading column-wise.
            <ul className="relative columns-2 md:columns-3 lg:columns-4 gap-0.5 p-2 max-h-[60vh] overflow-y-auto">
              {categories.map((c, i) => {
                const Icon = ICON_BY_SLUG[c.slug] ?? Layers;
                const p = PALETTES[i % PALETTES.length];
                return (
                  <li key={c.id ?? c.slug} className="break-inside-avoid">
                    <Link
                      href={`/courses?category=${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-2 px-1.5 py-1 rounded-sm hover:bg-white/60 hover:shadow-sm transition-all"
                    >
                      <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-md shrink-0 transition-colors shadow-sm', p.chip, p.hover)}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 text-[12.5px] font-semibold text-slate-800 group-hover:text-brand-700 truncate">
                        {subCategoryName(c)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer — All courses right-aligned */}
          <div className="relative px-4 py-2.5 border-t border-slate-200/60 bg-gradient-to-r from-brand-50 to-indigo-50 flex items-center justify-end">
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-3.5 py-1.5 text-[12px] font-semibold shadow-btn hover:shadow-btnHover hover:-translate-y-0.5 transition-all"
            >
              {t.common.allCourses} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
