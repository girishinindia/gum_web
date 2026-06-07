'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Star, Sparkles, Award, Flame } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { CourseCard } from '@/components/ui/CourseCard';
import { Reveal } from '@/components/ui/Reveal';
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
  fetchCoursesList,
  api,
  type CourseListItem,
  type Category,
  type Language,
  type CourseFilterParams,
} from '@/lib/api';

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const SORT_OPTIONS: SortOption[] = [
  { label: 'Most Popular', sort: 'rating_count', order: 'desc' },
  { label: 'Highest Rated', sort: 'rating_average', order: 'desc' },
  { label: 'Newest First', sort: 'created_at', order: 'desc' },
  { label: 'Price: Low → High', sort: 'price', order: 'asc' },
  { label: 'Price: High → Low', sort: 'price', order: 'desc' },
  { label: 'Name A–Z', sort: 'name', order: 'asc' },
];

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const PRICE_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: '0-20000', label: 'Under ₹20,000' },
  { value: '20000-40000', label: '₹20,000 – ₹40,000' },
  { value: '40000-999999', label: '₹40,000+' },
];

const TAG_OPTIONS = [
  { value: 'bestseller', label: 'Bestseller', icon: Star, iconColor: 'text-amber-500' },
  { value: 'new', label: 'New', icon: Sparkles, iconColor: 'text-violet-500' },
  { value: 'certificate', label: 'Certificate', icon: Award, iconColor: 'text-emerald-500' },
  { value: 'featured', label: 'Featured', icon: Flame, iconColor: 'text-rose-500' },
];

// ─── Helpers ────────────────────────────────────────────────────────────

/** Parse URL search params → filter state */
function paramsToState(sp: URLSearchParams) {
  return {
    search: sp.get('search') || '',
    sort: sp.get('sort') || 'rating_count',
    order: (sp.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(sp.get('page') || '1') || 1,
    levels: new Set((sp.get('level') || '').split(',').filter(Boolean)),
    languages: new Set((sp.get('lang') || '').split(',').filter(Boolean)),
    categories: new Set((sp.get('cat') || '').split(',').filter(Boolean)),
    prices: new Set((sp.get('price') || '').split(',').filter(Boolean)),
    tags: new Set((sp.get('tag') || '').split(',').filter(Boolean)),
  };
}

/** Filter state → URL search params string */
function stateToParams(s: ReturnType<typeof paramsToState>): string {
  const p = new URLSearchParams();
  if (s.search) p.set('search', s.search);
  if (s.sort !== 'rating_count') p.set('sort', s.sort);
  if (s.order !== 'desc') p.set('order', s.order);
  if (s.page > 1) p.set('page', String(s.page));
  if (s.levels.size) p.set('level', [...s.levels].join(','));
  if (s.languages.size) p.set('lang', [...s.languages].join(','));
  if (s.categories.size) p.set('cat', [...s.categories].join(','));
  if (s.prices.size) p.set('price', [...s.prices].join(','));
  if (s.tags.size) p.set('tag', [...s.tags].join(','));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

/** Convert UI state to API params */
function stateToApiParams(s: ReturnType<typeof paramsToState>): CourseFilterParams {
  const params: CourseFilterParams = {
    search: s.search || undefined,
    sort: s.sort,
    order: s.order,
    page: s.page,
    limit: PAGE_SIZE,
  };
  // Level — API accepts single value, use first selected
  if (s.levels.size === 1) params.difficulty_level = [...s.levels][0];

  // Language — use first selected (by ID)
  if (s.languages.size === 1) params.course_language_id = parseInt([...s.languages][0]);

  // Category — use first selected (by ID)
  if (s.categories.size === 1) params.category_id = parseInt([...s.categories][0]);

  // Price range
  if (s.prices.size) {
    const priceVals = [...s.prices];
    if (priceVals.includes('free')) params.is_free = true;
    // Use widest range from selected options
    const ranges = priceVals.filter((v) => v !== 'free').map((v) => v.split('-').map(Number));
    if (ranges.length > 0) {
      const mins = ranges.map((r) => r[0]);
      const maxes = ranges.map((r) => r[1]);
      params.price_min = Math.min(...mins);
      params.price_max = Math.max(...maxes);
    }
  }

  // Tags
  if (s.tags.has('bestseller')) params.is_bestseller = true;
  if (s.tags.has('new')) params.is_new = true;
  if (s.tags.has('certificate')) params.has_certificate = true;
  if (s.tags.has('featured')) params.is_featured = true;

  return params;
}

// ─── Skeleton loader ────────────────────────────────────────────────────

function CourseCardSkeleton() {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="h-3 bg-slate-100 rounded w-20" />
          <div className="h-3 bg-slate-100 rounded w-10" />
        </div>
      </div>
    </div>
  );
}

// ─── Inner component (uses useSearchParams) ─────────────────────────────

function CoursesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── State ──
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter option lists (loaded once)
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [languageOptions, setLanguageOptions] = useState<Language[]>([]);

  // Parse current filters from URL
  const filters = useMemo(() => paramsToState(searchParams), [searchParams]);

  // ── Load filter options once ──
  useEffect(() => {
    api.categories().then((data) => { if (data) setCategoryOptions(data); });
    api.allLanguages().then((data) => { if (data) setLanguageOptions(data); });
  }, []);

  // ── Fetch courses when filters change ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const apiParams = stateToApiParams(filters);
    fetchCoursesList(apiParams).then((result) => {
      if (cancelled) return;
      setCourses(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  // ── URL sync helper ──
  const updateFilters = useCallback(
    (updater: (prev: ReturnType<typeof paramsToState>) => ReturnType<typeof paramsToState>) => {
      const next = updater(paramsToState(searchParams));
      router.push(`/courses${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ── Build filter groups for sidebar ──
  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    if (categoryOptions.length > 0) {
      groups.push({
        key: 'categories',
        label: 'Category',
        options: categoryOptions.map((c) => ({ value: String(c.id), label: c.name })),
      });
    }

    groups.push({
      key: 'levels',
      label: 'Level',
      options: LEVEL_OPTIONS,
    });

    if (languageOptions.length > 0) {
      groups.push({
        key: 'languages',
        label: 'Language',
        options: languageOptions.map((l) => ({ value: String(l.id), label: l.name })),
      });
    }

    groups.push({
      key: 'prices',
      label: 'Price',
      options: PRICE_OPTIONS,
    });

    groups.push({
      key: 'tags',
      label: 'Tags',
      options: TAG_OPTIONS,
    });

    return groups;
  }, [categoryOptions, languageOptions]);

  // Map of group key → selected set for the FilterSidebar
  const selectedMap: Record<string, Set<string>> = {
    categories: filters.categories,
    levels: filters.levels,
    languages: filters.languages,
    prices: filters.prices,
    tags: filters.tags,
  };

  // ── Filter change handler ──
  function handleFilterChange(groupKey: string, value: string, checked: boolean) {
    updateFilters((prev) => {
      const key = groupKey as keyof typeof prev;
      const set = new Set(prev[key] as Set<string>);
      if (checked) set.add(value);
      else set.delete(value);
      return { ...prev, [key]: set, page: 1 };
    });
  }

  // ── Build active filter chips ──
  const chips: FilterChip[] = useMemo(() => {
    const result: FilterChip[] = [];
    for (const v of filters.levels) {
      const opt = LEVEL_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `levels:${v}`, label: opt.label });
    }
    for (const v of filters.languages) {
      const lang = languageOptions.find((l) => String(l.id) === v);
      if (lang) result.push({ key: `languages:${v}`, label: lang.name });
    }
    for (const v of filters.categories) {
      const cat = categoryOptions.find((c) => String(c.id) === v);
      if (cat) result.push({ key: `categories:${v}`, label: cat.name });
    }
    for (const v of filters.prices) {
      const opt = PRICE_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `prices:${v}`, label: opt.label });
    }
    for (const v of filters.tags) {
      const opt = TAG_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `tags:${v}`, label: opt.label });
    }
    return result;
  }, [filters, languageOptions, categoryOptions]);

  function handleChipRemove(chipKey: string) {
    const [groupKey, value] = chipKey.split(':');
    handleFilterChange(groupKey, value, false);
  }

  function handleClearAll() {
    router.push('/courses', { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  // ── Sidebar content (shared between desktop + mobile drawer) ──
  const sidebarContent = (
    <FilterSidebar
      groups={filterGroups}
      selected={selectedMap}
      onChange={handleFilterChange}
    />
  );

  return (
    <>
      <PageHero
        eyebrow="All Courses"
        title={<>Find the program that <span className="text-gradient">fits your career goal</span></>}
        subtitle="Industry-grade courses across multiple categories. Filter, compare, enroll."
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* ── Top bar: Search + Mobile filter btn + Sort + Count ── */}
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <SearchInput
                value={filters.search}
                onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
                placeholder="Search Python, AI, Full Stack…"
              />
              {/* Mobile filter toggle */}
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

          {/* ── Filter chips ── */}
          <div className="mt-3">
            <FilterChips chips={chips} onRemove={handleChipRemove} onClearAll={handleClearAll} />
          </div>

          {/* ── Main layout: Sidebar + Grid ── */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">{sidebarContent}</div>

            {/* Course grid */}
            <div>
              {/* Result count */}
              <div className="text-sm text-slate-500 mb-4">
                {loading ? (
                  <span className="inline-block h-4 w-40 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <>Showing <span className="font-semibold text-slate-800">{courses.length}</span> of {total} courses</>
                )}
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg font-semibold text-slate-700">No courses found</p>
                  <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
                  <button
                    onClick={handleClearAll}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white text-sm font-medium shadow-btn hover:bg-brand-600 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {courses.map((c, i) => (
                    <Reveal key={c.id} delay={(i % 3) * 0.05}>
                      <CourseCard course={c} index={i} />
                    </Reveal>
                  ))}
                </div>
              )}

              {/* Pagination */}
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

      {/* ── Mobile filter drawer ── */}
      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} activeCount={activeFilterCount}>
        {sidebarContent}
      </FilterDrawer>
    </>
  );
}

// ─── Page wrapper with Suspense (required for useSearchParams) ──────────

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="h-48 bg-gradient-to-br from-brand-700 to-brand-500 animate-pulse" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <CoursesPageInner />
    </Suspense>
  );
}
