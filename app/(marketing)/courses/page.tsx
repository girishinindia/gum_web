'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Star, Sparkles, Award, Flame } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { ContentCard, type UnifiedItem, type ContentType } from '@/components/ui/ContentCard';
import { Reveal } from '@/components/ui/Reveal';
import {
  SearchInput,
  SortDropdown,
  FilterChips,
  PaginationBar,
  FilterSidebar,
  FilterDrawer,
  PriceRangeCard,
  type SortOption,
  type FilterGroup,
  type FilterChip,
  type PriceRangeState,
} from '@/components/ui/filters';
import {
  fetchCoursesList,
  fetchBundlesList,
  fetchBatchesList,
  fetchInstructorsList,
  fetchBlogList,
  fetchWebinarsList,
  fetchLiveSessionsList,
  fetchPodcastList,
  api,
  categoryName,
  subCategoryName,
  type CourseListItem,
  type Category,
  type SubCategory,
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

const CONTENT_TYPE_OPTIONS = [
  { value: 'courses', label: 'Courses' },
  { value: 'bundles', label: 'Course Bundles' },
  { value: 'batches', label: 'Batches' },
  { value: 'instructors', label: 'Instructors' },
  { value: 'blogs', label: 'Blogs' },
  { value: 'webinars', label: 'Webinars' },
  { value: 'live_sessions', label: 'Live Sessions' },
  { value: 'podcasts', label: 'Podcasts' },
  { value: 'live_classes', label: 'Live Classes' },
];

const DEFAULT_CONTENT_TYPES = new Set(['courses', 'bundles', 'batches']);

const LEVEL_OPTIONS = [
  { value: 'absolute_beginner', label: 'Absolute Beginner' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advance', label: 'Advance' },
  { value: 'expert', label: 'Expert' },
  { value: 'mega', label: 'Mega' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5 & above' },
  { value: '4.0', label: '4.0 & above' },
  { value: '3.5', label: '3.5 & above' },
];

const TAG_OPTIONS = [
  { value: 'bestseller', label: 'Bestseller', icon: Star, iconColor: 'text-amber-500' },
  { value: 'new', label: 'New', icon: Sparkles, iconColor: 'text-violet-500' },
  { value: 'certificate', label: 'Certificate', icon: Award, iconColor: 'text-emerald-500' },
  { value: 'featured', label: 'Featured', icon: Flame, iconColor: 'text-rose-500' },
];

// ─── Filter state type ─────────────────────────────────────────────────

interface FilterState {
  search: string;
  sort: string;
  order: 'asc' | 'desc';
  page: number;
  contentTypes: Set<string>;
  categories: Set<string>;
  subCategories: Set<string>;
  levels: Set<string>;
  ratingMin: string;
  isFree: boolean;
  priceMin: string;
  priceMax: string;
  languages: Set<string>;
  tags: Set<string>;
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Parse URL search params → filter state */
function paramsToState(sp: URLSearchParams): FilterState {
  const typeStr = sp.get('type') || '';
  return {
    search: sp.get('search') || '',
    sort: sp.get('sort') || 'rating_count',
    order: (sp.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(sp.get('page') || '1') || 1,
    contentTypes: typeStr
      ? new Set(typeStr.split(',').filter(Boolean))
      : new Set(DEFAULT_CONTENT_TYPES),
    categories: new Set((sp.get('cat') || '').split(',').filter(Boolean)),
    subCategories: new Set((sp.get('sub') || '').split(',').filter(Boolean)),
    levels: new Set((sp.get('level') || '').split(',').filter(Boolean)),
    ratingMin: sp.get('rating') || '',
    isFree: sp.get('free') === 'true',
    priceMin: sp.get('pmin') || '',
    priceMax: sp.get('pmax') || '',
    languages: new Set((sp.get('lang') || '').split(',').filter(Boolean)),
    tags: new Set((sp.get('tag') || '').split(',').filter(Boolean)),
  };
}

/** Filter state → URL search params string */
function stateToParams(s: FilterState): string {
  const p = new URLSearchParams();
  if (s.search) p.set('search', s.search);
  if (s.sort !== 'rating_count') p.set('sort', s.sort);
  if (s.order !== 'desc') p.set('order', s.order);
  if (s.page > 1) p.set('page', String(s.page));
  // Only serialize content types if they differ from defaults
  const sortedTypes = [...s.contentTypes].sort().join(',');
  const sortedDefaults = [...DEFAULT_CONTENT_TYPES].sort().join(',');
  if (sortedTypes !== sortedDefaults) p.set('type', [...s.contentTypes].join(','));
  if (s.categories.size) p.set('cat', [...s.categories].join(','));
  if (s.subCategories.size) p.set('sub', [...s.subCategories].join(','));
  if (s.levels.size) p.set('level', [...s.levels].join(','));
  if (s.ratingMin) p.set('rating', s.ratingMin);
  if (s.isFree) p.set('free', 'true');
  if (s.priceMin) p.set('pmin', s.priceMin);
  if (s.priceMax) p.set('pmax', s.priceMax);
  if (s.languages.size) p.set('lang', [...s.languages].join(','));
  if (s.tags.size) p.set('tag', [...s.tags].join(','));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

/** Convert UI state to API params (courses endpoint) */
function stateToApiParams(s: FilterState): CourseFilterParams {
  const params: CourseFilterParams = {
    search: s.search || undefined,
    sort: s.sort,
    order: s.order,
    page: s.page,
    limit: PAGE_SIZE,
  };

  // Level — comma-separated for multi-select
  if (s.levels.size > 0) params.difficulty_level = [...s.levels].join(',');

  // Language — use first selected
  if (s.languages.size === 1) params.course_language_id = parseInt([...s.languages][0]);

  // Category — single-select
  if (s.categories.size === 1) params.category_id = [...s.categories][0];

  // Sub-category — comma-separated for multi-select
  if (s.subCategories.size > 0) params.sub_category_id = [...s.subCategories].join(',');

  // Rating
  if (s.ratingMin) params.rating_min = parseFloat(s.ratingMin);

  // Price
  if (s.isFree) params.is_free = true;
  if (s.priceMin) params.price_min = parseFloat(s.priceMin);
  if (s.priceMax) params.price_max = parseFloat(s.priceMax);

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
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter option lists (loaded once)
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategory[]>([]);
  const [languageOptions, setLanguageOptions] = useState<Language[]>([]);

  // Parse current filters from URL
  const filters = useMemo(() => paramsToState(searchParams), [searchParams]);

  // ── Load filter options once ──
  useEffect(() => {
    api.categories().then((data) => { if (data) setCategoryOptions(data); });
    api.subCategories().then((data) => { if (data) setSubCategoryOptions(data); });
    api.allLanguages().then((data) => { if (data) setLanguageOptions(data); });
  }, []);

  // ── Multi-source fetch when filters change ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const selectedTypes = [...filters.contentTypes] as ContentType[];
    const perTypeLimit = Math.max(2, Math.ceil(PAGE_SIZE / selectedTypes.length));

    // Build parallel fetch promises for each selected content type
    const fetches: Promise<{ type: ContentType; items: UnifiedItem[]; total: number; totalPages: number }>[] = [];

    // Common params
    const search = filters.search || undefined;
    const page = filters.page;

    if (filters.contentTypes.has('courses')) {
      const p = stateToApiParams(filters);
      p.limit = perTypeLimit;
      fetches.push(
        fetchCoursesList(p).then((r) => ({
          type: 'courses' as ContentType,
          items: r.data.map((d) => ({ type: 'courses' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (filters.contentTypes.has('bundles')) {
      fetches.push(
        fetchBundlesList({
          search, page, limit: perTypeLimit,
          is_free: filters.isFree || undefined,
          rating_min: filters.ratingMin ? parseFloat(filters.ratingMin) : undefined,
          sort: 'rating_count', order: 'desc',
        }).then((r) => ({
          type: 'bundles' as ContentType,
          items: r.data.map((d) => ({ type: 'bundles' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (filters.contentTypes.has('batches')) {
      fetches.push(
        fetchBatchesList({
          search, page, limit: perTypeLimit,
          is_free: filters.isFree || undefined,
          is_active: true,
        }).then((r) => ({
          type: 'batches' as ContentType,
          items: r.data.map((d) => ({ type: 'batches' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (filters.contentTypes.has('instructors')) {
      fetches.push(
        fetchInstructorsList({
          search, page, limit: perTypeLimit,
          sort: 'rating_average', order: 'desc',
        }).then((r) => ({
          type: 'instructors' as ContentType,
          items: r.data.map((d) => ({ type: 'instructors' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (filters.contentTypes.has('blogs')) {
      fetches.push(
        fetchBlogList({
          search, page, limit: perTypeLimit,
          sort: 'published_at', order: 'desc',
        }).then((r) => ({
          type: 'blogs' as ContentType,
          items: r.data.map((d) => ({ type: 'blogs' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (filters.contentTypes.has('webinars')) {
      fetches.push(
        fetchWebinarsList({
          search, page, limit: perTypeLimit,
          is_free: filters.isFree || undefined,
          sort: 'scheduled_at', order: 'desc',
        }).then((r) => ({
          type: 'webinars' as ContentType,
          items: r.data.map((d) => ({ type: 'webinars' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (filters.contentTypes.has('live_sessions') || filters.contentTypes.has('live_classes')) {
      fetches.push(
        fetchLiveSessionsList({
          search, page, limit: perTypeLimit,
          sort: 'created_at', order: 'desc',
        }).then((r) => ({
          type: 'live_sessions' as ContentType,
          items: r.data.map((d) => ({ type: 'live_sessions' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (filters.contentTypes.has('podcasts')) {
      fetches.push(
        fetchPodcastList({
          search, page, limit: perTypeLimit,
          sort: 'published_at', order: 'desc',
        }).then((r) => ({
          type: 'podcasts' as ContentType,
          items: r.data.map((d) => ({ type: 'podcasts' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    Promise.all(fetches).then((results) => {
      if (cancelled) return;

      // Interleave results round-robin for a mixed grid
      const merged: UnifiedItem[] = [];
      const maxLen = Math.max(...results.map((r) => r.items.length), 0);
      for (let i = 0; i < maxLen; i++) {
        for (const r of results) {
          if (i < r.items.length) merged.push(r.items[i]);
        }
      }

      setItems(merged);
      setTotal(results.reduce((sum, r) => sum + r.total, 0));
      setTotalPages(Math.max(...results.map((r) => r.totalPages), 0));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [filters]);

  // ── URL sync helper ──
  const updateFilters = useCallback(
    (updater: (prev: FilterState) => FilterState) => {
      const next = updater(paramsToState(searchParams));
      router.push(`/courses${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ── Sub-categories filtered by selected categories ──
  const filteredSubCategories = useMemo(() => {
    if (filters.categories.size === 0) return subCategoryOptions;
    const selectedCatIds = new Set([...filters.categories].map(Number));
    return subCategoryOptions.filter((sc) => sc.category_id && selectedCatIds.has(sc.category_id));
  }, [subCategoryOptions, filters.categories]);

  // ── Build filter groups for sidebar ──
  // Top groups: Content Type, Category, Sub-category, Level, Rating
  const topGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    groups.push({
      key: 'contentTypes',
      label: 'Content Type',
      options: CONTENT_TYPE_OPTIONS,
      maxVisible: 10,
    });

    if (categoryOptions.length > 0) {
      groups.push({
        key: 'categories',
        label: 'Category',
        type: 'radio',
        options: categoryOptions.map((c) => ({ value: String(c.id), label: categoryName(c) })),
        maxVisible: 6,
      });
    }

    if (filteredSubCategories.length > 0) {
      groups.push({
        key: 'subCategories',
        label: 'Sub-category',
        options: filteredSubCategories.map((sc) => ({
          value: String(sc.id),
          label: subCategoryName(sc),
        })),
        maxVisible: 6,
      });
    }

    groups.push({
      key: 'levels',
      label: 'Level',
      options: LEVEL_OPTIONS,
      maxVisible: 7,
    });

    groups.push({
      key: 'ratingMin',
      label: 'Rating',
      options: RATING_OPTIONS,
      type: 'radio',
    });

    return groups;
  }, [categoryOptions, filteredSubCategories]);

  // Bottom groups: Language, Tags
  const bottomGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    if (languageOptions.length > 0) {
      groups.push({
        key: 'languages',
        label: 'Language',
        options: languageOptions.map((l) => ({ value: String(l.id), label: l.name })),
      });
    }

    groups.push({
      key: 'tags',
      label: 'Tags',
      options: TAG_OPTIONS,
    });

    return groups;
  }, [languageOptions]);

  // Map of group key → selected set for the FilterSidebar
  const selectedMap: Record<string, Set<string>> = {
    contentTypes: filters.contentTypes,
    categories: filters.categories,
    subCategories: filters.subCategories,
    levels: filters.levels,
    ratingMin: filters.ratingMin ? new Set([filters.ratingMin]) : new Set(),
    languages: filters.languages,
    tags: filters.tags,
  };

  // Price range state
  const priceState: PriceRangeState = {
    isFree: filters.isFree,
    min: filters.priceMin,
    max: filters.priceMax,
  };

  // ── Filter change handler (checkbox / radio groups) ──
  function handleFilterChange(groupKey: string, value: string, checked: boolean) {
    updateFilters((prev) => {
      // Radio group (rating) — single select
      if (groupKey === 'ratingMin') {
        return { ...prev, ratingMin: checked ? value : '', page: 1 };
      }

      // Category — single-select radio: pick one or deselect
      if (groupKey === 'categories') {
        const categories = checked ? new Set([value]) : new Set<string>();
        // Always clear sub-categories when category changes
        return { ...prev, categories, subCategories: new Set<string>(), page: 1 };
      }

      // Checkbox groups
      const key = groupKey as keyof FilterState;
      const set = new Set(prev[key] as Set<string>);
      if (checked) set.add(value);
      else set.delete(value);

      return { ...prev, [key]: set, page: 1 };
    });
  }

  // ── Price range handler ──
  function handlePriceChange(next: PriceRangeState) {
    updateFilters((prev) => ({
      ...prev,
      isFree: next.isFree,
      priceMin: next.min,
      priceMax: next.max,
      page: 1,
    }));
  }

  // ── Build active filter chips ──
  const chips: FilterChip[] = useMemo(() => {
    const result: FilterChip[] = [];

    // Content type chips (only show chips for non-default selections)
    for (const v of filters.contentTypes) {
      if (!DEFAULT_CONTENT_TYPES.has(v)) {
        const opt = CONTENT_TYPE_OPTIONS.find((o) => o.value === v);
        if (opt) result.push({ key: `contentTypes:${v}`, label: opt.label });
      }
    }
    // Show chips for removed defaults
    for (const v of DEFAULT_CONTENT_TYPES) {
      if (!filters.contentTypes.has(v)) {
        const opt = CONTENT_TYPE_OPTIONS.find((o) => o.value === v);
        if (opt) result.push({ key: `contentTypes-off:${v}`, label: `No ${opt.label}` });
      }
    }

    for (const v of filters.categories) {
      const cat = categoryOptions.find((c) => String(c.id) === v);
      if (cat) result.push({ key: `categories:${v}`, label: categoryName(cat) });
    }
    for (const v of filters.subCategories) {
      const sc = subCategoryOptions.find((s) => String(s.id) === v);
      if (sc) result.push({ key: `subCategories:${v}`, label: subCategoryName(sc) });
    }
    for (const v of filters.levels) {
      const opt = LEVEL_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `levels:${v}`, label: opt.label });
    }
    if (filters.ratingMin) {
      const opt = RATING_OPTIONS.find((o) => o.value === filters.ratingMin);
      if (opt) result.push({ key: `ratingMin:${filters.ratingMin}`, label: opt.label });
    }
    if (filters.isFree) {
      result.push({ key: 'price:free', label: 'Free' });
    } else {
      if (filters.priceMin) result.push({ key: 'price:min', label: `Min ₹${filters.priceMin}` });
      if (filters.priceMax) result.push({ key: 'price:max', label: `Max ₹${filters.priceMax}` });
    }
    for (const v of filters.languages) {
      const lang = languageOptions.find((l) => String(l.id) === v);
      if (lang) result.push({ key: `languages:${v}`, label: lang.name });
    }
    for (const v of filters.tags) {
      const opt = TAG_OPTIONS.find((o) => o.value === v);
      if (opt) result.push({ key: `tags:${v}`, label: opt.label });
    }
    return result;
  }, [filters, categoryOptions, subCategoryOptions, languageOptions]);

  function handleChipRemove(chipKey: string) {
    // Handle special chip keys
    if (chipKey.startsWith('contentTypes-off:')) {
      // Re-add a removed default content type
      const value = chipKey.replace('contentTypes-off:', '');
      handleFilterChange('contentTypes', value, true);
      return;
    }
    if (chipKey === 'price:free') {
      handlePriceChange({ isFree: false, min: '', max: '' });
      return;
    }
    if (chipKey === 'price:min') {
      handlePriceChange({ ...priceState, min: '' });
      return;
    }
    if (chipKey === 'price:max') {
      handlePriceChange({ ...priceState, max: '' });
      return;
    }
    if (chipKey.startsWith('ratingMin:')) {
      handleFilterChange('ratingMin', '', false);
      return;
    }
    const [groupKey, value] = chipKey.split(':');
    handleFilterChange(groupKey, value, false);
  }

  function handleClearAll() {
    router.push('/courses', { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  // ── Sidebar content (shared between desktop + mobile drawer) ──
  const sidebarContent = (
    <div className="space-y-4">
      <FilterSidebar
        groups={topGroups}
        selected={selectedMap}
        onChange={handleFilterChange}
      />
      <PriceRangeCard
        value={priceState}
        onChange={handlePriceChange}
      />
      <FilterSidebar
        groups={bottomGroups}
        selected={selectedMap}
        onChange={handleFilterChange}
      />
    </div>
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
            <aside className="hidden lg:block">{sidebarContent}</aside>

            {/* Course grid */}
            <div>
              {/* Result count */}
              <div className="text-sm text-slate-500 mb-4">
                {loading ? (
                  <span className="inline-block h-4 w-40 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <>Showing <span className="font-semibold text-slate-800">{items.length}</span> of {total} results</>
                )}
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg font-semibold text-slate-700">No results found</p>
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
                  {items.map((item, i) => (
                    <Reveal key={`${item.type}-${item.id}`} delay={(i % 3) * 0.05}>
                      <ContentCard item={item} index={i} />
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
