'use client';

/**
 * Role-aware announcements feed (June 2026).
 *
 * The public endpoint returns only `all`-scoped announcements by default; when
 * a viewer is signed in we pass their audience (instructors / students) so they
 * also see announcements targeted at their role. Anonymous visitors see 'all'.
 * Rendered client-side because the audience depends on the logged-in user.
 */

import { useEffect, useState } from 'react';
import { Megaphone, Pin, Calendar } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { api, type Announcement } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/cn';

const TYPE_STYLE: Record<string, string> = {
  general:     'bg-brand-50 text-brand-700',
  course:      'bg-emerald-50 text-emerald-700',
  batch:       'bg-violet-50 text-violet-700',
  webinar:     'bg-sky-50 text-sky-700',
  system:      'bg-amber-50 text-amber-700',
  maintenance: 'bg-rose-50 text-rose-700',
};

function timeAgo(d?: string | null): string {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return days === 1 ? 'Yesterday' : `${days} days ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Map the signed-in user's role to the announcement audience. Instructor role
 *  level is 60 (per RBAC); anyone signed in below that is treated as a student. */
function audienceFor(user: { max_role_level?: number } | null): string | undefined {
  if (!user) return undefined;
  return (user.max_role_level ?? 0) >= 60 ? 'instructors' : 'students';
}

export function AnnouncementsFeed({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Announcement[] | null>(null);

  useEffect(() => {
    if (authLoading) return; // wait until we know whether someone is signed in
    let cancelled = false;
    api.announcements(50, audienceFor(user))
      .then((r) => { if (!cancelled) setItems(r ?? []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // ── Mobile ──
  if (variant === 'mobile') {
    if (items === null) {
      return <div className="px-3 pt-6 pb-8 text-center text-[12px] text-slate-400">Loading…</div>;
    }
    if (items.length === 0) {
      return (
        <div className="px-3 pt-6 pb-8 text-center">
          <Megaphone className="h-7 w-7 mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-700">No announcements yet</p>
          <p className="mt-0.5 text-[12px] text-slate-500">Updates will appear here once published.</p>
        </div>
      );
    }
    return (
      <ul className="px-3 pt-2 space-y-2 pb-4">
        {items.map((a) => (
          <li key={a.id}>
            <div className={cn('rounded-md bg-white border shadow-card p-3.5', a.is_pinned ? 'border-brand-300' : 'border-slate-200')}>
              <div className="flex items-start gap-2.5">
                <div className="h-9 w-9 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white flex items-center justify-center shrink-0">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900 leading-snug">{a.title}</div>
                  {a.content && <p className="mt-1 text-[11.5px] text-slate-600 leading-relaxed line-clamp-3 whitespace-pre-line">{a.content}</p>}
                  <div className="mt-1 flex items-center gap-2 text-[10.5px] text-slate-500">
                    <span>{timeAgo(a.published_at)}</span>
                    {a.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-1.5 py-0.5 text-[9.5px] font-bold">
                        <Pin className="h-2.5 w-2.5" /> PINNED
                      </span>
                    )}
                    {a.announcement_type && <span className="uppercase tracking-wider text-slate-400">{a.announcement_type}</span>}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // ── Desktop ──
  return (
    <section className="pb-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        {items === null ? (
          <div className="rounded-md bg-white border border-slate-200 p-10 text-center text-sm text-slate-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-md bg-white border border-slate-200 p-10 text-center">
            <Megaphone className="h-8 w-8 mx-auto text-slate-300" />
            <p className="mt-3 heading text-lg text-slate-800">No announcements yet</p>
            <p className="mt-1 text-sm text-slate-500">News and updates will appear here as soon as they&rsquo;re published.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a, i) => (
              <Reveal key={a.id} delay={Math.min(i * 0.04, 0.3)}>
                <article className={cn('rounded-md bg-white border shadow-card p-5 hover:shadow-cardHover transition-all', a.is_pinned ? 'border-brand-300 ring-1 ring-brand-100' : 'border-slate-200')}>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white flex items-center justify-center shrink-0">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.is_pinned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5">
                            <Pin className="h-3 w-3" /> Pinned
                          </span>
                        )}
                        {a.announcement_type && (
                          <span className={cn('inline-flex rounded-full text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5', TYPE_STYLE[a.announcement_type] || 'bg-slate-100 text-slate-600')}>
                            {a.announcement_type}
                          </span>
                        )}
                        {(a.priority === 'high' || a.priority === 'urgent') && (
                          <span className="inline-flex rounded-full bg-rose-50 text-rose-700 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5">{a.priority}</span>
                        )}
                      </div>
                      <h2 className="mt-1.5 text-[15px] font-semibold text-slate-900 leading-snug">{a.title}</h2>
                      {a.content && (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600 whitespace-pre-line">{a.content}</p>
                      )}
                      <div className="mt-2 inline-flex items-center gap-1 text-[12px] text-slate-500">
                        <Calendar className="h-3 w-3" /> {timeAgo(a.published_at)}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
