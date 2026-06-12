import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';
import { fetchPolicy, formatPolicyDate } from '@/lib/legal';

export const revalidate = 300;

type Params = Promise<{ code: string }>;
type Search = Promise<{ language_id?: string }>;

/**
 * BUG-18 fix (June 2026): language-specific URLs (?language_id=11) were
 * ignored — the page always fetched the default (English) policy while the
 * navbar showed Hindi. The language_id param now drives the policy fetch
 * (the API falls back to English when a translation is missing).
 */
const langOf = (sp: { language_id?: string }) => {
  const id = parseInt(sp.language_id || '');
  return Number.isFinite(id) && id > 0 ? id : undefined;
};

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  const { code } = await params;
  const langId = langOf(await searchParams);
  const p = await fetchPolicy(code.toUpperCase(), langId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyP: any = p;
  return { title: anyP?.meta_title || p?.title || 'Policy', description: anyP?.meta_description || undefined };
}

export default async function LegalCodePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { code } = await params;
  const langId = langOf(await searchParams);
  const p = await fetchPolicy(code.toUpperCase(), langId);
  if (!p) return notFound();
  return <LegalPage eyebrow="Legal" title={p.title} updated={formatPolicyDate(p.updated_at)} content={p.content} contentFormat={p.content_format} />;
}
