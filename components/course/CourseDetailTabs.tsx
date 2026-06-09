'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const TABS = [
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'reviews',    label: 'Reviews' },
  { id: 'faq',        label: 'FAQ' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface Props {
  curriculum: ReactNode;
  reviews: ReactNode;
  faq: ReactNode;
}

/**
 * Real tab widget for the course detail page (panel-swap, not scroll-spy).
 * Only the active panel is shown; all three are still rendered server-side
 * (toggled via the `hidden` attribute) so content stays in the DOM for SEO.
 * The tab bar is sticky and tucks under the header + secondary-nav stack.
 */
export function CourseDetailTabs({ curriculum, reviews, faq }: Props) {
  const [active, setActive] = useState<TabId>('curriculum');
  const panels: Record<TabId, ReactNode> = { curriculum, reviews, faq };

  return (
    <div id="course-tabs" className="scroll-mt-[140px]">
      {/* Sticky tab bar */}
      <div className="sticky top-[60px] lg:top-[112px] z-30 bg-sky-50/90 backdrop-blur-sm border-b-2 border-slate-200">
        <nav role="tablist" aria-label="Course content" className="flex items-center gap-0 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                'relative whitespace-nowrap px-5 sm:px-7 py-3.5 text-sm font-semibold transition-colors',
                active === t.id ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              {t.label}
              {active === t.id && (
                <span className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-sky-500 rounded-t" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Panels — only the active one is visible */}
      <div className="mt-5">
        {TABS.map((t) => (
          <div key={t.id} role="tabpanel" hidden={active !== t.id}>
            {panels[t.id]}
          </div>
        ))}
      </div>
    </div>
  );
}
