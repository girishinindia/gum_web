/**
 * Public legal-content + FAQ client (no auth). Used by the marketing legal
 * pages and the FAQ/help pages. Server components get ISR via `next.revalidate`.
 */
import { apiBase } from '@/lib/api';

export interface PolicyContent {
  code: string;
  type_name: string;
  slug?: string | null;
  title: string;
  content: string;
  content_format: string;
  version?: string | null;
  effective_from?: string | null;
  updated_at?: string | null;
}

export interface FaqGroup {
  category_id: number | null;
  category: string;
  items: { id: number; question: string; answer: string }[];
}

/** Current published policy for a type code (PRIVACY/TERMS/REFUND/…), or null. */
export async function fetchPolicy(code: string, languageId?: number): Promise<PolicyContent | null> {
  try {
    const qs = languageId ? `?language_id=${languageId}` : '';
    const res = await fetch(`${apiBase()}/public-content/policy/${encodeURIComponent(code)}${qs}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const j = await res.json();
    return (j?.data ?? null) as PolicyContent | null;
  } catch {
    return null;
  }
}

/** Active site FAQs grouped by category (translation-aware). */
export async function fetchSiteFaqs(languageId?: number, itemType = 'general'): Promise<FaqGroup[]> {
  try {
    const qs = new URLSearchParams({ item_type: itemType });
    if (languageId) qs.set('language_id', String(languageId));
    const res = await fetch(`${apiBase()}/public-content/faqs?${qs.toString()}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const j = await res.json();
    return (j?.data ?? []) as FaqGroup[];
  } catch {
    return [];
  }
}

export function flattenFaqs(groups: FaqGroup[]): { question: string; answer: string }[] {
  return groups.flatMap((g) => g.items.map((i) => ({ question: i.question, answer: i.answer })));
}

export function formatPolicyDate(d?: string | null): string {
  const dt = d ? new Date(d) : new Date();
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
