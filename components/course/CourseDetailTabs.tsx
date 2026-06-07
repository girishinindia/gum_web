'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

const TABS = [
  { id: 'overview',     label: "What you'll learn" },
  { id: 'syllabus',     label: 'Syllabus' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'instructor',   label: 'Instructor' },
  { id: 'reviews',      label: 'Reviews' },
];

/**
 * Sticky tab bar for the course detail page.
 * Each tab scrolls to the section with the matching `id` attribute.
 * Active tab highlights based on scroll position (IntersectionObserver).
 */
interface Props {
  instructorName?: string;
  instructorInitials?: string;
}

export function CourseDetailTabs({ instructorName, instructorInitials }: Props) {
  const [active, setActive] = useState('overview');

  /* Track which section is currently in view. */
  useEffect(() => {
    const ids = TABS.map((t) => t.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id);
          }
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  return (
    <div className="sticky top-[57px] z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => scrollTo(t.id)}
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors',
                  active === t.id
                    ? 'border-brand-500 text-brand-700'
                    : 'border-transparent text-slate-500 hover:text-brand-700',
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
          {instructorName && (
            <button
              type="button"
              onClick={() => scrollTo('instructor')}
              className="hidden sm:flex items-center gap-2 shrink-0 rounded-full bg-brand-50 pl-1 pr-3 py-1 hover:bg-brand-100 transition-colors"
            >
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-[11px] font-bold flex items-center justify-center">
                {instructorInitials || instructorName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </span>
              <span className="text-[12px] font-semibold text-brand-700">{instructorName}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
