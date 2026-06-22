'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { STATS_TILES } from '@/lib/homeContent';

function CountTile({ target, label, suffix, isFloat }: { target: number; label: string; suffix?: string; isFloat?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, target]);

  const display = isFloat
    ? value.toFixed(1)
    : value >= 1000
      ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
      : Math.round(value).toString();

  return (
    <div ref={ref} className="text-center rounded-md bg-white border border-slate-200 shadow-card p-6">
      <div className="heading text-3xl sm:text-4xl text-gradient">
        {display}{suffix ?? ''}
      </div>
      <div className="mt-1 text-[12px] sm:text-sm text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function StatsCounter({ tiles }: { tiles?: { target?: number; label?: string; suffix?: string; isFloat?: boolean }[] }) {
  const data = (tiles && tiles.length) ? tiles : STATS_TILES;
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {data.map((s, i) => (
            <CountTile key={`${s.label}-${i}`} target={Number(s.target) || 0} label={s.label || ''} suffix={s.suffix} isFloat={s.isFloat} />
          ))}
        </div>
      </div>
    </section>
  );
}
