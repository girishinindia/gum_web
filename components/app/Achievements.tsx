'use client';

/**
 * Dashboard achievements (June 2026). Replaces the hardcoded badge grid with
 * the user's REAL earned badges (/user-badges/me) and issued certificates
 * (/issued-certificates/me). Certificates link to the public verify page and
 * offer PDF/PNG download when rendered.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, BadgeCheck, Download, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { fetchMyBadges, fetchMyCertificates, type MyBadge, type MyCertificate } from '@/lib/commerce';

function fmtDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Achievements() {
  const [badges, setBadges] = useState<MyBadge[] | null>(null);
  const [certs, setCerts] = useState<MyCertificate[] | null>(null);

  useEffect(() => {
    fetchMyBadges().then(setBadges).catch(() => setBadges([]));
    fetchMyCertificates().then(setCerts).catch(() => setCerts([]));
  }, []);

  const loading = badges === null || certs === null;
  const noBadges = (badges?.length ?? 0) === 0;
  const noCerts = (certs?.length ?? 0) === 0;

  return (
    <div className="mt-10">
      <h2 className="heading text-xl text-slate-900">Achievements</h2>

      {/* Certificates */}
      <h3 className="mt-4 text-sm font-semibold text-slate-700">Certificates</h3>
      {loading ? (
        <div className="mt-2 h-20 rounded-md bg-white border border-slate-200 animate-pulse" />
      ) : noCerts ? (
        <div className="mt-2 rounded-md bg-white border border-slate-200 p-6 text-center">
          <FileText className="h-7 w-7 mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-700">No certificates yet</p>
          <p className="mt-0.5 text-[12px] text-slate-500">Complete a course to earn your first certificate.</p>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {certs!.map((c) => {
            const course = c.certificate_templates?.courses?.name || c.certificate_templates?.name || 'Course certificate';
            return (
              <div key={c.id} className="rounded-md bg-white border border-slate-200 shadow-card p-4 flex items-center gap-4">
                <div className="h-11 w-11 rounded-md bg-gradient-to-br from-violet-500 to-brand-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{course}</div>
                  <div className="text-[11.5px] text-slate-500 font-mono">{c.certificate_number} · {fmtDate(c.issued_at)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.certificate_url && (
                    <a href={c.certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold px-3 py-1.5 transition-colors">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </a>
                  )}
                  {c.png_url && (
                    <a href={c.png_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-slate-200 hover:border-brand-300 text-slate-700 text-[12px] font-semibold px-3 py-1.5 transition-colors">
                      <Download className="h-3.5 w-3.5" /> PNG
                    </a>
                  )}
                  <Link href={`/verify/cert/${encodeURIComponent(c.certificate_number)}`} className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:underline px-2 py-1.5">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verify
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Badges */}
      <h3 className="mt-6 text-sm font-semibold text-slate-700">Badges</h3>
      {loading ? (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-md bg-white border border-slate-200 animate-pulse" />)}
        </div>
      ) : noBadges ? (
        <div className="mt-2 rounded-md bg-white border border-slate-200 p-6 text-center">
          <Sparkles className="h-7 w-7 mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-700">No badges yet</p>
          <p className="mt-0.5 text-[12px] text-slate-500">Keep learning — badges unlock as you hit milestones.</p>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {badges!.map((ub) => {
            const b = ub.badges;
            return (
              <div key={ub.id} className="rounded-md bg-white border border-slate-200 shadow-card p-4 text-center" title={b?.description || ''}>
                <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-btn overflow-hidden">
                  {b?.icon_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={b.icon_url} alt={b.name} className="h-full w-full object-cover" />
                  ) : (
                    <Award className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-2 text-[12px] font-semibold text-slate-800 leading-tight">{b?.name || 'Badge'}</div>
                {b?.xp_reward ? <div className="text-[10.5px] text-amber-600 font-semibold">+{b.xp_reward} XP</div> : null}
                <div className="text-[10px] text-slate-400">{fmtDate(ub.earned_at)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
