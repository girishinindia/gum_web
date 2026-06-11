'use client';

/**
 * Instructor revenue-share terms panel (June 2026).
 * Live from GET /revenue-share-tiers/my-rates: the instructor's CURRENT slab
 * per content type (by distinct paid students), the full slab table, and the
 * discount-protection rules — "all conditions mentioned to the instructor".
 */

import { useEffect, useState } from 'react';
import { Percent, Users, Info, ShieldCheck } from 'lucide-react';
import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

interface Slab { min_students: number; max_students: number | null; instructor_share_pct: number }
interface TypeRate {
  item_type: string;
  students: number;
  instructor_share_pct: number;
  system_share_pct: number;
  scope: string;
  active_slab: Slab;
  slabs: Slab[];
}
interface MyRates { types: TypeRate[]; defaults: Slab[]; rules: string[] }

const TYPE_LABEL: Record<string, string> = { course: 'Courses', bundle: 'Bundles', batch: 'Live Batches', webinar: 'Webinars' };

export function RevenueShareTerms() {
  const [data, setData] = useState<MyRates | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const tok = getAccessToken();
    fetch(`${apiBase()}/revenue-share-tiers/my-rates`, {
      headers: tok ? { Authorization: `Bearer ${tok}` } : undefined,
      cache: 'no-store',
    })
      .then(r => r.json())
      .then(j => (j?.success ? setData(j.data) : setFailed(true)))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  return (
    <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
      <header className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
        <Percent className="h-4 w-4 text-brand-600" />
        <h2 className="heading text-lg text-slate-900">Your revenue share</h2>
        <span className="ml-auto text-[11px] text-slate-400">based on distinct paid students, per content type</span>
      </header>

      {data == null ? (
        <div className="p-5"><div className="h-16 rounded-md bg-slate-100 animate-pulse" /></div>
      ) : (
        <div className="p-5">
          {/* Current rates per content type */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {data.types.map((t) => (
              <div key={t.item_type} className="rounded-lg border border-slate-200 p-3.5">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">{TYPE_LABEL[t.item_type] || t.item_type}</div>
                <div className="mt-1 heading text-2xl text-slate-900">{t.instructor_share_pct}<span className="text-sm text-slate-400">%</span></div>
                <div className="text-[11px] text-slate-500">you / {t.system_share_pct}% platform</div>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-600">
                  <Users className="h-3 w-3 text-brand-600" /> {t.students.toLocaleString('en-IN')} student{t.students === 1 ? '' : 's'}
                </div>
                {t.scope !== 'global' && t.scope !== 'hardcoded' && (
                  <div className="mt-1 text-[10px] font-semibold text-violet-600">custom rate</div>
                )}
              </div>
            ))}
          </div>

          {/* Slab table */}
          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Share slabs (default)</div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {data.defaults.map((s) => (
                <div key={s.min_students} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center">
                  <div className="text-[11.5px] font-semibold text-slate-700">
                    {s.min_students.toLocaleString('en-IN')}–{s.max_students == null ? '∞' : s.max_students.toLocaleString('en-IN')} students
                  </div>
                  <div className="text-[12.5px] font-bold text-brand-700">{s.instructor_share_pct}% / {100 - s.instructor_share_pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="mt-5 rounded-lg bg-brand-50/50 border border-brand-100 p-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700">
              <ShieldCheck className="h-3.5 w-3.5" /> How discounts affect your earnings
            </div>
            <ul className="mt-2 space-y-1.5">
              {data.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-700 leading-relaxed">
                  <Info className="h-3.5 w-3.5 text-brand-500 mt-0.5 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
