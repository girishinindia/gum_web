'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, Headphones, Play, Clock, Calendar, Flame } from 'lucide-react';
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
  fetchPodcastList,
  api,
  categoryName,
  type Podcast,
  type Category,
  type PodcastFilterParams,
} from '@/lib/api';

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', sort: 'published_at', order: 'desc' },
  { label: 'Oldest First', sort: 'published_at', order: 'asc' },
  { label: 'Episode #', sort: 'episode_number', order: 'desc' },
  { label: 'Title A–Z', sort: 'title', order: 'asc' },
];

const TAG_OPTIONS = [
  { value: 'featured', label: 'Featured', icon: Flame, iconColor: 'text-rose-500' },
];

const COVER_GRADIENTS = [
  'from-brand-600 to-violet-500',
  'from-rose-600 to-amber-500',
  'from-emerald-600 to-brand-500',
  'from-violet-600 to-rose-500',
];

// ─── Helpers ────────────────────────────────────────────────────────────

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '';
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

function paramsToState(sp: URLSearchParams) {
  return {
    search: sp.get('search') || '',
    sort: sp.get('sort') || 'published_at',
    order: (sp.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(sp.get('page') || '1') || 1,
    categories: new Set((sp.get('cat') || '').split(',').filter(Boolean)),
    tags: new Set((sp.get('tag') || '').split(',').filter(Boolean)),
  };
}

function stateToParams(s: ReturnType<typeof paramsToState>): string {
  const p = new URLSearchParams();
  if (s.search) p.set('search', s.search);
  if (s.sort !== 'published_at') p.set('sort', s.sort);
  if (s.order !== 'desc') p.set('order', s.order);
  if (s.page > 1) p.set('page', String(s.page));
  if (s.categories.size) p.set('cat', [...s.categories].join(','));
  if (s.tags.size) p.set('tag', [...s.tags].join(','));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

function stateToApiParams(s: ReturnType<typeof paramsToState>): PodcastFilterParams {
  const params: PodcastFilterParams = {
    search: s.search || undefined,
    sort: s.sort,
    order: s.order,
    page: s.page,
    limit: PAGE_SIZE,
  };
  if (s.categories.size === 1) params.category_id = parseInt([...s.categories][0]);
  if (s.tags.has('featured')) params.is_featured = true;
  return params;
}

// ─── Skeleton ───────────────────────────────────────────────────────────

function PodcastCardSkeleton() {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-16" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-3 bg-slate-100 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

// ─── Podcast card ───────────────────────────────────────────────────────

function PodcastCard({ p, index }: { p: Podcast; index: number }) {
  const hasThumbnail = !!p.thumbnail_url;
  const poster = p.users ? `${p.users.first_name} ${p.users.last_name}`.trim() : '';
  const category = p.categories?.name ?? '';
  const dt = p.published_at ? new Date(p.published_at) : null;

  return (
    <Link
      href={`/podcasts/${p.id}`}
      className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
    >
      {hasThumbnail ? (
        <div className="relative aspect-[16/10] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.thumbnail_url!} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="h-5 w-5 text-brand-700 ml-0.5" />
            </div>
          </div>
          {category && (
            <div className="absolute top-3 left-3 inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-violet-700 shadow-sm uppercase tracking-wider">
              {category}
            </div>
          )}
        </div>
      ) : (
        <div className={cn('relative aspect-[16/10] bg-gradient-to-br', COVER_GRADIENTS[index % COVER_GRADIENTS.length])}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Play className="h-5 w-5 text-white ml-0.5" />
            </div>
          </div>
          {category && (
            <div className="absolute top-3 left-3 inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-violet-700 shadow-sm uppercase tracking-wider">
              {category}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {p.episode_number != null && (
          <div className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Episode {p.episode_number}
          </div>
        )}
        <h3 className="heading text-[15px] font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors min-h-[40px]">
          {p.title}
        </h3>
        {p.short_summary && (
          <p className="mt-1.5 text-[12px] text-slate-500 line-clamp-2">{p.short_summary}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-[11.5px] text-slate-500 pt-3 border-t border-slate-100">
          {poster && <span className="truncate max-w-[60%]">{poster}</span>}
          <span className="inline-flex items-center gap-1">
            {p.duration ? (
              <><Clock className="h-3 w-3" /> {formatDuration(p.duration)}</>
            ) : dt ? (
              <><Calendar className="h-3 w-3" /> {dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</>
            ) : null}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Inner component ────────────────────────────────────────────────────

function PodcastsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);

  const filters = useMemo(() => paramsToState(searchParams), [searchParams]);

  // ── Load categories once (reusing course categories) ──
  useEffect(() => {
    api.categories().then((data) => { if (data) setCategoryOptions(data); });
  }, []);

  // ── Fetch podcasts ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPodcastList(stateToApiParams(filters)).then((result) => {
      if (cancelled) return;
      setPodcasts(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const updateFilters = useCallback(
    (updater: (prev: ReturnType<typeof paramsToState>) => ReturnType<typeof paramsToState>) => {
      const next = updater(paramsToState(searchParams));
      router.push(`/podcasts${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];
    if (categoryOptions.length > 0) {
      groups.push({
        key: 'categories',
        label: 'Category',
        options: categoryOptions.map((c) => ({ value: String(c.id), label: categoryName(c) })),
      });
    }
    groups.push({ key: 'tags', label: 'Tags', options: TAG_OPTIONS });
    return groups;
  }, [categoryOptions]);

  const selectedMap: Record<string, Set<string>> = {
    categories: filters.categories,
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
    for (const v of filters.categories) {
      const cat = categoryOptions.find((c) => String(c.id) === v);
      if (cat) result.push({ key: `categories:${v}`, label: categoryName(cat) });
    }
    for (const v of filters.tags) {
      const opt = TAG_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `tags:${v}`, label: opt.label });
    }
    return result;
  }, [filters, categoryOptions]);

  function handleChipRemove(chipKey: string) {
    const [groupKey, value] = chipKey.split(':');
    handleFilterChange(groupKey, value, false);
  }

  function handleClearAll() {
    router.push('/podcasts', { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  const sidebarContent = (
    <FilterSidebar groups={filterGroups} selected={selectedMap} onChange={handleFilterChange} />
  );

  return (
    <>
      <PageHero
        eyebrow="Podcasts"
        title={<>Listen &amp; learn <span className="text-gradient">on the go</span></>}
        subtitle="Bite-sized episodes on careers, tech trends and behind-the-scenes from our instructors."
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <SearchInput
                value={filters.search}
                onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
                placeholder="Search podcasts…"
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
                ) : total === 0 && !filters.search && chips.length === 0 ? (
                  null
                ) : (
                  <>Showing <span className="font-semibold text-slate-800">{podcasts.length}</span> of {total} episodes</>
                )}
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => <PodcastCardSkeleton key={i} />)}
                </div>
              ) : podcasts.length === 0 ? (
                <div className="text-center py-16">
                  <Headphones className="h-12 w-12 text-slate-300 mx-auto" />
                  <h2 className="mt-4 heading text-xl text-slate-600">
                    {filters.search || chips.length > 0 ? 'No episodes found' : 'No episodes yet'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {filters.search || chips.length > 0
                      ? 'Try adjusting your filters or search query.'
                      : 'Check back soon — new episodes drop regularly.'}
                  </p>
                  {(filters.search || chips.length > 0) && (
                    <button onClick={handleClearAll} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white text-sm font-medium shadow-btn hover:bg-brand-600 transition-colors">
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {podcasts.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 4) * 0.04}>
                      <PodcastCard p={p} index={i} />
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

export default function PodcastsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="h-48 bg-gradient-to-br from-brand-700 to-brand-500 animate-pulse" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <PodcastCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <PodcastsPageInner />
    </Suspense>
  );
}
