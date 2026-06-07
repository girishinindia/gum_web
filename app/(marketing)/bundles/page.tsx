'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, Star, Flame, Layers, Users, ArrowRight } from 'lucide-react';
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
  fetchBundlesList,
  type BundleListItem,
  type BundleFilterParams,
} from '@/lib/api';

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const SORT_OPTIONS: SortOption[] = [
  { label: 'Most Popular', sort: 'enrollment_count', order: 'desc' },
  { label: 'Highest Rated', sort: 'rating_average', order: 'desc' },
  { label: 'Newest First', sort: 'created_at', order: 'desc' },
  { label: 'Price: Low → High', sort: 'price', order: 'asc' },
  { label: 'Price: High → Low', sort: 'price', order: 'desc' },
  { label: 'Name A–Z', sort: 'name', order: 'asc' },
];

const PRICE_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: '0-20000', label: 'Under ₹20,000' },
  { value: '20000-50000', label: '₹20,000 – ₹50,000' },
  { value: '50000-999999', label: '₹50,000+' },
];

const TAG_OPTIONS = [
  { value: 'featured', label: 'Featured', icon: Flame, iconColor: 'text-rose-500' },
];

const COVER_GRADIENTS = [
  'from-brand-700 via-brand-600 to-brand-500',
  'from-emerald-700 via-emerald-600 to-brand-500',
  'from-violet-700 via-rose-600 to-amber-500',
];

// ─── Helpers ────────────────────────────────────────────────────────────

function inr(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

function paramsToState(sp: URLSearchParams) {
  return {
    search: sp.get('search') || '',
    sort: sp.get('sort') || 'enrollment_count',
    order: (sp.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(sp.get('page') || '1') || 1,
    prices: new Set((sp.get('price') || '').split(',').filter(Boolean)),
    tags: new Set((sp.get('tag') || '').split(',').filter(Boolean)),
  };
}

function stateToParams(s: ReturnType<typeof paramsToState>): string {
  const p = new URLSearchParams();
  if (s.search) p.set('search', s.search);
  if (s.sort !== 'enrollment_count') p.set('sort', s.sort);
  if (s.order !== 'desc') p.set('order', s.order);
  if (s.page > 1) p.set('page', String(s.page));
  if (s.prices.size) p.set('price', [...s.prices].join(','));
  if (s.tags.size) p.set('tag', [...s.tags].join(','));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

function stateToApiParams(s: ReturnType<typeof paramsToState>): BundleFilterParams {
  const params: BundleFilterParams = {
    search: s.search || undefined,
    sort: s.sort,
    order: s.order,
    page: s.page,
    limit: PAGE_SIZE,
  };
  if (s.prices.size) {
    const priceVals = [...s.prices];
    if (priceVals.includes('free')) params.is_free = true;
    const ranges = priceVals.filter((v) => v !== 'free').map((v) => v.split('-').map(Number));
    if (ranges.length > 0) {
      params.price_min = Math.min(...ranges.map((r) => r[0]));
      params.price_max = Math.max(...ranges.map((r) => r[1]));
    }
  }
  if (s.tags.has('featured')) params.is_featured = true;
  return params;
}

// ─── Skeleton ───────────────────────────────────────────────────────────

function BundleCardSkeleton() {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden animate-pulse">
      <div className="h-32 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-24" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Bundle card ────────────────────────────────────────────────────────

function BundleCard({ b, index }: { b: BundleListItem; index: number }) {
  const price = b.price ?? 0;
  const originalPrice = b.original_price ?? price;
  const savePercent = b.discount_percent ?? (originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0);
  const courseCount = b.course_count ?? 0;
  const hasThumbnail = !!b.thumbnail_url;
  const cover = b.thumbnail_url || COVER_GRADIENTS[index % COVER_GRADIENTS.length];

  return (
    <Link
      href={`/bundles/${b.slug}`}
      className="group relative block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
    >
      {savePercent > 0 && (
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-br from-rose-500 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-md shadow-md">
          SAVE {savePercent}%
        </div>
      )}

      {hasThumbnail ? (
        <div className="relative h-32 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={b.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative h-full flex items-end p-5">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-white">
              <Layers className="h-3 w-3" /> {courseCount} courses
            </div>
          </div>
        </div>
      ) : (
        <div className={cn('relative h-32 bg-gradient-to-br', cover)}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div aria-hidden className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative h-full flex items-end p-5">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-white">
              <Layers className="h-3 w-3" /> {courseCount} courses
            </div>
          </div>
        </div>
      )}

      <div className="p-5">
        <h3 className="heading text-lg font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
          {b.name}
        </h3>
        <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2 min-h-[40px]">{b.description ?? ''}</p>

        <div className="mt-3 flex items-center gap-4 text-[12px] text-slate-500">
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {(b.student_count ?? 0).toLocaleString('en-IN')}+ students</span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
            <Star className="h-3.5 w-3.5 fill-warn text-warn" /> {b.rating_average ?? 0}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="heading text-2xl text-slate-900 leading-none">{inr(price)}</div>
            {originalPrice > price && (
              <div className="text-[12px] text-slate-400 line-through mt-1">{inr(originalPrice)}</div>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
            Enroll <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Inner component ────────────────────────────────────────────────────

function BundlesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bundles, setBundles] = useState<BundleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = useMemo(() => paramsToState(searchParams), [searchParams]);

  // ── Fetch bundles ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBundlesList(stateToApiParams(filters)).then((result) => {
      if (cancelled) return;
      setBundles(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const updateFilters = useCallback(
    (updater: (prev: ReturnType<typeof paramsToState>) => ReturnType<typeof paramsToState>) => {
      const next = updater(paramsToState(searchParams));
      router.push(`/bundles${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ── Filter groups ──
  const filterGroups: FilterGroup[] = useMemo(() => [
    { key: 'prices', label: 'Price', options: PRICE_OPTIONS },
    { key: 'tags', label: 'Tags', options: TAG_OPTIONS },
  ], []);

  const selectedMap: Record<string, Set<string>> = {
    prices: filters.prices,
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
    for (const v of filters.prices) {
      const opt = PRICE_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `prices:${v}`, label: opt.label });
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
    router.push('/bundles', { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  const sidebarContent = (
    <FilterSidebar groups={filterGroups} selected={selectedMap} onChange={handleFilterChange} />
  );

  return (
    <>
      <PageHero
        eyebrow="Career Bundles"
        title={<>Buy a <span className="text-gradient">whole career path</span>, not just a course</>}
        subtitle="Multi-course bundles built around specific career outcomes — saves you up to 54%."
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <SearchInput
                value={filters.search}
                onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
                placeholder="Search bundles…"
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
                  <>Showing <span className="font-semibold text-slate-800">{bundles.length}</span> of {total} bundles</>
                )}
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => <BundleCardSkeleton key={i} />)}
                </div>
              ) : bundles.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg font-semibold text-slate-700">No bundles found</p>
                  <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
                  <button onClick={handleClearAll} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white text-sm font-medium shadow-btn hover:bg-brand-600 transition-colors">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {bundles.map((b, i) => (
                    <Reveal key={b.id} delay={(i % 3) * 0.05}>
                      <BundleCard b={b} index={i} />
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

export default function BundlesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="h-48 bg-gradient-to-br from-brand-700 to-brand-500 animate-pulse" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <BundleCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <BundlesPageInner />
    </Suspense>
  );
}
