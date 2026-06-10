'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, Check } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { MobileContentCard } from '@/components/mobile/MobileContentCard';
import { useLanguage } from '@/components/layout/LanguageProvider';
import type { CatalogConfig } from '@/components/catalog/CatalogView';
import { FILTER_CONFIG, LEVEL_OPTIONS, RATING_OPTIONS, TAG_OPTIONS } from '@/components/catalog/CatalogView';
import type { ContentType, UnifiedItem } from '@/components/ui/ContentCard';
import type { FilterOption } from '@/components/ui/filters';
import {
  fetchCoursesList, fetchBundlesList, fetchBatchesList, fetchInstructorsList,
  fetchBlogList, fetchWebinarsList, fetchLiveSessionsList, fetchPodcastList,
  fetchBlogCategories, api, categoryName, subCategoryName,
  type Category, type SubCategory, type Language,
} from '@/lib/api';

const PAGE = 12;

interface SortOpt { key: string; label: string; sort: string; order: 'asc' | 'desc' }

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

type Mode = 'radio' | 'checkbox' | 'bool';
function groupMode(g: { type?: string; options: FilterOption[] }): Mode {
  if (g.type === 'radio') return 'radio';
  if (g.options.length === 1 && g.options[0].value === 'true') return 'bool';
  return 'checkbox';
}

/**
 * App-native mobile catalog with a full, per-type detailed filter sheet.
 * Reuses the desktop filter option definitions (FILTER_CONFIG, levels, ratings,
 * tags) so values match the API exactly, rendered as mobile chip groups.
 */
export function MobileCatalog({ config }: { config: CatalogConfig }) {
  const type = (config.fixedType ?? 'courses') as ContentType;
  const sortOpts = SORTS[type] ?? [{ key: 'newest', label: 'Newest', sort: 'created_at', order: 'desc' }];
  const { active: activeLang } = useLanguage();

  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState(sortOpts[0].key);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Unified chip selections: groupKey → Set of values (radio = 1, bool = {'true'})
  const [sel, setSel] = useState<Record<string, Set<string>>>({});
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Option sources
  const [sharedCats, setSharedCats] = useState<Category[]>([]);
  const [blogCats, setBlogCats] = useState<{ id: number; name: string }[]>([]);
  const [subCats, setSubCats] = useState<SubCategory[]>([]);
  const [langs, setLangs] = useState<Language[]>([]);

  useEffect(() => {
    if (type === 'courses' || type === 'podcasts') api.categories().then((d) => { if (d) setSharedCats(d); });
    if (type === 'blogs') fetchBlogCategories().then((d) => { if (d) setBlogCats(d.map((c) => ({ id: c.id, name: c.name }))); });
    if (type === 'courses') {
      api.subCategories().then((d) => { if (d) setSubCats(d); });
      api.courseLanguages().then((d) => { if (d) setLangs(d); });
    }
  }, [type]);

  // Selection helpers
  const one = (k: string) => { const s = sel[k]; return s && s.size ? [...s][0] : ''; };
  const many = (k: string) => (sel[k] ? [...sel[k]] : []);
  const bool = (k: string) => !!sel[k]?.has('true');
  const has = (k: string, v: string) => !!sel[k]?.has(v);

  function setGroup(key: string, value: string, mode: Mode) {
    setSel((prev) => {
      const next = { ...prev };
      const cur = new Set(next[key] ?? []);
      if (mode === 'bool') { cur.has('true') ? cur.delete('true') : cur.add('true'); }
      else if (mode === 'radio') { const had = cur.has(value); cur.clear(); if (!had) cur.add(value); }
      else { cur.has(value) ? cur.delete(value) : cur.add(value); }
      next[key] = cur;
      if (key === 'categories') next['subCategories'] = new Set();
      return next;
    });
    setPage(1);
  }

  const clearAll = () => { setSel({}); setPriceMin(''); setPriceMax(''); setPage(1); };
  const noFilters = Object.values(sel).every((s) => s.size === 0) && !priceMin && !priceMax;
  const activeCount = Object.values(sel).filter((s) => s.size > 0).length + ((priceMin || priceMax) ? 1 : 0);

  // Category / sub-category / language option lists
  const categoryOpts: FilterOption[] = useMemo(
    () => (type === 'blogs'
      ? blogCats.map((c) => ({ value: String(c.id), label: c.name }))
      : sharedCats.map((c) => ({ value: String(c.id), label: categoryName(c) }))),
    [type, blogCats, sharedCats],
  );
  const hasCategory = (type === 'courses' || type === 'blogs' || type === 'podcasts') && categoryOpts.length > 0;
  const selectedCat = one('categories');
  const subCatOpts: FilterOption[] = useMemo(
    () => subCats.filter((sc) => !selectedCat || String(sc.category_id) === selectedCat).map((sc) => ({ value: String(sc.id), label: subCategoryName(sc) })),
    [subCats, selectedCat],
  );
  const langOpts: FilterOption[] = useMemo(() => langs.map((l) => ({ value: String(l.id), label: l.name })), [langs]);
  const showPrice = type === 'courses' || type === 'bundles';
  const typeGroups = FILTER_CONFIG[type] ?? [];

  const activeSort = sortOpts.find((o) => o.key === sortKey) ?? sortOpts[0];

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const selKey = useMemo(
    () => JSON.stringify(Object.entries(sel).map(([k, v]) => [k, [...v].sort()]).sort()),
    [sel],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const common = { search: debouncedSearch || undefined, page, limit: PAGE, sort: activeSort.sort, order: activeSort.order };
    const lang = activeLang?.id || undefined;
    const catId = selectedCat ? Number(selectedCat) : undefined;
    const ratingMin = one('ratingMin') ? parseFloat(one('ratingMin')) : undefined;
    const pMin = priceMin ? parseFloat(priceMin) : undefined;
    const pMax = priceMax ? parseFloat(priceMax) : undefined;

    const run = async (): Promise<{ items: UnifiedItem[]; totalPages: number }> => {
      switch (type) {
        case 'courses': {
          const r = await fetchCoursesList({
            ...common, language_id: lang, category_id: catId,
            sub_category_id: many('subCategories').join(',') || undefined,
            difficulty_level: many('levels').join(',') || undefined,
            course_language_id: many('languages').join(',') || undefined,
            rating_min: ratingMin, is_free: bool('isFree') || undefined,
            price_min: pMin, price_max: pMax,
            is_bestseller: has('tags', 'bestseller') || undefined,
            is_new: has('tags', 'new') || undefined,
            has_certificate: has('tags', 'certificate') || undefined,
            is_featured: has('tags', 'featured') || undefined,
          });
          return { items: r.data.map((d) => ({ type: 'courses' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'bundles': {
          const r = await fetchBundlesList({
            ...common, language_id: lang, is_free: bool('isFree') || undefined,
            rating_min: ratingMin, is_featured: bool('bundleFeatured') || undefined,
            price_min: pMin, price_max: pMax,
          });
          return { items: r.data.map((d) => ({ type: 'bundles' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'batches': {
          const r = await fetchBatchesList({
            ...common, language_id: lang,
            is_free: bool('batchFree') || bool('isFree') || undefined,
            batch_status: one('batchStatus') || undefined,
            is_active: !one('batchStatus') ? true : undefined,
          });
          return { items: r.data.map((d) => ({ type: 'batches' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'instructors': {
          const r = await fetchInstructorsList({
            ...common,
            instructor_type: one('instructorType') || undefined,
            is_verified: bool('instructorVerified') || undefined,
            is_featured: bool('instructorFeatured') || undefined,
          });
          return { items: r.data.map((d) => ({ type: 'instructors' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'blogs': {
          const r = await fetchBlogList({ ...common, category_id: catId, is_featured: bool('blogFeatured') || undefined });
          return { items: r.data.map((d) => ({ type: 'blogs' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'webinars': {
          const r = await fetchWebinarsList({
            ...common, language_id: lang,
            is_free: bool('webinarFree') || bool('isFree') || undefined,
            webinar_status: one('webinarStatus') || undefined,
            is_active: !one('webinarStatus') ? true : undefined,
          });
          return { items: r.data.map((d) => ({ type: 'webinars' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'live_sessions': {
          const r = await fetchLiveSessionsList({
            ...common,
            session_status: one('sessionStatus') || undefined,
            meeting_platform: one('meetingPlatform') || undefined,
            is_recurring: bool('sessionRecurring') || undefined,
          });
          return { items: r.data.map((d) => ({ type: 'live_sessions' as ContentType, id: d.id, data: d })), totalPages: r.totalPages };
        }
        case 'podcasts': {
          const r = await fetchPodcastList({ ...common, category_id: catId, is_featured: bool('podcastFeatured') || undefined });
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
  }, [type, debouncedSearch, sortKey, selKey, priceMin, priceMax, page, activeLang?.id]);

  // Quick chips (page-level shortcuts that drive the same `sel` state)
  const quick: { label: string; active: boolean; on: () => void }[] = [{ label: 'All', active: noFilters, on: clearAll }];
  if (type === 'courses') {
    quick.push({ label: 'Free', active: bool('isFree'), on: () => setGroup('isFree', 'true', 'bool') });
    quick.push({ label: 'Beginner', active: has('levels', 'beginner'), on: () => setGroup('levels', 'beginner', 'checkbox') });
    quick.push({ label: 'Intermediate', active: has('levels', 'intermediate'), on: () => setGroup('levels', 'intermediate', 'checkbox') });
    quick.push({ label: 'Advanced', active: has('levels', 'advanced'), on: () => setGroup('levels', 'advanced', 'checkbox') });
  } else if (type === 'bundles') {
    quick.push({ label: 'Free', active: bool('isFree'), on: () => setGroup('isFree', 'true', 'bool') });
    quick.push({ label: 'Featured', active: bool('bundleFeatured'), on: () => setGroup('bundleFeatured', 'true', 'bool') });
  } else if (type === 'batches') {
    quick.push({ label: 'Free', active: bool('batchFree'), on: () => setGroup('batchFree', 'true', 'bool') });
    quick.push({ label: 'Upcoming', active: has('batchStatus', 'upcoming'), on: () => setGroup('batchStatus', 'upcoming', 'radio') });
  } else if (type === 'webinars') {
    quick.push({ label: 'Free', active: bool('webinarFree'), on: () => setGroup('webinarFree', 'true', 'bool') });
    quick.push({ label: 'Live', active: has('webinarStatus', 'live'), on: () => setGroup('webinarStatus', 'live', 'radio') });
    quick.push({ label: 'Upcoming', active: has('webinarStatus', 'upcoming'), on: () => setGroup('webinarStatus', 'upcoming', 'radio') });
  } else if (type === 'live_sessions') {
    quick.push({ label: 'Live', active: has('sessionStatus', 'live'), on: () => setGroup('sessionStatus', 'live', 'radio') });
    quick.push({ label: 'Scheduled', active: has('sessionStatus', 'scheduled'), on: () => setGroup('sessionStatus', 'scheduled', 'radio') });
  } else if (type === 'instructors') {
    quick.push({ label: 'Verified', active: bool('instructorVerified'), on: () => setGroup('instructorVerified', 'true', 'bool') });
    quick.push({ label: 'Internal', active: has('instructorType', 'internal'), on: () => setGroup('instructorType', 'internal', 'radio') });
    quick.push({ label: 'External', active: has('instructorType', 'external'), on: () => setGroup('instructorType', 'external', 'radio') });
  } else if (type === 'blogs') {
    quick.push({ label: 'Featured', active: bool('blogFeatured'), on: () => setGroup('blogFeatured', 'true', 'bool') });
  } else if (type === 'podcasts') {
    quick.push({ label: 'Featured', active: bool('podcastFeatured'), on: () => setGroup('podcastFeatured', 'true', 'bool') });
  }

  const title = typeof config.hero.eyebrow === 'string' ? config.hero.eyebrow : 'Browse';

  return (
    <div className="pb-6">
      <MobilePageHeader title={title} subtitle={config.hero.subtitle} />

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
          {search && <button onClick={() => setSearch('')} aria-label="Clear"><X className="h-4 w-4 text-slate-400" /></button>}
        </div>
      </div>

      {/* Quick chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-3 scrollbar-none">
        {quick.map((c) => (
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
      <div className="mt-4 px-3 space-y-3.5 pb-20">
        {loading && page === 1 ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[230px] rounded-md bg-white border border-slate-200 animate-pulse" />)
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="heading text-slate-700 text-sm">No results found</p>
            <p className="text-[12px] text-slate-500 mt-1">Try clearing filters or a different search.</p>
          </div>
        ) : (
          items.map((it, i) => <MobileContentCard key={`${it.type}-${it.id}`} item={it} index={i} />)
        )}

        {!loading && items.length > 0 && page < totalPages && (
          <button onClick={() => setPage((p) => p + 1)} className="w-full mt-2 rounded-full bg-white border border-slate-200 py-2.5 text-[13px] font-semibold text-brand-700 active:scale-[0.98] transition-all shadow-card">Load more</button>
        )}
        {loading && page > 1 && <div className="h-[230px] rounded-md bg-white border border-slate-200 animate-pulse" />}
      </div>

      {/* Floating Filter pill */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-slate-700 shadow-[0_10px_24px_rgba(2,6,23,0.16)] active:scale-95 transition-all"
      >
        <SlidersHorizontal className="h-4 w-4" /> Filter
        {activeCount > 0 && <span className="h-4 min-w-4 px-1 rounded-full bg-brand-500 text-white text-[9px] font-bold inline-flex items-center justify-center">{activeCount}</span>}
      </button>

      {/* Detailed filter bottom-sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl shadow-2xl animate-slide-up">
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
              <h3 className="heading text-[15px] font-bold text-slate-900">Filters {activeCount > 0 && <span className="text-brand-600">({activeCount})</span>}</h3>
              <button onClick={() => setSheetOpen(false)} aria-label="Close" className="p-1 rounded-full hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
            </div>

            <div className="p-4 space-y-5">
              {hasCategory && (
                <Section label="Category">
                  <SheetChip label="All" active={!selectedCat} onClick={() => { setSel((prev) => ({ ...prev, categories: new Set<string>(), subCategories: new Set<string>() })); setPage(1); }} />
                  {categoryOpts.map((o) => <SheetChip key={o.value} label={o.label} active={selectedCat === o.value} onClick={() => setGroup('categories', o.value, 'radio')} />)}
                </Section>
              )}

              {type === 'courses' && selectedCat && subCatOpts.length > 0 && (
                <Section label="Sub-category">
                  {subCatOpts.map((o) => <SheetChip key={o.value} label={o.label} active={has('subCategories', o.value)} onClick={() => setGroup('subCategories', o.value, 'checkbox')} />)}
                </Section>
              )}

              {typeGroups.map((g) => {
                const mode = groupMode(g);
                return (
                  <Section key={g.key} label={g.label}>
                    {g.options.map((o) => (
                      <SheetChip
                        key={o.value}
                        label={o.label}
                        active={mode === 'bool' ? bool(g.key) : has(g.key, o.value)}
                        onClick={() => setGroup(g.key, o.value, mode)}
                      />
                    ))}
                  </Section>
                );
              })}

              {type === 'courses' && langOpts.length > 0 && (
                <Section label="Language">
                  {langOpts.map((o) => <SheetChip key={o.value} label={o.label} active={has('languages', o.value)} onClick={() => setGroup('languages', o.value, 'checkbox')} />)}
                </Section>
              )}

              {showPrice && (
                <Section label="Price">
                  <SheetChip label="Free only" active={bool('isFree')} onClick={() => setGroup('isFree', 'true', 'bool')} />
                  {!bool('isFree') && (
                    <div className="flex items-center gap-2 w-full mt-1">
                      <input inputMode="numeric" value={priceMin} onChange={(e) => { setPriceMin(e.target.value.replace(/[^0-9]/g, '')); setPage(1); }} placeholder="Min ₹" className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-brand-300" />
                      <span className="text-slate-400">–</span>
                      <input inputMode="numeric" value={priceMax} onChange={(e) => { setPriceMax(e.target.value.replace(/[^0-9]/g, '')); setPage(1); }} placeholder="Max ₹" className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-brand-300" />
                    </div>
                  )}
                </Section>
              )}

              <Section label="Sort by">
                {sortOpts.map((o) => <SheetChip key={o.key} label={o.label} active={sortKey === o.key} onClick={() => { setSortKey(o.key); setPage(1); }} />)}
              </Section>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3 pb-[max(env(safe-area-inset-bottom),12px)] flex gap-2">
              <button onClick={() => { clearAll(); setSortKey(sortOpts[0].key); }} className="flex-1 rounded-full border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-600 active:scale-[0.98] transition-all">Clear all</button>
              <button onClick={() => setSheetOpen(false)} className="flex-1 rounded-full bg-brand-500 py-2.5 text-[13px] font-bold text-white active:scale-[0.98] transition-all shadow-btn">Show results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
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
