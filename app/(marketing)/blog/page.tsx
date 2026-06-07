'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, Calendar, Clock, User, ArrowRight, Flame } from 'lucide-react';
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
  fetchBlogList,
  fetchBlogCategories,
  type BlogPost,
  type BlogCategory,
  type BlogFilterParams,
} from '@/lib/api';

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', sort: 'published_at', order: 'desc' },
  { label: 'Oldest First', sort: 'published_at', order: 'asc' },
  { label: 'Most Viewed', sort: 'view_count', order: 'desc' },
  { label: 'Title A–Z', sort: 'title', order: 'asc' },
];

const TAG_OPTIONS = [
  { value: 'featured', label: 'Featured', icon: Flame, iconColor: 'text-rose-500' },
];

const COVER_GRADIENTS = [
  'from-brand-700 via-brand-600 to-brand-500',
  'from-emerald-700 via-emerald-600 to-brand-500',
  'from-violet-700 via-rose-600 to-amber-500',
  'from-rose-700 via-rose-600 to-amber-500',
  'from-amber-600 via-rose-500 to-violet-600',
  'from-brand-600 via-violet-500 to-rose-500',
];

// ─── Helpers ────────────────────────────────────────────────────────────

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

function stateToApiParams(s: ReturnType<typeof paramsToState>): BlogFilterParams {
  const params: BlogFilterParams = {
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

function BlogCardSkeleton() {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="h-3 bg-slate-100 rounded w-28" />
          <div className="h-3 bg-slate-100 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

// ─── Blog card ──────────────────────────────────────────────────────────

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const category = post.blog_categories?.name ?? '';
  const author = post.users ? `${post.users.first_name} ${post.users.last_name}`.trim() : '';
  const hasFeaturedImage = !!post.featured_image_url;
  const dt = post.published_at ? new Date(post.published_at) : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
    >
      {hasFeaturedImage ? (
        <div className="relative aspect-[16/9] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featured_image_url!} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
          {category && (
            <div className="absolute top-3 left-3 inline-flex bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-brand-700 uppercase tracking-wider">
              {category}
            </div>
          )}
        </div>
      ) : (
        <div className={cn('relative aspect-[16/9] bg-gradient-to-br', COVER_GRADIENTS[index % COVER_GRADIENTS.length])}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
          {category && (
            <div className="absolute top-3 left-3 inline-flex bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-brand-700 uppercase tracking-wider">
              {category}
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <h3 className="heading text-lg font-semibold text-slate-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[52px]">
          {post.title}
        </h3>
        <p className="mt-2 text-[13px] text-slate-600 line-clamp-2 min-h-[40px]">{post.excerpt ?? ''}</p>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
          <div className="flex items-center gap-3">
            {author && (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <User className="h-3 w-3" /> {author}
              </span>
            )}
            {dt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
            {post.reading_time_min && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.reading_time_min} min
              </span>
            )}
          </div>
          <span className="text-brand-700 font-semibold inline-flex items-center gap-1">
            Read <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Inner component ────────────────────────────────────────────────────

function BlogPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<BlogCategory[]>([]);

  const filters = useMemo(() => paramsToState(searchParams), [searchParams]);

  // ── Load blog categories once ──
  useEffect(() => {
    fetchBlogCategories().then((data) => { if (data) setCategoryOptions(data); });
  }, []);

  // ── Fetch posts ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBlogList(stateToApiParams(filters)).then((result) => {
      if (cancelled) return;
      setPosts(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const updateFilters = useCallback(
    (updater: (prev: ReturnType<typeof paramsToState>) => ReturnType<typeof paramsToState>) => {
      const next = updater(paramsToState(searchParams));
      router.push(`/blog${stateToParams(next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];
    if (categoryOptions.length > 0) {
      groups.push({
        key: 'categories',
        label: 'Category',
        options: categoryOptions.map((c) => ({ value: String(c.id), label: c.name })),
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
      if (cat) result.push({ key: `categories:${v}`, label: cat.name });
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
    router.push('/blog', { scroll: false });
  }

  const activeFilterCount = chips.length + (filters.search ? 1 : 0);

  const sidebarContent = (
    <FilterSidebar groups={filterGroups} selected={selectedMap} onChange={handleFilterChange} />
  );

  return (
    <>
      <PageHero
        eyebrow="The Grow Up More Blog"
        title={<>Career playbooks &amp; <span className="text-gradient">deep technical reads</span></>}
        subtitle="Written by our mentors and recent placements — actionable, opinionated and free."
      />

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <SearchInput
                value={filters.search}
                onChange={(search) => updateFilters((prev) => ({ ...prev, search, page: 1 }))}
                placeholder="Search articles by title, author or topic…"
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
                  <>Showing <span className="font-semibold text-slate-800">{posts.length}</span> of {total} articles</>
                )}
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => <BlogCardSkeleton key={i} />)}
                </div>
              ) : posts.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg font-semibold text-slate-700">No articles found</p>
                  <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
                  <button onClick={handleClearAll} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white text-sm font-medium shadow-btn hover:bg-brand-600 transition-colors">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {posts.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 0.05}>
                      <BlogCard post={p} index={i} />
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

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="h-48 bg-gradient-to-br from-brand-700 to-brand-500 animate-pulse" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <BlogPageInner />
    </Suspense>
  );
}
