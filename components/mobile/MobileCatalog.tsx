'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, Check } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { MobileContentCard } from '@/components/mobile/MobileContentCard';
import type { CatalogConfig } from '@/components/catalog/CatalogView';
import type { ContentType, UnifiedItem } from '@/components/ui/ContentCard';
import {
  fetchCoursesList, fetchBundlesList, fetchBatchesList, fetchInstructorsList,
  fetchBlogList, fetchWebinarsList, fetchLiveSessionsList, fetchPodcastList,
  fetchBlogCategories, api, categoryName,
  type Category,
} from '@/lib/api';

const PAGE = 12;

interface SortOpt { key: string; label: string; sort: string; order: 'asc' | 'desc' }

// Per-type sort options — only real, sortable columns (no 500s).
const SORTS: Record<string, SortOpt[]> = {
  courses: [
    { key: 'popular', label: 'Popular', sort: 'rating_count', order: 'desc' },
    { key: 'newest', label: 'Newest', sort: 'created_at', order: 'desc' },
    { key: 'price_low', label: 'Price ↑', sort: 'price', order: 'asc' },
    { key: 'price_high', label: 'Price ↓', sort: 'price', order: 'desc' },
  ],
  bundles: [
    { key: 'popular', label: 'Popular', sort: 'rating_count', order: 'desc' },
    { key: 'newest', label: 'Newest', sort: 'created_at', order: 'desc' },
    { key: 'price_low', label: 'Price ↑', sort: 'price', order: 'asc' },
    { key: 'price_high', label: 'Price ↓', sort: 'price', order: 'desc' },
  ],
  batches: [
    { key: 'newest', label: 'Newest', sort: 'created_at', order: 'desc' },
    { key: 'price_low', label: 'Price ↑', sort: 'price', order: 'asc' },
    { key: 'price_high', label: 'Price ↓', sort: 'price', order: 'desc' },
  ],
  instructors: [{ key: 'newest', label: 'Newest', sort: 'created_at', order: 'desc' }],
  blogs: [{ key: 'newest', label: 'Newest', sort: 'published_at', order: 'desc' }],
  webinars: [
    { key: 'soon', label: 'Upcoming', sort: 'scheduled_at', order: 'asc' },
    { key: 'newest', label: 'Newest', sort: 'scheduled_at', order: 'desc' },
  ],
  live_sessions: [{ key: 'newest', label: 'Newest', sort: 'created_at', order: 'desc' }],
  podcasts: [{ key: 'newest', label: 'Newest', sort: 'published_at', order: 'desc' }],
};

/**
 * App-native mobile catalog. Self-contained: fetches live data per content type,
 * with a sticky search, quick-filter chips and a bottom-sheet for category + sort.
 * Driven by the same CatalogConfig objects as the desktop CatalogView.
 */
export function MobileCatalog({ config }: { config: CatalogConfig }) {
  const type = (config.fixedType ?? 'courses') as ContentType;
  const sortOpts = SORTS[type] ?? [{ key: 'newest', label: 'Newest', sort: 'created_at', order: 'desc' }];

  // ── State ──
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState(sortOpts[0].key);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter values
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [free, setFree] = useState(false);
  const [status, setStatus] = useState('');
  const [instructorType, setInstructorType] = useState('');
  const [verified, setVerified] = useState(false);
  const [featured, setFeatured] = useState(false);

  // Category sources
  const [sharedCats, setSharedCats] = useState<Category[]>([]);
  const [blogCats, setBlogCats] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (type === 'courses' || type === 'podcasts') api.categories().then((d) => { if (d) setSharedCats(d); });
    if (type === 'blogs') fetchBlogCategories().then((d) => { if (d) setBlogCats(d.map((c) => ({ id: c.id, name: c.name }))); });
  }, [type]);

  const categoryOpts = useMemo(
    () => (type === 'blogs'
      ? blogCats.map((c) => ({ value: String(c.id), label: c.name }))
      : sharedCats.map((c) => ({ value: String(c.id), label: categoryName(c) }))),
    [type, blogCats, sharedCats],
  );
  const hasCategory = (type === 'courses' || type === 'blogs' || type === 'podcasts') && categoryOpts.length > 0;

  const activeSort = sortOpts.find((o) => o.key === sortKey) ?? sortOpts[0];

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const common = { search: debouncedSearch || undefined, page, limit: PAGE, sort: activeSort.sort, order: activeSort.order };
    const catId = category ? Number(category) : undefined;

    const run = async (): Promise<{ items: UnifiedItem[]; totalPages: number }> => {
      switch (type) {
        case 'courses': {
          const r = await fetchCoursesList({ ...common, category_id: catId, difficulty_level: level || undefined, is_free: free || undefined });
          return { items: r.data.map((d) => ({ type: 'courses' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'bundles': {
          const r = await fetchBundlesList({ ...common, is_free: free || undefined });
          return { items: r.data.map((d) => ({ type: 'bundles' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'batches': {
          const r = await fetchBatchesList({ ...common, is_free: free || undefined, batch_status: status || undefined, is_active: !status ? true : undefined });
          return { items: r.data.map((d) => ({ type: 'batches' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'instructors': {
          const r = await fetchInstructorsList({ ...common, instructor_type: instructorType || undefined, is_verified: verified || undefined });
          return { items: r.data.map((d) => ({ type: 'instructors' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'blogs': {
          const r = await fetchBlogList({ ...common, category_id: catId, is_featured: featured || undefined });
          return { items: r.data.map((d) => ({ type: 'blogs' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'webinars': {
          const r = await fetchWebinarsList({ ...common, is_free: free || undefined, webinar_status: status || undefined, is_active: !status ? true : undefined });
          return { items: r.data.map((d) => ({ type: 'webinars' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'live_sessions': {
          const r = await fetchLiveSessionsList({ ...common, session_status: status || undefined });
          return { items: r.data.map((d) => ({ type: 'live_sessions' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'podcasts': {
          const r = await fetchPodcastList({ ...common, category_id: catId, is_featured: featured || undefined });
          return { items: r.data.map((d) => ({ type: 'podcasts' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        default:
          return { items: [], totalPages: 1 };
      }
    };

    run().then((res) => {
      if (cancelled) return;
      setItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
      setTotalPages(res.totalPages || 1);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, debouncedSearch, sortKey, category, level, free, status, instructorType, verified, featured, page]);

  // ── Quick chips ──
  const resetTypeFilters = () => { setLevel(''); setFree(false); setStatus(''); setInstructorType(''); setVerified(false); setFeatured(false); setPage(1); };
  const allActive = !level && !free && !status && !instructorType && !verified && !featured;

  const chips: { label: string; active: boolean; on: () => void }[] = [{ label: 'All', active: allActive, on: resetTypeFilters }];
  const toggle = (cond: boolean, set: () => void) => { set(); setPage(1); };
  if (type === 'courses') {
    chips.push({ label: 'Free', active: free, on: () => toggle(free, () => setFree(!free)) });
    ([['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']] as const).forEach(([v, l]) =>
      chips.push({ label: l, active: level === v, on: () => toggle(true, () => setLevel(level === v ? '' : v)) }));
  } else if (type === 'bundles' || type === 'batches') {
    chips.push({ label: 'Free', active: free, on: () => toggle(free, () => setFree(!free)) });
  } else if (type === 'webinars') {
    chips.push({ label: 'Free', active: free, on: () => toggle(free, () => setFree(!free)) });
    ([['live', 'Live'], ['scheduled', 'Scheduled']] as const).forEach(([v, l]) =>
      chips.push({ label: l, active: status === v, on: () => toggle(true, () => setStatus(status === v ? '' : v)) }));
  } else if (type === 'live_sessions') {
    ([['live', 'Live'], ['scheduled', 'Scheduled']] as const).forEach(([v, l]) =>
      chips.push({ label: l, active: status === v, on: () => toggle(true, () => setStatus(status === v ? '' : v)) }));
  } else if (type === 'instructors') {
    chips.push({ label: 'Verified', active: verified, on: () => toggle(verified, () => setVerified(!verified)) });
    ([['internal', 'Internal'], ['external', 'External']] as const).forEach(([v, l]) =>
      chips.push({ label: l, active: instructorType === v, on: () => toggle(true, () => setInstructorType(instructorType === v ? '' : v)) }));
  } else if (type === 'blogs' || type === 'podcasts') {
    chips.push({ label: 'Featured', active: featured, on: () => toggle(featured, () => setFeatured(!featured)) });
  }

  const activeCount =
    (level ? 1 : 0) + (free ? 1 : 0) + (status ? 1 : 0) + (instructorType ? 1 : 0) +
    (verified ? 1 : 0) + (featured ? 1 : 0) + (category ? 1 : 0);

  const title = typeof config.hero.eyebrow === 'string' ? config.hero.eyebrow : 'Browse';

  return (
    <div className="pb-6">
      <MobilePageHeader
        title={title}
        subtitle={config.hero.subtitle}
        action={
          <button
            type="button"
            aria-label="Filters"
            onClick={() => setSheetOpen(true)}
            className="relative h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-brand-500 text-white text-[9px] font-bold inline-flex items-center justify-center">{activeCount}</span>
            )}
          </button>
        }
      />

      {/* Search */}
      <div className="px-3">
        <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 shadow-sm focus-within:border-brand-300">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none text-ellipsis placeholder:text-slate-400"
            placeholder={config.searchPlaceholder}
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear" className="shrink-0"><X className="h-4 w-4 text-slate-400" /></button>
          )}
        </div>
      </div>

      {/* Quick chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-3 scrollbar-none">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={c.on}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold border transition-colors ${c.active ? 'bg-brand-500 text-white border-brand-500 shadow-btn' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-4 px-3 space-y-2.5">
        {loading && page === 1 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[104px] rounded-md bg-white border border-slate-200 animate-pulse" />
          ))
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="heading text-slate-700 text-sm">No results found</p>
            <p className="text-[12px] text-slate-500 mt-1">Try clearing filters or a different search.</p>
          </div>
        ) : (
          items.map((it) => <MobileContentCard key={`${it.type}-${it.id}`} item={it} />)
        )}

        {/* Load more */}
        {!loading && items.length > 0 && page < totalPages && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full mt-2 rounded-full bg-white border border-slate-200 py-2.5 text-[13px] font-semibold text-brand-700 active:scale-[0.98] transition-all shadow-card"
          >
            Load more
          </button>
        )}
        {loading && page > 1 && (
          <div className="h-[104px] rounded-md bg-white border border-slate-200 animate-pulse" />
        )}
      </div>

      {/* Filter bottom-sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-white rounded-t-2xl shadow-2xl animate-slide-up">
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
              <h3 className="heading text-[15px] font-bold text-slate-900">Filters {activeCount > 0 && <span className="text-brand-600">({activeCount})</span>}</h3>
              <button onClick={() => setSheetOpen(false)} aria-label="Close" className="p-1 rounded-full hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
            </div>

            <div className="p-4 space-y-5">
              {hasCategory && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Category</div>
                  <div className="flex flex-wrap gap-2">
                    <SheetChip label="All" active={!category} onClick={() => { setCategory(''); setPage(1); }} />
                    {categoryOpts.map((o) => (
                      <SheetChip key={o.value} label={o.label} active={category === o.value} onClick={() => { setCategory(category === o.value ? '' : o.value); setPage(1); }} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sort by</div>
                <div className="flex flex-wrap gap-2">
                  {sortOpts.map((o) => (
                    <SheetChip key={o.key} label={o.label} active={sortKey === o.key} onClick={() => { setSortKey(o.key); setPage(1); }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3 flex gap-2">
              <button
                onClick={() => { setCategory(''); resetTypeFilters(); setSortKey(sortOpts[0].key); }}
                className="flex-1 rounded-full border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-600 active:scale-[0.98] transition-all"
              >
                Clear all
              </button>
              <button
                onClick={() => setSheetOpen(false)}
                className="flex-1 rounded-full bg-brand-500 py-2.5 text-[13px] font-bold text-white active:scale-[0.98] transition-all shadow-btn"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SheetChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold border transition-colors ${active ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-700 border-slate-200'}`}
    >
      {active && <Check className="h-3 w-3" />}
      {label}
    </button>
  );
}
