'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Video,
  Clock,
  User,
  Calendar,
  ArrowRight,
  Radio,
  Repeat,
  MonitorPlay,
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
  fetchLiveSessionsList,
  type LiveSession,
  type LiveSessionFilterParams,
} from '@/lib/api';

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', sort: 'created_at', order: 'desc' },
  { label: 'Oldest First', sort: 'created_at', order: 'asc' },
  { label: 'Title A–Z', sort: 'title', order: 'asc' },
  { label: 'Title Z–A', sort: 'title', order: 'desc' },
];

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live Now' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PLATFORM_OPTIONS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'ms_teams', label: 'MS Teams' },
  { value: 'custom', label: 'Custom' },
];

const TAG_OPTIONS = [
  { value: 'recurring', label: 'Recurring', icon: Repeat, iconColor: 'text-violet-500' },
];

const COVER_GRADIENTS = [
  'from-brand-700 via-brand-600 to-brand-500',
  'from-violet-700 via-brand-600 to-emerald-500',
  'from-rose-700 via-rose-600 to-amber-500',
  'from-emerald-700 via-emerald-600 to-brand-500',
  'from-amber-600 via-rose-500 to-violet-600',
  'from-brand-600 via-violet-500 to-rose-500',
];

// ─── Helpers ────────────────────────────────────────────────────────────

function paramsToState(sp: URLSearchParams) {
  return {
    search: sp.get('search') || '',
    sort: sp.get('sort') || 'created_at',
    order: (sp.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(sp.get('page') || '1') || 1,
    statuses: new Set((sp.get('status') || '').split(',').filter(Boolean)),
    platforms: new Set((sp.get('platform') || '').split(',').filter(Boolean)),
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
  if (s.platforms.size) p.set('platform', [...s.platforms].join(','));
  if (s.tags.size) p.set('tag', [...s.tags].join(','));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

function stateToApiParams(s: ReturnType<typeof paramsToState>): LiveSessionFilterParams {
  const params: LiveSessionFilterParams = {
    search: s.search || undefined,
    sort: s.sort,
    order: s.order,
    page: s.page,
    limit: PAGE_SIZE,
  };
  if (s.statuses.size === 1) params.session_status = [...s.statuses][0];
  if (s.platforms.size === 1) params.meeting_platform = [...s.platforms][0];
  if (s.tags.has('recurring')) params.is_recurring = true;
  return params;
}

// ─── Skeleton ───────────────────────────────────────────────────────────

function SessionCardSkeleton() {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden animate-pulse">
      <div className="h-32 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="h-3 bg-slate-100 rounded w-28" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Session card ───────────────────────────────────────────────────────

function statusBadge(status?: string | null) {
  switch (status) {
    case 'live':
      return (
        <span className="inline-flex items-center gap-1 bg-rose-500 text-white rounded-full px-2.5 py-1 text-[10.5px] font-bold shadow-sm">
          <Radio className="h-3 w-3 animate-pulse" /> LIVE
        </span>
      );
    case 'scheduled':
      return (
        <span className="inline-flex items-center gap-1 bg-brand-500 text-white rounded-full px-2.5 py-1 text-[10.5px] font-bold shadow-sm">
          <Calendar className="h-3 w-3" /> SCHEDULED
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 bg-slate-500 text-white rounded-full px-2.5 py-1 text-[10.5px] font-bold shadow-sm">
          COMPLETED
        </span>
      );
    default:
      return null;
  }
}

function SessionCard({ session, index }: { session: LiveSession; index: number }) {
  const instructor = session.users
    ? `${session.users.first_name} ${session.users.last_name}`.trim()
    : '';
  const hasThumbnail = !!session.thumbnail_url;
  const dt = session.scheduled_at ? new Date(session.scheduled_at) : null;

  return (
    <Link
      href={`/live-sessions/${session.id}`}
      className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
    >
      {hasThumbnail ? (
        <div className="relative h-32 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={session.thumbnail_url!} alt={session.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-3 left-3">{statusBadge(session.session_status)}</div>
          {session.duration_minutes && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-black/40 backdrop-blur text-white rounded-full px-2.5 py-1 text-[10.5px] font-semibold">
              <Clock className="h-3 w-3" /> {session.duration_minutes} min
            </div>
          )}
        </div>
      ) : (
        <div className={cn('relative h-32 bg-gradient-to-br', COVER_GRADIENTS[index % COVER_GRADIENTS.length])}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="absolute top-3 left-3">{statusBadge(session.session_status)}</div>
          {session.duration_minutes && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-black/40 backdrop-blur text-white rounded-full px-2.5 py-1 text-[10.5px] font-semibold">
              <Clock className="h-3 w-3" /> {session.duration_minutes} min
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <h3 className="heading text-[15px] font-semibold text-slate-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[40px]">
          {session.title}
        </h3>

        {session.meeting_platform && (
          <p className="mt-1 text-[12px] text-slate-500 capitalize">
            <MonitorPlay className="inline h-3 w-3 mr-1" />
            {session.meeting_platform.replace('_', ' ')}
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <div className="flex items-center gap-3">
            {instructor && (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <User className="h-3 w-3" /> {instructor}
              </span>
            )}
            {dt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            {session.is_recurring && <Repeat className="h-3 w-3 text-violet-500" />}
            <span className="text-brand-700 font-semibold inline-flex items-center gap-1">
              Join <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Inner component ────────────────────────────────────────────────────

function LiveSessionsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = useMemo(() => paramsToState(searchParams), [searchParams]);

  // ── Fetch sessions ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLiveSessionsList(stateToApiParams(filters)).then((result) => {
      if (cancelled) return;
      setSessions(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const updateFilters = useCallback(
    (updater: (prev: ReturnType<typeof paramsToState>) => ReturnType<typeof paramsToState>) => {
      const next = updater(paramsToState(searchParams));
      router.push(`/live-sessions${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  const filterGroups: FilterGroup[] = useMemo(() => [
    { key: 'statuses', label: 'Status', options: STATUS_OPTIONS },
    { key: 'platforms', label: 'Platform', options: PLATFORM_OPTIONS },
    { key: 'tags', label: 'Type', options: TAG_OPTIONS },
  ], []);

  const selectedMap: Record<string, Set<string>> = {
    statuses: filters.statuses,
    platforms: filters.platforms,
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
    for (const v of filters.platforms) {
      const opt = PLATFORM_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `platforms:${v}`, label: opt.label });
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
    router.push('/live-sessions', { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  const sidebarContent = (
    <FilterSidebar groups={filterGroups} selected={selectedMap} onChange={handleFilterChange} />
  );

  return (
    <>
      <PageHero
        eyebrow="Live Sessions"
        title={<>Real-time learning with <span className="text-gradient">industry experts</span></>}
        subtitle="Join interactive live sessions, ask questions, and learn alongside a community of peers."
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <SearchInput
                value={filters.search}
                onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
                placeholder="Search sessions by title or topic…"
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
            <div className="hidden lg:block">{sidebarContent}</div>

            <div>
              <div className="text-sm text-slate-500 mb-4">
                {loading ? (
                  <span className="inline-block h-4 w-40 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <>Showing <span className="font-semibold text-slate-800">{sessions.length}</span> of {total} sessions</>
                )}
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => <SessionCardSkeleton key={i} />)}
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-20 text-center">
                  <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-700">No live sessions found</p>
                  <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
                  <button onClick={handleClearAll} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white text-sm font-medium shadow-btn hover:bg-brand-600 transition-colors">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sessions.map((s, i) => (
                    <Reveal key={s.id} delay={(i % 3) * 0.05}>
                      <SessionCard session={s} index={i} />
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

export default function LiveSessionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="h-48 bg-gradient-to-br from-brand-700 to-brand-500 animate-pulse" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SessionCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <LiveSessionsPageInner />
    </Suspense>
  );
}
