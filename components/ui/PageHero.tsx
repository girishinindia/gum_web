import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

interface Props {
  eyebrow?:  string;
  title:     ReactNode;
  subtitle?: ReactNode;
  actions?:  ReactNode;
}

/**
 * Generic page hero used on /courses, /bundles, /webinars, etc.
 */
export function PageHero({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <section className="pt-10 sm:pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-2xl">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="mt-4 text-slate-600 max-w-2xl">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
