import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';
import { fetchPolicy, formatPolicyDate } from '@/lib/legal';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const p = await fetchPolicy(code.toUpperCase());
  return { title: p?.title || 'Policy' };
}

export default async function LegalCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const p = await fetchPolicy(code.toUpperCase());
  if (!p) return notFound();
  return <LegalPage eyebrow="Legal" title={p.title} updated={formatPolicyDate(p.updated_at)} content={p.content} contentFormat={p.content_format} />;
}
