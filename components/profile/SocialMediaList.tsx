'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Trash2, Linkedin, Github, Twitter, Instagram, Youtube, Facebook,
  Code2, FileText, Globe, AlertCircle, Loader2, ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import {
  addSocialMedia, deleteSocialMedia, listSocialMediaPlatforms,
  type UserSocialMedia, type SocialMediaPlatform,
} from '@/lib/users/client';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FieldError } from '@/components/ui/FieldError';
import { validateUrl, validateUsername } from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * Social media list — adds rows of `{ platform, url, username }` to
 * `user_social_medias`. The platform dropdown is populated from the
 * `/social-medias` API endpoint (master `social_medias` table). We use
 * the platform `code` ('linkedin', 'github', …) as the value we send
 * back to `user_social_medias.platform`, and fall back to a colour /
 * icon lookup by code for visual rendering.
 *
 * Icon strategy
 *   • If the master row has `icon` (a CDN URL), render that as an <img>.
 *   • Otherwise look up the platform `code` in a local Lucide map. If
 *     no match either, render a generic Globe.
 *
 * URL validation is best-effort (we accept anything starting with
 * `http`/`https` to avoid blocking edge cases) — final validation
 * happens server-side.
 */

// Local visual fallback when the master row has no `icon` URL. Keyed on
// the platform's `code` field. Anything not in this map gets a Globe.
const ICON_BY_CODE: Record<string, { Icon: LucideIcon; pillBg: string }> = {
  linkedin:      { Icon: Linkedin,  pillBg: 'bg-sky-50 border-sky-200 text-sky-700' },
  github:        { Icon: Github,    pillBg: 'bg-slate-100 border-slate-200 text-slate-800' },
  twitter:       { Icon: Twitter,   pillBg: 'bg-slate-100 border-slate-200 text-slate-800' },
  x:             { Icon: Twitter,   pillBg: 'bg-slate-100 border-slate-200 text-slate-800' },
  instagram:     { Icon: Instagram, pillBg: 'bg-rose-50 border-rose-200 text-rose-700' },
  youtube:       { Icon: Youtube,   pillBg: 'bg-red-50 border-red-200 text-red-700' },
  facebook:      { Icon: Facebook,  pillBg: 'bg-blue-50 border-blue-200 text-blue-700' },
  website:       { Icon: Globe,     pillBg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  portfolio_website: { Icon: Globe, pillBg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  leetcode:      { Icon: Code2,     pillBg: 'bg-amber-50 border-amber-200 text-amber-700' },
  hackerrank:    { Icon: Code2,     pillBg: 'bg-teal-50 border-teal-200 text-teal-700' },
  stackoverflow: { Icon: Code2,     pillBg: 'bg-orange-50 border-orange-200 text-orange-700' },
  medium:        { Icon: FileText,  pillBg: 'bg-slate-100 border-slate-200 text-slate-800' },
};
const FALLBACK_ICON = { Icon: Globe, pillBg: 'bg-slate-100 border-slate-200 text-slate-700' };

export function SocialMediaList({
  rows, onAdded, onRemoved,
}: {
  rows:      UserSocialMedia[];
  onAdded:   (row: UserSocialMedia) => void;
  onRemoved: (id: number) => void;
}) {
  const [platforms, setPlatforms] = useState<SocialMediaPlatform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [platformCode, setPlatformCode] = useState('');
  const [url,      setUrl]      = useState('');
  const [username, setUsername] = useState('');
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  // Per-field errors so users see "missing platform", "bad URL",
  // "username has a space" without one mixed banner.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  // ── Load platform list once on mount ───────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listSocialMediaPlatforms();
        if (cancelled) return;
        setPlatforms(list);
        // Default to the first platform in the API list so the form
        // submits with a valid value even if the user doesn't touch
        // the dropdown.
        if (list.length > 0) setPlatformCode(list[0].code);
      } catch (e) {
        if (!cancelled) {
          console.error('[SocialMediaList] listSocialMediaPlatforms failed', e);
        }
      } finally {
        if (!cancelled) setLoadingPlatforms(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Quick lookup: code → master row (used to render placeholder + icon).
  const platformByCode = useMemo(() => {
    const map: Record<string, SocialMediaPlatform> = {};
    for (const p of platforms) map[p.code] = p;
    return map;
  }, [platforms]);

  const selected = platformByCode[platformCode];

  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    if (!platformCode) errs.platform = 'Pick a platform first.';
    if (!url.trim()) {
      errs.url = 'URL is required.';
    } else {
      const r = validateUrl(url, 'URL');
      if (!r.ok) errs.url = r.msg;
    }
    if (username.trim()) {
      const r = validateUsername(username);
      if (!r.ok) errs.username = r.msg;
    }
    return errs;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const errs = runValidation();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setError(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await addSocialMedia({
        platform: platformCode,
        url:      url.trim(),
        username: username.trim() || null,
        is_public: true,
      });
      onAdded(created);
      setUrl(''); setUsername('');
      setFieldErrors({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: UserSocialMedia) {
    if (!row.id) return;
    try {
      await deleteSocialMedia(row.id);
      onRemoved(row.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove.');
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {rows.length > 0 && (
        <ul className="space-y-2 mb-4">
          {rows.map((row) => {
            const meta = platformByCode[row.platform];
            return (
              <li key={row.id} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5">
                <PlatformIcon code={row.platform} iconUrl={meta?.icon ?? null} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{meta?.name ?? row.platform}</div>
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] text-slate-600 truncate hover:text-brand-700 max-w-full">
                    <span className="truncate">{row.username ? `@${row.username} · ` : ''}{row.url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                  </a>
                </div>
                <button onClick={() => remove(row)} className="text-rose-500 hover:bg-rose-50 rounded-md p-1.5" aria-label="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add form */}
      <form onSubmit={add} className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
        <div className="grid sm:grid-cols-[200px_1fr] gap-2">
          <SearchableSelect<SocialMediaPlatform>
            value={platformCode}
            onChange={setPlatformCode}
            options={platforms}
            getValue={(p) => p.code}
            getLabel={(p) => p.name}
            getSublabel={(p) => p.platform_type || null}
            renderLeading={(p) => <PlatformIcon code={p.code} iconUrl={p.icon ?? null} compact />}
            placeholder={loadingPlatforms ? 'Loading…' : 'Select platform'}
            searchPlaceholder="Search platforms…"
            disabled={loadingPlatforms || platforms.length === 0}
            loading={loadingPlatforms}
            emptyText="No matching platforms"
          />
          <div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setFieldErrors(runValidation())}
              maxLength={1000}
              aria-invalid={!!fieldErrors.url}
              placeholder={selected?.base_url ? `${selected.base_url}${selected.placeholder ?? ''}` : 'https://…'}
              className={cn(
                'w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400',
                fieldErrors.url ? 'border-rose-300' : 'border-slate-200',
              )}
            />
            <FieldError message={fieldErrors.url} />
          </div>
        </div>
        {fieldErrors.platform && (
          <FieldError message={fieldErrors.platform} />
        )}
        <div className="grid sm:grid-cols-[1fr_auto] gap-2">
          <div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setFieldErrors(runValidation())}
              maxLength={300}
              aria-invalid={!!fieldErrors.username}
              placeholder={selected?.placeholder ? `Username (e.g. ${selected.placeholder})` : 'Username (optional)'}
              className={cn(
                'w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400',
                fieldErrors.username ? 'border-rose-300' : 'border-slate-200',
              )}
            />
            <FieldError message={fieldErrors.username} />
          </div>
          <button
            type="submit"
            disabled={busy || loadingPlatforms}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[12.5px] font-bold shadow-btn disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Icon — prefer the CDN URL from the master row, fall back to a Lucide
// icon keyed on the platform code, then to a generic globe.
//
// `compact` shrinks the wrapper from the row-tile size (32px) to a
// dropdown-row size (20px) so the icon doesn't dwarf the option label
// inside `SearchableSelect`.
// ─────────────────────────────────────────────────────────────────────
function PlatformIcon({
  code, iconUrl, compact = false,
}: { code: string; iconUrl: string | null; compact?: boolean }) {
  const wrap = compact ? 'h-5 w-5' : 'h-8 w-8';
  const img  = compact ? 'h-3.5 w-3.5' : 'h-5 w-5';
  const lucide = compact ? 'h-3 w-3' : 'h-4 w-4';

  if (iconUrl) {
    return (
      <span className={cn('inline-flex items-center justify-center rounded-md border border-slate-200 bg-white overflow-hidden', wrap)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconUrl} alt="" className={cn('object-contain', img)} />
      </span>
    );
  }
  const meta = ICON_BY_CODE[code] ?? FALLBACK_ICON;
  return (
    <span className={cn('inline-flex items-center justify-center rounded-md border', wrap, meta.pillBg)}>
      <meta.Icon className={lucide} />
    </span>
  );
}
