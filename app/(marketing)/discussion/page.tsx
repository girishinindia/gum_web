'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  SlidersHorizontal,
  MessagesSquare,
  ArrowUp,
  MessageCircle,
  User,
  Clock,
  Pin,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';
import {
  SearchInput,
  SortDropdown,
  FilterChips,
  PaginationBar,
  FilterSidebar,
  FilterDrawer,
  type SortOption,
  type FilterGroup,
  type FilterChip,
} from '@/components/ui/filters';
import {
  fetchDiscussionsList,
  type DiscussionThread,
  type DiscussionFilterParams,
} from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', sort: 'created_at', order: 'desc' },
  { label: 'Oldest First', sort: 'created_at', order: 'asc' },
  { label: 'Most Replied', sort: 'reply_count', order: 'desc' },
  { label: 'Most Viewed', sort: 'view_count', order: 'desc' },
  { label: 'Title A–Z', sort: 'title', order: 'asc' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'locked', label: 'Locked' },
];

const TAG_OPTIONS = [
  { value: 'pinned', label: 'Pinned', icon: Pin, iconColor: 'text-amber-500' },
  { value: 'answered', label: 'Answered', icon: CheckCircle2, iconColor: 'text-emerald-500' },
];

// ─── Helpers ────────────────────────────────────────────────────────────

function paramsToState(sp: URLSearchParams) {
  return {
    search: sp.get('search') || '',
    sort: sp.get('sort') || 'created_at',
    order: (sp.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(sp.get('page') || '1') || 1,
    statuses: new Set((sp.get('status') || '').split(',').filter(Boolean)),
    tags: new Set((sp.get('tag') || '').split(',').filter(Boolean)),
  };
}

function stateToParams(s: ReturnType<typeof paramsToState>): string {
  const p = new URLSearchParams();
  if (s.search) p.set('search', s.search);
  if (s.sort !== 'created_at') p.set('sort', s.sort);
  if (s.order !== 'desc') p.set('order', s.order);
  if (s.page > 1) p.set('page', String(s.page));
  if (s.statuses.size) p.set('status', [...s.statuses].join(','));
  if (s.tags.size) p.set('tag', [...s.tags].join(','));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

function stateToApiParams(s: ReturnType<typeof paramsToState>): DiscussionFilterParams {
  const params: DiscussionFilterParams = {
    search: s.search || undefined,
    sort: s.sort,
    order: s.order,
    page: s.page,
    limit: PAGE_SIZE,
  };
  if (s.statuses.size === 1) params.thread_status = [...s.statuses][0];
  if (s.tags.has('pinned')) params.is_pinned = true;
  if (s.tags.has('answered')) params.is_answered = true;
  return params;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ─── Skeleton ───────────────────────────────────────────────────────────

function ThreadSkeleton() {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-16 bg-slate-100 rounded-md" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="flex gap-4">
            <div className="h-3 bg-slate-100 rounded w-20" />
            <div className="h-3 bg-slate-100 rounded w-16" />
            <div className="h-3 bg-slate-100 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Thread card ────────────────────────────────────────────────────────

function ThreadCard({ thread }: { thread: DiscussionThread }) {
  const author = thread.users
    ? `${thread.users.first_name} ${thread.users.last_name}`.trim()
    : '';

  return (
    <div className="group rounded-md bg-white border border-slate-200 shadow-card p-5 hover:shadow-cardHover hover:border-brand-200 transition-all">
      <div className="flex items-start gap-4">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 shrink-0 rounded-md bg-brand-50 text-brand-700 px-3 py-2 min-w-[48px]">
          <ArrowUp className="h-4 w-4" />
          <span className="text-sm font-bold">{thread.view_count ?? 0}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {thread.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10.5px] font-semibold">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            {thread.is_answered && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10.5px] font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Answered
              </span>
            )}
            {thread.thread_status && thread.thread_status !== 'open' && (
              <span className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold border',
                thread.thread_status === 'closed'
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200',
              )}>
                {thread.thread_status.charAt(0).toUpperCase() + thread.thread_status.slice(1)}
              </span>
            )}
          </div>

          <h3 className="heading text-[16px] font-semibold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">
            {thread.title}
          </h3>

          {thread.body && (
            <p className="mt-1 text-[13px] text-slate-500 line-clamp-2">{thread.body}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-slate-500">
            {author && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" /> <span className="font-medium text-slate-700">{author}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {timeAgo(thread.created_at)}
            </span>
            {thread.reply_count != null && (
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> {thread.reply_count} replies
              </span>
            )}
            {thread.view_count != null && (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {thread.view_count} views
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inner component ────────────────────────────────────────────────────

function DiscussionPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Hide the "Sign in to post" CTA once the visitor is authenticated.
  const { signedIn, loading: authLoading } = useAuth();

  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = useMemo(() => paramsToState(searchParams), [searchParams]);

  // ── Fetch threads ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDiscussionsList(stateToApiParams(filters)).then((result) => {
      if (cancelled) return;
      setThreads(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const updateFilters = useCallback(
    (updater: (prev: ReturnType<typeof paramsToState>) => ReturnType<typeof paramsToState>) => {
      const next = updater(paramsToState(searchParams));
      router.push(`/discussion${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  const filterGroups: FilterGroup[] = useMemo(() => [
    { key: 'statuses', label: 'Status', options: STATUS_OPTIONS },
    { key: 'tags', label: 'Tags', options: TAG_OPTIONS },
  ], []);

  const selectedMap: Record<string, Set<string>> = {
    statuses: filters.statuses,
    tags: filters.tags,
  };

  function handleFilterChange(groupKey: string, value: string, checked: boolean) {
    updateFilters((prev) => {
      const key = groupKey as keyof typeof prev;
      const set = new Set(prev[key] as Set<string>);
      if (checked) set.add(value); else set.delete(value);
      return { ...prev, [key]: set, page: 1 };
    });
  }

  const chips: FilterChip[] = useMemo(() => {
    const result: FilterChip[] = [];
    for (const v of filters.statuses) {
      const opt = STATUS_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `statuses:${v}`, label: opt.label });
    }
    for (const v of filters.tags) {
      const opt = TAG_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `tags:${v}`, label: opt.label });
    }
    return result;
  }, [filters]);

  function handleChipRemove(chipKey: string) {
    const [groupKey, value] = chipKey.split(':');
    handleFilterChange(groupKey, value, false);
  }

  function handleClearAll() {
    router.push('/discussion', { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  const sidebarContent = (
    <FilterSidebar groups={filterGroups} selected={selectedMap} onChange={handleFilterChange} />
  );

  return (
    <>
      <PageHero
        eyebrow="Community Discussion"
        title={<>Learn together, <span className="text-gradient">grow together</span></>}
        subtitle="Ask questions, share insights, and connect with fellow learners and instructors."
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <SearchInput
                value={filters.search}
                onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
                placeholder="Search discussions by title or content…"
              />
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:border-brand-300 text-sm font-medium text-slate-700 shadow-card"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="h-5 w-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <SortDropdown
                options={SORT_OPTIONS}
                value={filters.sort}
                order={filters.order}
                onChange={(sort, order) => updateFilters((prev) => ({ ...prev, sort, order, page: 1 }))}
              />
            </div>
          </Reveal>

          <div className="mt-3">
            <FilterChips chips={chips} onRemove={handleChipRemove} onClearAll={handleClearAll} />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            <div className="hidden lg:block">
              {sidebarContent}

              {/* CTA card — only for signed-out visitors */}
              {!signedIn && !authLoading && (
                <div className="mt-6 rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white p-6 text-center shadow-cardHover">
                  <MessagesSquare className="h-7 w-7 mx-auto" />
                  <h3 className="heading mt-2 text-base font-bold">Join the conversation</h3>
                  <p className="mt-1 text-[12px] opacity-90">
                    Sign in to post questions and connect with the community.
                  </p>
                  <Link
                    href="/login"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-white text-brand-700 px-4 py-2 text-[12px] font-bold hover:shadow-lg transition-all"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-4">
                {loading ? (
                  <span className="inline-block h-4 w-40 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <>Showing <span className="font-semibold text-slate-800">{threads.length}</span> of {total} discussions</>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => <ThreadSkeleton key={i} />)}
                </div>
              ) : threads.length === 0 ? (
                <div className="py-20 text-center">
                  <MessagesSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-700">No discussions found</p>
                  <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
                  <button onClick={handleClearAll} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white text-sm font-medium shadow-btn hover:bg-brand-600 transition-colors">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {threads.map((t, i) => (
                    <Reveal key={t.id} delay={(i % 5) * 0.04}>
                      <ThreadCard thread={t} />
                    </Reveal>
                  ))}
                </div>
              )}

              {!loading && (
                <PaginationBar
                  page={filters.page}
                  totalPages={totalPages}
                  onChange={(page) => {
                    updateFilters((prev) => ({ ...prev, page }));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} activeCount={activeFilterCount}>
        {sidebarContent}
      </FilterDrawer>
    </>
  );
}

// ─── Page wrapper ───────────────────────────────────────────────────────

export default function DiscussionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="h-48 bg-gradient-to-br from-brand-700 to-brand-500 animate-pulse" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <ThreadSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <DiscussionPageInner />
    </Suspense>
  );
}
