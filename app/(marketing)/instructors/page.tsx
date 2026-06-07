'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, Star, Users, BookOpen, BadgeCheck, Flame } from 'lucide-react';
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
  fetchInstructorsList,
  type InstructorProfile,
  type InstructorFilterParams,
} from '@/lib/api';

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 18;

const SORT_OPTIONS: SortOption[] = [
  { label: 'Most Popular', sort: 'student_count', order: 'desc' },
  { label: 'Highest Rated', sort: 'rating_average', order: 'desc' },
  { label: 'Most Courses', sort: 'course_count', order: 'desc' },
  { label: 'Newest', sort: 'created_at', order: 'desc' },
];

const TYPE_OPTIONS = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'guest', label: 'Guest' },
];

const TAG_OPTIONS = [
  { value: 'verified', label: 'Verified', icon: BadgeCheck, iconColor: 'text-brand-500' },
  { value: 'featured', label: 'Featured', icon: Flame, iconColor: 'text-rose-500' },
];

const ACCENT_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-rose-500 to-amber-500',
  'from-emerald-500 to-brand-500',
  'from-violet-500 to-brand-500',
  'from-amber-500 to-rose-500',
  'from-brand-600 to-accent',
];

// ─── Helpers ────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]?.toUpperCase() ?? '').join('').slice(0, 2);
}

function formatStudents(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}k+`;
  return `${n}+`;
}

function toBadge(p: InstructorProfile): string {
  if (p.is_verified) return 'Top Rated';
  if (p.is_featured) return 'Bestseller';
  return 'Mentor';
}

function paramsToState(sp: URLSearchParams) {
  return {
    search: sp.get('search') || '',
    sort: sp.get('sort') || 'student_count',
    order: (sp.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(sp.get('page') || '1') || 1,
    types: new Set((sp.get('type') || '').split(',').filter(Boolean)),
    tags: new Set((sp.get('tag') || '').split(',').filter(Boolean)),
  };
}

function stateToParams(s: ReturnType<typeof paramsToState>): string {
  const p = new URLSearchParams();
  if (s.search) p.set('search', s.search);
  if (s.sort !== 'student_count') p.set('sort', s.sort);
  if (s.order !== 'desc') p.set('order', s.order);
  if (s.page > 1) p.set('page', String(s.page));
  if (s.types.size) p.set('type', [...s.types].join(','));
  if (s.tags.size) p.set('tag', [...s.tags].join(','));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

function stateToApiParams(s: ReturnType<typeof paramsToState>): InstructorFilterParams {
  const params: InstructorFilterParams = {
    search: s.search || undefined,
    sort: s.sort,
    order: s.order,
    page: s.page,
    limit: PAGE_SIZE,
  };
  // Instructor type — single-select on API side, use first
  if (s.types.size === 1) params.instructor_type = [...s.types][0];
  if (s.tags.has('verified')) params.is_verified = true;
  if (s.tags.has('featured')) params.is_featured = true;
  return params;
}

// ─── Skeleton ───────────────────────────────────────────────────────────

function InstructorCardSkeleton() {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card p-5 text-center animate-pulse">
      <div className="mx-auto h-20 w-20 rounded-full bg-slate-200" />
      <div className="mt-3 h-4 bg-slate-200 rounded w-16 mx-auto" />
      <div className="mt-2 h-4 bg-slate-100 rounded w-24 mx-auto" />
      <div className="mt-1 h-3 bg-slate-100 rounded w-20 mx-auto" />
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1">
        <div className="h-6 bg-slate-100 rounded" />
        <div className="h-6 bg-slate-100 rounded" />
        <div className="h-6 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ─── Instructor card ────────────────────────────────────────────────────

function InstructorCard({ p, index }: { p: InstructorProfile; index: number }) {
  const name = p.users?.full_name ?? 'Instructor';
  const accent = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];
  const avatarUrl = p.users?.avatar_url ?? null;

  return (
    <Link
      href={`/instructors/${p.user_id ?? p.id}`}
      className="group block rounded-md bg-white border border-slate-200 shadow-card p-5 text-center hover:-translate-y-1 hover:shadow-cardHover hover:border-brand-200 transition-all"
    >
      {avatarUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={avatarUrl} alt={name} className="mx-auto h-20 w-20 rounded-full object-cover shadow-btn" />
      ) : (
        <div className={cn(
          'mx-auto h-20 w-20 rounded-full bg-gradient-to-br text-white heading text-2xl flex items-center justify-center shadow-btn',
          accent,
        )}>
          {initials(name)}
        </div>
      )}
      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-bold">
        <BadgeCheck className="h-3 w-3" /> {toBadge(p)}
      </div>
      <h3 className="mt-2 heading text-sm font-semibold text-slate-900 group-hover:text-brand-700 transition-colors leading-tight">
        {name}
      </h3>
      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 min-h-[28px]">{p.instructor_type ?? ''}</p>

      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10.5px] text-slate-500">
        <div className="flex flex-col items-center gap-0.5">
          <BookOpen className="h-3 w-3" />
          <span className="font-semibold text-slate-700">{p.course_count ?? 0}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Users className="h-3 w-3" />
          <span className="font-semibold text-slate-700">{formatStudents(p.student_count ?? 0)}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Star className="h-3 w-3 fill-warn text-warn" />
          <span className="font-semibold text-slate-700">{p.rating_average ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Inner component ────────────────────────────────────────────────────

function InstructorsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = useMemo(() => paramsToState(searchParams), [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchInstructorsList(stateToApiParams(filters)).then((result) => {
      if (cancelled) return;
      setInstructors(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const updateFilters = useCallback(
    (updater: (prev: ReturnType<typeof paramsToState>) => ReturnType<typeof paramsToState>) => {
      const next = updater(paramsToState(searchParams));
      router.push(`/instructors${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  const filterGroups: FilterGroup[] = useMemo(() => [
    { key: 'types', label: 'Instructor Type', options: TYPE_OPTIONS },
    { key: 'tags', label: 'Tags', options: TAG_OPTIONS },
  ], []);

  const selectedMap: Record<string, Set<string>> = {
    types: filters.types,
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
    for (const v of filters.types) {
      const opt = TYPE_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `types:${v}`, label: opt.label });
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
    router.push('/instructors', { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  const sidebarContent = (
    <FilterSidebar groups={filterGroups} selected={selectedMap} onChange={handleFilterChange} />
  );

  return (
    <>
      <PageHero
        eyebrow="Meet our Mentors"
        title={<>Learn from people who <span className="text-gradient">ship real things</span></>}
        subtitle="Senior engineers, scientists and designers from Google, Razorpay, Flipkart, TCS, and more."
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <SearchInput
                value={filters.search}
                onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
                placeholder="Search instructors…"
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
                  <>Showing <span className="font-semibold text-slate-800">{instructors.length}</span> of {total} instructors</>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => <InstructorCardSkeleton key={i} />)}
                </div>
              ) : instructors.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg font-semibold text-slate-700">No instructors found</p>
                  <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
                  <button onClick={handleClearAll} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white text-sm font-medium shadow-btn hover:bg-brand-600 transition-colors">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {instructors.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 5) * 0.04}>
                      <InstructorCard p={p} index={i} />
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

export default function InstructorsListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="h-48 bg-gradient-to-br from-brand-700 to-brand-500 animate-pulse" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <InstructorCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <InstructorsPageInner />
    </Suspense>
  );
}
