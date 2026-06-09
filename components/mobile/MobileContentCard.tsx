'use client';

import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import { extractCardData, TYPE_META, type UnifiedItem } from '@/components/ui/ContentCard';

/** Per-type cover gradient for the thumbnail fallback (app-native look). */
const TYPE_GRADIENT: Record<string, string> = {
  courses:       'from-brand-700 to-brand-500',
  bundles:       'from-violet-700 to-brand-500',
  batches:       'from-amber-600 to-rose-500',
  instructors:   'from-emerald-700 to-brand-500',
  blogs:         'from-rose-600 to-amber-500',
  webinars:      'from-sky-600 to-indigo-500',
  live_sessions: 'from-orange-600 to-rose-500',
  live_classes:  'from-teal-600 to-brand-500',
  podcasts:      'from-fuchsia-700 to-brand-500',
};

/**
 * Compact, app-native catalog card for the mobile route tree.
 * Reuses the exact same per-type data extraction as the desktop ContentCard.
 */
export function MobileContentCard({ item }: { item: UnifiedItem }) {
  const d = extractCardData(item);
  if (!d) return null;

  const meta = TYPE_META[d.type];
  const Icon = meta.icon;
  const grad = TYPE_GRADIENT[d.type] || 'from-brand-600 to-accent';
  const stats = d.stats.slice(0, 2);

  const body = (
    <div className="flex gap-3 p-3 rounded-md bg-white border border-slate-200 shadow-card active:scale-[0.98] transition-all">
      {/* Thumbnail */}
      <div className={`relative h-20 w-20 rounded-md shrink-0 overflow-hidden ${d.thumbnailUrl ? 'bg-slate-100' : `bg-gradient-to-br ${grad}`}`}>
        {d.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.thumbnailUrl} alt={d.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-6 w-6 text-white/85" />
          </div>
        )}
        {d.badge && (
          <span className={`absolute top-1 left-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${meta.badgeBg} ${meta.badgeText}`}>
            {d.badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className={`text-[9.5px] font-bold uppercase tracking-wider ${meta.categoryColor}`}>{d.category}</div>
        <h3 className="heading text-[13.5px] text-slate-900 line-clamp-2 leading-tight mt-0.5">{d.title}</h3>

        {stats.length > 0 && (
          <div className="mt-1 flex items-center gap-3 text-[10.5px] text-slate-500">
            {stats.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 min-w-0">
                <s.icon className="h-3 w-3 text-brand-500 shrink-0" />
                <span className="truncate">{s.label}</span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            {d.isFree ? (
              <span className="heading text-sm text-emerald-600">Free</span>
            ) : d.price ? (
              <>
                <span className="heading text-sm text-slate-900">{d.price}</span>
                {d.originalPrice && <span className="text-[10.5px] text-slate-400 line-through">{d.originalPrice}</span>}
              </>
            ) : d.extraInfo ? (
              <span className="text-[10.5px] text-slate-500 truncate">{d.extraInfo}</span>
            ) : null}
          </div>
          {d.rating != null && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-700 shrink-0">
              <Star className="h-3 w-3 fill-warn text-warn" /> {Number(d.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 self-center" />
    </div>
  );

  return d.href ? <Link href={d.href} className="block">{body}</Link> : body;
}
