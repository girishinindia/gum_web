'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessagesSquare, MessageCircle, Pin, CheckCircle2, Eye, Search, X } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { fetchDiscussionsList, type DiscussionThread } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

type FilterKey = 'all' | 'unanswered' | 'answered' | 'pinned';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unanswered', label: 'Unanswered' },
  { key: 'answered', label: 'Answered' },
  { key: 'pinned', label: 'Pinned' },
];

function ago(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function authorName(u?: DiscussionThread['users']): string {
  if (!u) return 'Member';
  const n = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  return n || 'Member';
}

/**
 * Mobile discussion / community forum — live data from /discussion-threads.
 * App-native thread list with status filters; posting still requires sign-in.
 */
export default function MobileDiscussionPage() {
  // Hide the "Sign in to post" CTA once the visitor is authenticated.
  const { signedIn, loading: authLoading } = useAuth();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDiscussionsList({
      search: debouncedSearch || undefined,
      is_answered: filter === 'answered' ? true : filter === 'unanswered' ? false : undefined,
      is_pinned: filter === 'pinned' ? true : undefined,
      sort: 'created_at',
      order: 'desc',
      page,
      limit: 12,
    }).then((r) => {
      if (cancelled) return;
      setThreads((prev) => (page === 1 ? r.data : [...prev, ...r.data]));
      setTotalPages(r.totalPages || 1);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filter, debouncedSearch, page]);

  return (
    <div className="pb-6">
      <MobilePageHeader title="Discussion" subtitle="Ask, answer & learn with peers" />

      {/* Search */}
      <div className="px-3">
        <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 shadow-sm focus-within:border-brand-300">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none text-ellipsis placeholder:text-slate-400"
            placeholder="Search discussions…"
          />
          {search && <button onClick={() => setSearch('')} aria-label="Clear"><X className="h-4 w-4 text-slate-400" /></button>}
        </div>
      </div>

      {/* Filter chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-3 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold border transition-colors ${filter === f.key ? 'bg-brand-500 text-white border-brand-500 shadow-btn' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Threads */}
      <div className="mt-3 px-3 space-y-2">
        {loading && page === 1 ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[92px] rounded-md bg-white border border-slate-200 animate-pulse" />)
        ) : threads.length === 0 ? (
          <div className="py-14 text-center">
            <MessagesSquare className="h-6 w-6 mx-auto text-slate-300" />
            <p className="heading text-slate-700 text-sm mt-2">No discussions yet</p>
            <p className="text-[12px] text-slate-500 mt-1">Be the first to start the conversation.</p>
          </div>
        ) : (
          threads.map((t) => (
            <div key={t.id} className="block rounded-md bg-white border border-slate-200 p-3.5 shadow-card">
              <div className="flex items-start gap-3">
                <div className={`flex flex-col items-center gap-1 shrink-0 rounded-md px-2 py-1.5 ${t.is_answered ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'}`}>
                  {t.is_answered ? <CheckCircle2 className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
                  <span className="text-[11px] font-bold">{t.reply_count ?? 0}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {t.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[9.5px] font-bold"><Pin className="h-2.5 w-2.5" /> Pinned</span>
                    )}
                    {t.is_answered && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[9.5px] font-bold"><CheckCircle2 className="h-2.5 w-2.5" /> Answered</span>
                    )}
                    {t.item_type && (
                      <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[9.5px] font-semibold capitalize">{t.item_type}</span>
                    )}
                  </div>
                  <h3 className="heading text-[13px] font-semibold text-slate-900 line-clamp-2">{t.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-500">
                    <span className="truncate">by {authorName(t.users)} · {ago(t.created_at)}</span>
                    <span className="inline-flex items-center gap-2 shrink-0">
                      {t.view_count != null && <span className="inline-flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {t.view_count}</span>}
                      <span className="inline-flex items-center gap-0.5"><MessageCircle className="h-2.5 w-2.5" /> {t.reply_count ?? 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && threads.length > 0 && page < totalPages && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full mt-1 rounded-full bg-white border border-slate-200 py-2.5 text-[13px] font-semibold text-brand-700 active:scale-[0.98] transition-all shadow-card"
          >
            Load more
          </button>
        )}

        {/* CTA — only for signed-out visitors */}
        {!signedIn && !authLoading && (
          <div className="mt-4 rounded-md bg-gradient-to-br from-brand-500 to-accent text-white p-4 text-center shadow-cardHover">
            <MessagesSquare className="h-5 w-5 mx-auto" />
            <div className="heading mt-1.5 text-[14px]">Join the conversation</div>
            <p className="text-[11px] opacity-90 mt-0.5">Sign in to post questions and answer your peers.</p>
            <Link
              href="/m/login?next=%2Fm%2Fdiscussion"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white text-brand-700 px-3.5 py-1.5 text-[11.5px] font-bold active:scale-95 transition-all"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
