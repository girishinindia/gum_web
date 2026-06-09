'use client';

import { useEffect, useState, useCallback, useMemo, Suspense, type ReactNode } from 'react';
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
  FilterDropdown,
  FilterMultiDropdown,
  FilterPanel,
  ResultStrip,
  PriceRangeCard,
  type SortOption,
  type FilterGroup,
  type FilterOption,
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
import { useLanguage } from '@/components/layout/LanguageProvider';

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

/**
 * Per-type fetch cap. We pull the full matching set for each selected content
 * type (up to this many), then merge + globally sort + paginate client-side so
 * the count, the sort and the pagination all derive from ONE consistent set —
 * which is what makes the count and the visible results agree. Server list
 * endpoints clamp `limit` to 100; beyond ~100 items per type, adopt the
 * `fn_catalog_search` RPC for true single-query server-side pagination.
 */
const FETCH_CAP = 100;

const SORT_OPTIONS: SortOption[] = [
  { label: 'Most Popular', sort: 'rating_count', order: 'desc' },
  { label: 'Highest Rated', sort: 'rating_average', order: 'desc' },
  { label: 'Newest First', sort: 'created_at', order: 'desc' },
  { label: 'Price: Low → High', sort: 'price', order: 'asc' },
  { label: 'Price: High → Low', sort: 'price', order: 'desc' },
  { label: 'Name A–Z', sort: 'name', order: 'asc' },
];

/** All possible content type options for the checkbox filter */
const ALL_CONTENT_TYPE_OPTIONS = [
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

/**
 * Map site_section_settings keys → content type values.
 * Batches has no own section key — it's visible when "courses" is visible.
 */
const SECTION_KEY_MAP: Record<string, string> = {
  courses: 'courses',
  bundles: 'bundles',
  instructors: 'instructors',
  blogs: 'blogs',
  webinars: 'webinars',
  live_sessions: 'live_sessions',
  podcasts: 'podcasts',
  live_classes: 'live_classes',
};

// ─── Per-content-type filter configurations ─────────────────────────────

// Values MUST match the DB CHECK constraint `chk_courses_difficulty` exactly,
// otherwise the filter sends a string the column never stores → 0 results.
const LEVEL_OPTIONS: FilterOption[] = [
  { value: 'absolute beginner', label: 'Absolute Beginner' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'mega', label: 'Mega' },
];

const RATING_OPTIONS: FilterOption[] = [
  { value: '4.5', label: '4.5 & above' },
  { value: '4.0', label: '4.0 & above' },
  { value: '3.5', label: '3.5 & above' },
];

const TAG_OPTIONS: FilterOption[] = [
  { value: 'bestseller', label: 'Bestseller', icon: Star, iconColor: 'text-amber-500' },
  { value: 'new', label: 'New', icon: Sparkles, iconColor: 'text-violet-500' },
  { value: 'certificate', label: 'Certificate', icon: Award, iconColor: 'text-emerald-500' },
  { value: 'featured', label: 'Featured', icon: Flame, iconColor: 'text-rose-500' },
];

/** Extended FilterGroup with optional colored section header */
interface TypeFilterGroup extends FilterGroup {
  /** If set, renders a colored header bar above this group's section */
  sectionHeader?: { label: string; bg: string; text: string; border: string };
}

/** Filter groups specific to each content type */
const FILTER_CONFIG: Record<string, TypeFilterGroup[]> = {
  courses: [
    { key: 'levels', label: 'Level', options: LEVEL_OPTIONS, maxVisible: 7 },
    { key: 'ratingMin', label: 'Rating', options: RATING_OPTIONS, type: 'radio' },
    { key: 'tags', label: 'Tags', options: TAG_OPTIONS },
  ],
  bundles: [
    { key: 'ratingMin', label: 'Rating', options: RATING_OPTIONS, type: 'radio' },
    { key: 'bundleFeatured', label: 'Featured', options: [{ value: 'true', label: 'Featured Only' }] },
  ],
  batches: [
    {
      key: 'batchStatus', label: 'Batch Status', type: 'radio',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'completed', label: 'Completed' },
      ],
    },
    { key: 'batchFree', label: 'Free Only', options: [{ value: 'true', label: 'Free Batches' }] },
  ],
  instructors: [
    {
      key: 'instructorType', label: 'Instructor Type', type: 'radio',
      options: [
        { value: 'internal', label: 'Internal' },
        { value: 'external', label: 'External' },
        { value: 'guest', label: 'Guest' },
      ],
    },
    { key: 'instructorVerified', label: 'Verified', options: [{ value: 'true', label: 'Verified Only' }] },
    { key: 'instructorFeatured', label: 'Featured', options: [{ value: 'true', label: 'Featured Only' }] },
  ],
  blogs: [
    { key: 'blogFeatured', label: 'Featured', options: [{ value: 'true', label: 'Featured Only' }] },
  ],
  webinars: [
    {
      key: 'webinarStatus', label: 'Webinar Status', type: 'radio',
      options: [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'live', label: 'Live Now' },
        { value: 'completed', label: 'Completed' },
      ],
    },
    { key: 'webinarFree', label: 'Free Only', options: [{ value: 'true', label: 'Free Webinars' }] },
  ],
  live_sessions: [
    {
      key: 'sessionStatus', label: 'Session Status', type: 'radio',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'live', label: 'Live' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'meetingPlatform', label: 'Platform', type: 'radio',
      options: [
        { value: 'zoom', label: 'Zoom' },
        { value: 'google_meet', label: 'Google Meet' },
        { value: 'ms_teams', label: 'MS Teams' },
      ],
    },
    { key: 'sessionRecurring', label: 'Recurring', options: [{ value: 'true', label: 'Recurring Only' }] },
  ],
  podcasts: [
    { key: 'podcastFeatured', label: 'Featured', options: [{ value: 'true', label: 'Featured Only' }] },
  ],
  live_classes: [
    {
      key: 'sessionStatus', label: 'Session Status', type: 'radio',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'live', label: 'Live' },
        { value: 'completed', label: 'Completed' },
      ],
    },
  ],
};

/** Colored section header config per content type */
const SECTION_HEADERS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  courses: { label: 'Course Filters', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  bundles: { label: 'Bundle Filters', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  batches: { label: 'Batch Filters', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  instructors: { label: 'Instructor Filters', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  blogs: { label: 'Blog Filters', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  webinars: { label: 'Webinar Filters', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  live_sessions: { label: 'Live Session Filters', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  podcasts: { label: 'Podcast Filters', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  live_classes: { label: 'Live Class Filters', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

// ─── Filter state type ─────────────────────────────────────────────────

interface FilterState {
  search: string;
  sort: string;
  order: 'asc' | 'desc';
  page: number;
  pageSize: number;
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
  // ── Per-content-type filter values ──
  batchStatus: string;
  webinarStatus: string;
  webinarFree: boolean;
  sessionStatus: string;
  meetingPlatform: string;
  sessionRecurring: boolean;
  instructorType: string;
  instructorVerified: boolean;
  instructorFeatured: boolean;
  blogFeatured: boolean;
  bundleFeatured: boolean;
  podcastFeatured: boolean;
  batchFree: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Parse URL search params → filter state */
function paramsToState(sp: URLSearchParams): FilterState {
  // `type` ABSENT → untouched, fall back to the 3 defaults.
  // `type` PRESENT (even empty) → honour the explicit selection, so a single
  // type stays isolated and unchecking all no longer snaps back to the default.
  const typeParam = sp.get('type');
  return {
    search: sp.get('search') || '',
    sort: sp.get('sort') || 'rating_count',
    order: (sp.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(sp.get('page') || '1') || 1,
    pageSize: parseInt(sp.get('limit') || String(PAGE_SIZE)) || PAGE_SIZE,
    contentTypes: typeParam === null
      ? new Set(DEFAULT_CONTENT_TYPES)
      : new Set(typeParam.split(',').filter(Boolean)),
    categories: new Set((sp.get('cat') || '').split(',').filter(Boolean)),
    subCategories: new Set((sp.get('sub') || '').split(',').filter(Boolean)),
    levels: new Set((sp.get('level') || '').split(',').filter(Boolean)),
    ratingMin: sp.get('rating') || '',
    isFree: sp.get('free') === 'true',
    priceMin: sp.get('pmin') || '',
    priceMax: sp.get('pmax') || '',
    languages: new Set((sp.get('lang') || '').split(',').filter(Boolean)),
    tags: new Set((sp.get('tag') || '').split(',').filter(Boolean)),
    // Per-content-type filters
    batchStatus: sp.get('bstatus') || '',
    webinarStatus: sp.get('wstatus') || '',
    webinarFree: sp.get('wfree') === 'true',
    sessionStatus: sp.get('sstatus') || '',
    meetingPlatform: sp.get('platform') || '',
    sessionRecurring: sp.get('recurring') === 'true',
    instructorType: sp.get('itype') || '',
    instructorVerified: sp.get('iverified') === 'true',
    instructorFeatured: sp.get('ifeatured') === 'true',
    blogFeatured: sp.get('blfeatured') === 'true',
    bundleFeatured: sp.get('bufeatured') === 'true',
    podcastFeatured: sp.get('pfeatured') === 'true',
    batchFree: sp.get('bfree') === 'true',
  };
}

/** Filter state → URL search params string */
function stateToParams(s: FilterState): string {
  const p = new URLSearchParams();
  if (s.search) p.set('search', s.search);
  if (s.sort !== 'rating_count') p.set('sort', s.sort);
  if (s.order !== 'desc') p.set('order', s.order);
  if (s.page > 1) p.set('page', String(s.page));
  if (s.pageSize !== PAGE_SIZE) p.set('limit', String(s.pageSize));
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
  // Per-content-type filters
  if (s.batchStatus) p.set('bstatus', s.batchStatus);
  if (s.webinarStatus) p.set('wstatus', s.webinarStatus);
  if (s.webinarFree) p.set('wfree', 'true');
  if (s.sessionStatus) p.set('sstatus', s.sessionStatus);
  if (s.meetingPlatform) p.set('platform', s.meetingPlatform);
  if (s.sessionRecurring) p.set('recurring', 'true');
  if (s.instructorType) p.set('itype', s.instructorType);
  if (s.instructorVerified) p.set('iverified', 'true');
  if (s.instructorFeatured) p.set('ifeatured', 'true');
  if (s.blogFeatured) p.set('blfeatured', 'true');
  if (s.bundleFeatured) p.set('bufeatured', 'true');
  if (s.podcastFeatured) p.set('pfeatured', 'true');
  if (s.batchFree) p.set('bfree', 'true');
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
    limit: s.pageSize,
  };

  // Level — comma-separated for multi-select
  if (s.levels.size > 0) params.difficulty_level = [...s.levels].join(',');

  // Language — S9: pass comma-separated for multi-select
  if (s.languages.size > 0) params.course_language_id = [...s.languages].join(',');

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

/** Per-page configuration for the shared catalog view. Phase 1 covers the
 *  per-page chrome (path/hero/search placeholder); later phases extend this
 *  with fixedType, fetch fns, filter config and sort allowlists. */
export interface CatalogConfig {
  basePath: string;
  searchPlaceholder: string;
  hero: { eyebrow: string; title: ReactNode; subtitle: string };
  /** Single-type page: locks the grid to one content type and hides the
   *  content-type picker + its chips. Omit for the multi-type /courses catalog. */
  fixedType?: ContentType;
  /** Show the Category + Sub-category dropdowns (courses, blog, podcasts). */
  showCategory?: boolean;
}

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

function CatalogBody({ config }: { config: CatalogConfig }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { active: activeLang } = useLanguage();

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
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [visibilityLoaded, setVisibilityLoaded] = useState(false);

  // Parse current filters from URL
  const filters = useMemo(() => {
    const s = paramsToState(searchParams);
    // Single-type pages lock the content type regardless of the URL.
    if (config.fixedType) s.contentTypes = new Set<string>([config.fixedType]);
    return s;
  }, [searchParams, config.fixedType]);

  // ── Load filter options + section visibility once ──
  useEffect(() => {
    api.categories().then((data) => { if (data) setCategoryOptions(data); });
    api.subCategories().then((data) => { if (data) setSubCategoryOptions(data); });
    // S9: Use course-specific languages (only languages with published courses)
    api.courseLanguages().then((data) => { if (data) setLanguageOptions(data); });
    api.sectionVisibility().then((data) => {
      if (data) setSectionVisibility(data);
      setVisibilityLoaded(true);
    });
  }, []);

  // ── Content type options filtered by section visibility ──
  const visibleContentTypeOptions = useMemo(() => {
    if (!visibilityLoaded) return ALL_CONTENT_TYPE_OPTIONS; // show all until loaded
    return ALL_CONTENT_TYPE_OPTIONS.filter((opt) => {
      // "batches" has no own section key — visible when courses is visible
      if (opt.value === 'batches') return sectionVisibility['courses'] !== false;
      // Look up the section key for this content type
      const sectionKey = Object.entries(SECTION_KEY_MAP).find(([, ct]) => ct === opt.value)?.[0];
      if (!sectionKey) return true; // no mapping = always visible
      return sectionVisibility[sectionKey] !== false;
    });
  }, [sectionVisibility, visibilityLoaded]);

  // ── Multi-source fetch when filters change ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const selectedTypes = [...filters.contentTypes] as ContentType[];

    // ── S8 FIX: Type narrowing — when per-type filters are active, only fetch
    //    content types that own those filters. This prevents unfiltered items from
    //    other types polluting the grid. ──
    const typesWithActiveFilters = new Set<string>();
    for (const [type, groups] of Object.entries(FILTER_CONFIG)) {
      for (const g of groups) {
        const key = g.key as keyof FilterState;
        const val = filters[key];
        const hasValue = val instanceof Set ? val.size > 0
          : typeof val === 'boolean' ? val
          : typeof val === 'string' ? val !== ''
          : false;
        if (hasValue) { typesWithActiveFilters.add(type); break; }
      }
    }

    // ── Fix B: Sidebar-only filters that aren't in FILTER_CONFIG but still
    //    narrow results to a specific content type. When language is selected,
    //    only courses support course_language_id — bundles/batches don't, so
    //    including them would pollute the grid with unfiltered items. ──
    if (filters.languages.size > 0) typesWithActiveFilters.add('courses');

    // ── Similarly, category/sub-category/level/price filters are course-specific.
    //    When they're active, narrow to courses so other types don't dilute results. ──
    if (filters.categories.size > 0 || filters.subCategories.size > 0) typesWithActiveFilters.add('courses');
    if (filters.levels.size > 0) typesWithActiveFilters.add('courses');
    if (filters.ratingMin) { typesWithActiveFilters.add('courses'); typesWithActiveFilters.add('bundles'); }
    if (filters.isFree || filters.priceMin || filters.priceMax) {
      typesWithActiveFilters.add('courses');
      typesWithActiveFilters.add('bundles');
    }

    // ── Tag semantics ──
    //  bestseller / new / certificate exist only on courses → the FILTER_CONFIG
    //  loop above already narrows to courses when any tag is set.
    //  'featured' also exists on bundles + podcasts, so let it span those too.
    if (filters.tags.has('featured')) {
      typesWithActiveFilters.add('courses');
      typesWithActiveFilters.add('bundles');
      typesWithActiveFilters.add('podcasts');
    }

    // Single-type pages always fetch exactly their one type (narrowing, which is
    // course-centric, is only relevant to the multi-type catalog).
    const typesToFetch = config.fixedType
      ? new Set<ContentType>([config.fixedType])
      : new Set(
          typesWithActiveFilters.size > 0
            ? selectedTypes.filter(t => typesWithActiveFilters.has(t))
            : selectedTypes,
        );

    // ── Fetch the full matching set per type (capped), so the merged grid can
    //    be globally sorted and paginated client-side from ONE consistent set.
    //    This is what makes the count, sort and pagination agree. ──
    const perTypeLimit = FETCH_CAP;

    // Build parallel fetch promises for each selected content type
    const fetches: Promise<{ type: ContentType; items: UnifiedItem[]; total: number; totalPages: number }>[] = [];

    // ── Sort mapping: translate user's sort choice to valid columns per type ──
    // Types that support 'price': courses, bundles, batches
    // Types that support 'name': courses, bundles, batches, instructors
    // Types that support 'rating_average'/'rating_count': courses, bundles, instructors
    // Other types fall back to their natural sort column
    const SORT_DEFAULTS: Record<string, { sort: string; order: 'asc' | 'desc' }> = {
      bundles: { sort: 'rating_count', order: 'desc' },
      batches: { sort: 'created_at', order: 'desc' },
      instructors: { sort: 'created_at', order: 'desc' },
      blogs: { sort: 'published_at', order: 'desc' },
      webinars: { sort: 'scheduled_at', order: 'desc' },
      live_sessions: { sort: 'created_at', order: 'desc' },
      podcasts: { sort: 'published_at', order: 'desc' },
    };
    // Only columns that actually exist per table — the grid re-sorts client-side
    // for display, so the server sort just needs to be a real column (no 500s).
    const SORT_SUPPORT: Record<string, Set<string>> = {
      bundles: new Set(['price', 'name', 'rating_count', 'rating_average', 'created_at']),
      batches: new Set(['price', 'created_at']),
      instructors: new Set(['created_at']),
      blogs: new Set(['published_at', 'created_at']),
      webinars: new Set(['scheduled_at', 'created_at']),
      live_sessions: new Set(['created_at']),
      podcasts: new Set(['published_at', 'created_at']),
    };
    function sortFor(type: string): { sort: string; order: 'asc' | 'desc' } {
      const supported = SORT_SUPPORT[type];
      if (supported && supported.has(filters.sort)) {
        return { sort: filters.sort, order: filters.order as 'asc' | 'desc' };
      }
      return SORT_DEFAULTS[type] || { sort: 'created_at', order: 'desc' as const };
    }

    // Common params. We always fetch page 1 of each type (the whole set under
    // the cap); the merged result is paginated client-side by filters.page below.
    const search = filters.search || undefined;
    const page = 1;

    if (typesToFetch.has('courses')) {
      const p = stateToApiParams(filters);
      p.page = 1;               // fetch the full set; the merged grid is paginated client-side
      p.limit = perTypeLimit;
      if (activeLang?.id) p.language_id = activeLang.id;
      fetches.push(
        fetchCoursesList(p).then((r) => ({
          type: 'courses' as ContentType,
          items: r.data.map((d) => ({ type: 'courses' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (typesToFetch.has('bundles')) {
      fetches.push(
        fetchBundlesList({
          search, page, limit: perTypeLimit,
          is_free: filters.isFree || undefined,
          rating_min: filters.ratingMin ? parseFloat(filters.ratingMin) : undefined,
          is_featured: filters.bundleFeatured || filters.tags.has('featured') || undefined,
          price_min: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
          price_max: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
          language_id: activeLang?.id || undefined,
          ...sortFor('bundles'),
        }).then((r) => ({
          type: 'bundles' as ContentType,
          items: r.data.map((d) => ({ type: 'bundles' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (typesToFetch.has('batches')) {
      fetches.push(
        fetchBatchesList({
          search, page, limit: perTypeLimit,
          is_free: filters.batchFree || filters.isFree || undefined,
          batch_status: filters.batchStatus || undefined,
          is_active: !filters.batchStatus ? true : undefined,
          language_id: activeLang?.id || undefined,
          ...sortFor('batches'),
        }).then((r) => ({
          type: 'batches' as ContentType,
          items: r.data.map((d) => ({ type: 'batches' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (typesToFetch.has('instructors')) {
      fetches.push(
        fetchInstructorsList({
          search, page, limit: perTypeLimit,
          instructor_type: filters.instructorType || undefined,
          is_verified: filters.instructorVerified || undefined,
          is_featured: filters.instructorFeatured || undefined,
          ...sortFor('instructors'),
        }).then((r) => ({
          type: 'instructors' as ContentType,
          items: r.data.map((d) => ({ type: 'instructors' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (typesToFetch.has('blogs')) {
      fetches.push(
        fetchBlogList({
          search, page, limit: perTypeLimit,
          is_featured: filters.blogFeatured || undefined,
          ...sortFor('blogs'),
        }).then((r) => ({
          type: 'blogs' as ContentType,
          items: r.data.map((d) => ({ type: 'blogs' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (typesToFetch.has('webinars')) {
      fetches.push(
        fetchWebinarsList({
          search, page, limit: perTypeLimit,
          is_free: filters.webinarFree || filters.isFree || undefined,
          webinar_status: filters.webinarStatus || undefined,
          is_active: !filters.webinarStatus ? true : undefined,
          language_id: activeLang?.id || undefined,
          ...sortFor('webinars'),
        }).then((r) => ({
          type: 'webinars' as ContentType,
          items: r.data.map((d) => ({ type: 'webinars' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (typesToFetch.has('live_sessions') || typesToFetch.has('live_classes')) {
      fetches.push(
        fetchLiveSessionsList({
          search, page, limit: perTypeLimit,
          session_status: filters.sessionStatus || undefined,
          meeting_platform: filters.meetingPlatform || undefined,
          is_recurring: filters.sessionRecurring || undefined,
          ...sortFor('live_sessions'),
        }).then((r) => ({
          type: 'live_sessions' as ContentType,
          items: r.data.map((d) => ({ type: 'live_sessions' as ContentType, id: d.id, data: d })),
          total: r.total, totalPages: r.totalPages,
        })),
      );
    }

    if (typesToFetch.has('podcasts')) {
      fetches.push(
        fetchPodcastList({
          search, page, limit: perTypeLimit,
          is_featured: filters.podcastFeatured || filters.tags.has('featured') || undefined,
          ...sortFor('podcasts'),
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

      // ── Cross-type sort: re-sort the merged array by the user's
      //    chosen sort field so items from different content types
      //    appear in the correct global order (e.g. price low→high). ──
      const sf = filters.sort;
      const asc = filters.order === 'asc';
      const getSortVal = (item: UnifiedItem): number | string | null => {
        const d = item.data as any;
        switch (sf) {
          case 'price':
            if (d.is_free) return 0;
            return d.price != null ? Number(d.price) : null;
          case 'name':
            return (d.name || d.title || '').toLowerCase();
          case 'rating_average':
            return d.rating_average != null ? Number(d.rating_average) : null;
          case 'rating_count':
            return d.rating_count != null ? Number(d.rating_count) : null;
          case 'created_at':
          case 'published_at':
          case 'scheduled_at':
            return d[sf] || d.created_at || null;
          default:
            return null;
        }
      };
      merged.sort((a, b) => {
        const va = getSortVal(a);
        const vb = getSortVal(b);
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === 'string'
          ? va.localeCompare(vb as string)
          : (va as number) - (vb as number);
        return asc ? cmp : -cmp;
      });

      // ── Paginate the fully-merged, globally-sorted set client-side. `total`,
      //    the visible page and `totalPages` all derive from `merged` — a single
      //    source — so the count and the rendered results can never disagree. ──
      const startIdx = (filters.page - 1) * filters.pageSize;
      const display = merged.slice(startIdx, startIdx + filters.pageSize);

      setItems(display);
      setTotal(merged.length);
      setTotalPages(Math.ceil(merged.length / filters.pageSize) || 1);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [filters, activeLang?.id]);

  // ── URL sync helper ──
  const updateFilters = useCallback(
    (updater: (prev: FilterState) => FilterState) => {
      const next = updater(paramsToState(searchParams));
      router.push(`${config.basePath}${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ── Sub-categories filtered by selected categories ──
  const filteredSubCategories = useMemo(() => {
    if (filters.categories.size === 0) return subCategoryOptions;
    const selectedCatIds = new Set([...filters.categories].map(Number));
    return subCategoryOptions.filter((sc) => sc.category_id && selectedCatIds.has(sc.category_id));
  }, [subCategoryOptions, filters.categories]);

  // ── Category dropdown options (single-select) ──
  const categoryDropdownOptions = useMemo(
    () => categoryOptions.map((c) => ({ value: String(c.id), label: categoryName(c), count: c.course_count })),
    [categoryOptions],
  );

  // ── Sub-category dropdown options (multi-select, filtered by selected category) ──
  const subCategoryDropdownOptions = useMemo(
    () => filteredSubCategories.map((sc) => ({ value: String(sc.id), label: subCategoryName(sc) })),
    [filteredSubCategories],
  );

  // ── Content Type checkbox group (visibility-gated) ──
  const contentTypeGroup: FilterGroup = useMemo(() => ({
    key: 'contentTypes',
    label: 'Content Type',
    options: visibleContentTypeOptions,
    maxVisible: 10,
  }), [visibleContentTypeOptions]);

  // ── Dynamic per-content-type filter groups ──
  const dynamicFilterGroups = useMemo(() => {
    const selected = [...filters.contentTypes];
    const groups: { header: typeof SECTION_HEADERS[string] | null; filters: FilterGroup[] }[] = [];

    for (const type of selected) {
      const config = FILTER_CONFIG[type];
      if (!config || config.length === 0) continue;
      groups.push({
        header: SECTION_HEADERS[type] || null,
        filters: config,
      });
    }
    return groups;
  }, [filters.contentTypes]);

  // Bottom groups: Language (only when courses is selected)
  const bottomGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    if (filters.contentTypes.has('courses') && languageOptions.length > 0) {
      groups.push({
        key: 'languages',
        label: 'Language',
        options: languageOptions.map((l) => ({ value: String(l.id), label: l.name })),
      });
    }

    return groups;
  }, [languageOptions, filters.contentTypes]);

  // Map of group key → selected set for the FilterSidebar
  const selectedMap: Record<string, Set<string>> = {
    contentTypes: filters.contentTypes,
    categories: filters.categories,
    subCategories: filters.subCategories,
    levels: filters.levels,
    ratingMin: filters.ratingMin ? new Set([filters.ratingMin]) : new Set(),
    languages: filters.languages,
    tags: filters.tags,
    // Per-content-type filter selections
    batchStatus: filters.batchStatus ? new Set([filters.batchStatus]) : new Set(),
    webinarStatus: filters.webinarStatus ? new Set([filters.webinarStatus]) : new Set(),
    webinarFree: filters.webinarFree ? new Set(['true']) : new Set(),
    sessionStatus: filters.sessionStatus ? new Set([filters.sessionStatus]) : new Set(),
    meetingPlatform: filters.meetingPlatform ? new Set([filters.meetingPlatform]) : new Set(),
    sessionRecurring: filters.sessionRecurring ? new Set(['true']) : new Set(),
    instructorType: filters.instructorType ? new Set([filters.instructorType]) : new Set(),
    instructorVerified: filters.instructorVerified ? new Set(['true']) : new Set(),
    instructorFeatured: filters.instructorFeatured ? new Set(['true']) : new Set(),
    blogFeatured: filters.blogFeatured ? new Set(['true']) : new Set(),
    bundleFeatured: filters.bundleFeatured ? new Set(['true']) : new Set(),
    podcastFeatured: filters.podcastFeatured ? new Set(['true']) : new Set(),
    batchFree: filters.batchFree ? new Set(['true']) : new Set(),
  };

  // Price range state
  const priceState: PriceRangeState = {
    isFree: filters.isFree,
    min: filters.priceMin,
    max: filters.priceMax,
  };

  // ── Per-type radio filter keys (string value, single-select) ──
  const RADIO_STRING_KEYS = new Set([
    'ratingMin', 'batchStatus', 'webinarStatus', 'sessionStatus',
    'meetingPlatform', 'instructorType',
  ]);

  // ── Per-type boolean filter keys (checkbox → true/false) ──
  const BOOLEAN_KEYS = new Set([
    'webinarFree', 'sessionRecurring', 'instructorVerified',
    'instructorFeatured', 'blogFeatured', 'bundleFeatured',
    'podcastFeatured', 'batchFree',
  ]);

  // ── Filter change handler (checkbox / radio groups) ──
  function handleFilterChange(groupKey: string, value: string, checked: boolean) {
    updateFilters((prev) => {
      // Radio groups that store a string value
      if (RADIO_STRING_KEYS.has(groupKey)) {
        return { ...prev, [groupKey]: checked ? value : '', page: 1 };
      }

      // Boolean groups (checkbox → true/false)
      if (BOOLEAN_KEYS.has(groupKey)) {
        return { ...prev, [groupKey]: checked, page: 1 };
      }

      // Category — single-select radio: pick one or deselect
      if (groupKey === 'categories') {
        const categories = checked ? new Set([value]) : new Set<string>();
        return { ...prev, categories, subCategories: new Set<string>(), page: 1 };
      }

      // Checkbox groups (Set-based: contentTypes, levels, languages, tags, etc.)
      const key = groupKey as keyof FilterState;
      const current = prev[key];
      if (current instanceof Set) {
        const set = new Set(current);
        if (checked) set.add(value);
        else set.delete(value);
        return { ...prev, [key]: set, page: 1 };
      }

      return { ...prev, page: 1 };
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

    // Content type chips (multi-type catalog only — single-type pages are locked)
    if (!config.fixedType) {
      for (const v of filters.contentTypes) {
        if (!DEFAULT_CONTENT_TYPES.has(v)) {
          const opt = ALL_CONTENT_TYPE_OPTIONS.find((o) => o.value === v);
          if (opt) result.push({ key: `contentTypes:${v}`, label: opt.label });
        }
      }
      // Show chips for removed defaults
      for (const v of DEFAULT_CONTENT_TYPES) {
        if (!filters.contentTypes.has(v)) {
          const opt = ALL_CONTENT_TYPE_OPTIONS.find((o) => o.value === v);
          if (opt) result.push({ key: `contentTypes-off:${v}`, label: `No ${opt.label}` });
        }
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
    // Per-content-type filter chips
    if (filters.batchStatus) {
      const opt = FILTER_CONFIG.batches?.[0]?.options.find((o) => o.value === filters.batchStatus);
      result.push({ key: 'batchStatus', label: `Batch: ${opt?.label || filters.batchStatus}` });
    }
    if (filters.webinarStatus) {
      const opt = FILTER_CONFIG.webinars?.[0]?.options.find((o) => o.value === filters.webinarStatus);
      result.push({ key: 'webinarStatus', label: `Webinar: ${opt?.label || filters.webinarStatus}` });
    }
    if (filters.webinarFree) result.push({ key: 'webinarFree', label: 'Free Webinars' });
    if (filters.sessionStatus) {
      const opt = FILTER_CONFIG.live_sessions?.[0]?.options.find((o) => o.value === filters.sessionStatus);
      result.push({ key: 'sessionStatus', label: `Session: ${opt?.label || filters.sessionStatus}` });
    }
    if (filters.meetingPlatform) {
      const opt = FILTER_CONFIG.live_sessions?.[1]?.options.find((o) => o.value === filters.meetingPlatform);
      result.push({ key: 'meetingPlatform', label: `Platform: ${opt?.label || filters.meetingPlatform}` });
    }
    if (filters.sessionRecurring) result.push({ key: 'sessionRecurring', label: 'Recurring Only' });
    if (filters.instructorType) {
      const opt = FILTER_CONFIG.instructors?.[0]?.options.find((o) => o.value === filters.instructorType);
      result.push({ key: 'instructorType', label: `Instructor: ${opt?.label || filters.instructorType}` });
    }
    if (filters.instructorVerified) result.push({ key: 'instructorVerified', label: 'Verified Instructors' });
    if (filters.instructorFeatured) result.push({ key: 'instructorFeatured', label: 'Featured Instructors' });
    if (filters.blogFeatured) result.push({ key: 'blogFeatured', label: 'Featured Blogs' });
    if (filters.bundleFeatured) result.push({ key: 'bundleFeatured', label: 'Featured Bundles' });
    if (filters.podcastFeatured) result.push({ key: 'podcastFeatured', label: 'Featured Podcasts' });
    if (filters.batchFree) result.push({ key: 'batchFree', label: 'Free Batches' });
    return result;
  }, [filters, categoryOptions, subCategoryOptions, languageOptions]);

  function handleChipRemove(chipKey: string) {
    // Handle special chip keys
    if (chipKey.startsWith('contentTypes-off:')) {
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
    // Radio string keys — clear the value
    if (RADIO_STRING_KEYS.has(chipKey)) {
      handleFilterChange(chipKey, '', false);
      return;
    }
    // Boolean keys — uncheck
    if (BOOLEAN_KEYS.has(chipKey)) {
      handleFilterChange(chipKey, 'true', false);
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
    router.push(config.basePath, { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  // ── Selected category value for dropdown (single-select) ──
  const selectedCategoryValue = filters.categories.size === 1 ? [...filters.categories][0] : '';

  // ── Sidebar content (shared between desktop + mobile drawer) ──
  const sidebarContent = (
    <FilterPanel onClearAll={handleClearAll} hasActiveFilters={chips.length > 0}>
      {/* Search inside sidebar */}
      <SearchInput
        value={filters.search}
        onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
        placeholder={config.searchPlaceholder}
      />

      {config.showCategory && (
        <>
          {/* Category dropdown (single-select) */}
          <FilterDropdown
            label="Category"
            placeholder="All Categories"
            options={categoryDropdownOptions}
            value={selectedCategoryValue}
            onChange={(val) => {
              updateFilters((prev) => ({
                ...prev,
                categories: val ? new Set([val]) : new Set<string>(),
                subCategories: new Set<string>(),
                page: 1,
              }));
            }}
          />

          {/* Sub-category dropdown (multi-select, cascades from category) */}
          <FilterMultiDropdown
            label="Sub-category"
            placeholder="All Sub-categories"
            options={subCategoryDropdownOptions}
            selected={filters.subCategories}
            onChange={(val, checked) => handleFilterChange('subCategories', val, checked)}
            disabled={filters.categories.size === 0}
            emptyMessage="Select a category first"
          />
        </>
      )}

      {/* Content type checkboxes — multi-type catalog only */}
      {!config.fixedType && (
        <FilterSidebar
          groups={[contentTypeGroup]}
          selected={selectedMap}
          onChange={handleFilterChange}
        />
      )}

      {/* Dynamic per-content-type filter sections */}
      {dynamicFilterGroups.map((section, idx) => (
        <div key={idx}>
          {/* Colored section header */}
          {section.header && (
            <div className={`px-3 py-1.5 rounded-md text-[11px] font-bold ${section.header.bg} ${section.header.text} border ${section.header.border}`}>
              {section.header.label}
            </div>
          )}
          <FilterSidebar
            groups={section.filters}
            selected={selectedMap}
            onChange={handleFilterChange}
          />
        </div>
      ))}

      {/* Price range (shown when courses or bundles selected) */}
      {(filters.contentTypes.has('courses') || filters.contentTypes.has('bundles')) && (
        <PriceRangeCard
          value={priceState}
          onChange={handlePriceChange}
        />
      )}

      {/* Language (shown when courses selected) */}
      {bottomGroups.length > 0 && (
        <FilterSidebar
          groups={bottomGroups}
          selected={selectedMap}
          onChange={handleFilterChange}
        />
      )}
    </FilterPanel>
  );

  return (
    <>
      <PageHero
        eyebrow={config.hero.eyebrow}
        title={config.hero.title}
        subtitle={config.hero.subtitle}
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* ── Upper result strip ── */}
          <Reveal>
            <div className="flex items-center gap-3 mb-2">
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
              {/* Mobile search (hidden on desktop since it's in the sidebar) */}
              <div className="lg:hidden flex-1">
                <SearchInput
                  value={filters.search}
                  onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
                  placeholder={config.searchPlaceholder}
                />
              </div>
            </div>
            <ResultStrip
              total={total}
              showing={items.length}
              page={filters.page}
              pageSize={filters.pageSize}
              loading={loading}
              sortOptions={SORT_OPTIONS}
              sortValue={filters.sort}
              sortOrder={filters.order}
              onSortChange={(sort, order) => updateFilters((prev) => ({ ...prev, sort, order, page: 1 }))}
              pageSizeOptions={[12, 24, 48]}
              onPageSizeChange={(size) => updateFilters((prev) => ({ ...prev, pageSize: size, page: 1 }))}
            />
          </Reveal>

          {/* ── Filter chips ── */}
          <div className="mt-3">
            <FilterChips chips={chips} onRemove={handleChipRemove} onClearAll={handleClearAll} />
          </div>

          {/* ── Main layout: Sidebar + Grid ── */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Desktop sidebar */}
            {/* Full-length sidebar (no nested scroll) so every filter option is
                visible — the internal scrollbar was clipping options. */}
            <aside className="hidden lg:block self-start">{sidebarContent}</aside>

            {/* Course grid */}
            <div>

              {/* Grid */}
              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: filters.pageSize }).map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="py-20 text-center">
                  {filters.contentTypes.size === 0 ? (
                    <>
                      <p className="text-lg font-semibold text-slate-700">Select a content type</p>
                      <p className="mt-2 text-sm text-slate-500">Pick at least one content type from the sidebar to see results.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-slate-700">No results found</p>
                      <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
                    </>
                  )}
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

export function CatalogView({ config }: { config: CatalogConfig }) {
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
      <CatalogBody config={config} />
    </Suspense>
  );
}
