/**
 * "Submit Your Idea & Get Reward" client (June 2026).
 * Server fetchers (ISR 60 s) for the public showcase + authed self-serve calls.
 */

import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IdeaCategory { id: number; name: string; slug: string; icon?: string | null; description?: string | null }
export interface PublicIdea {
  id: number; title: string; slug: string; short_summary?: string | null; status: string;
  tags?: string[]; views_count: number; likes_count: number; user_type: string; created_at: string;
  idea_categories?: IdeaCategory | null; users?: { first_name?: string | null } | null;
  is_rewarded?: boolean; has_partnership?: boolean;
  problem_statement?: string | null; proposed_solution?: string | null; expected_benefit?: string | null; target_users?: string | null;
}
export interface MyIdea {
  id: number; title: string; slug: string; status: string; is_public: boolean;
  likes_count: number; views_count: number; created_at: string;
  idea_categories?: { name?: string; icon?: string } | null;
  idea_rewards?: { reward_status: string; reward_amount?: number | string }[];
  idea_partnerships?: { partnership_status: string; partnership_type?: string | null }[];
}

// ── Server-side (public, ISR) ──
async function srv<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase()}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T;
  } catch { return null; }
}

export const fetchIdeaCategories = () => srv<IdeaCategory[]>('/idea-categories?limit=100');
export const fetchPublicIdeas = (qs = '') => srv<PublicIdea[]>(`/ideas/public${qs ? `?${qs}` : ''}`);
export const fetchPublicIdea = (slug: string) => srv<PublicIdea>(`/ideas/public/${encodeURIComponent(slug)}`);

// ── Client-side (authed) ──
export class IdeaError extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } }

async function authed<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const tok = getAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    method: opts.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  let json: any = null;
  try { json = await res.json(); } catch { /* empty */ }
  if (!res.ok || json?.success === false) throw new IdeaError(json?.error || json?.message || `Request failed (${res.status})`, res.status);
  return (json?.data ?? json) as T;
}

export const submitIdea = (body: any) => authed<MyIdea & { id: number }>('/ideas', { method: 'POST', body });
export const fetchMyIdeas = () => authed<MyIdea[]>('/ideas/me?limit=100');
export const fetchMyIdea = (id: number) => authed<any>(`/ideas/me/${id}`);
export const updateMyIdea = (id: number, body: any) => authed<any>(`/ideas/me/${id}`, { method: 'PATCH', body });
export const withdrawMyIdea = (id: number) => authed<any>(`/ideas/me/${id}`, { method: 'DELETE' });
export const likeIdea = (id: number) => authed<{ liked: boolean; likes_count: number }>(`/ideas/${id}/like`, { method: 'POST' });
export const unlikeIdea = (id: number) => authed<{ liked: boolean; likes_count: number }>(`/ideas/${id}/like`, { method: 'DELETE' });

// BUG-80: the public showcase is ISR/anonymous, so liked-state can't be baked
// into the static page. Clients fetch the signed-in user's liked idea ids once
// on mount and hydrate each LikeButton's filled/red state from the result.
export const fetchMyLikedIdeaIds = () => authed<number[]>('/ideas/my-likes');

export async function uploadIdeaAttachment(id: number, file: File): Promise<{ attachment_url: string }> {
  const tok = getAccessToken();
  const fd = new FormData();
  fd.append('file', file, file.name);
  const res = await fetch(`${apiBase()}/ideas/me/${id}/attachment`, {
    method: 'POST', headers: tok ? { Authorization: `Bearer ${tok}` } : undefined, body: fd,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) throw new IdeaError(json?.error || 'Upload failed', res.status);
  return json?.data;
}

// Client fetch of categories (for the submit form)
export const fetchIdeaCategoriesClient = () => authed<IdeaCategory[]>('/idea-categories?limit=100');

export const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted', under_review: 'Under review', shortlisted: 'Shortlisted', need_more_details: 'Needs more details',
  approved: 'Approved', rejected: 'Not selected', planned_for_implementation: 'Planned', in_progress: 'In progress',
  implemented: 'Implemented', rewarded: 'Rewarded', partnership_offered: 'Partnership offered', closed: 'Closed',
};
