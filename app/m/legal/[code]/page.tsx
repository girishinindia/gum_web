import { notFound } from 'next/navigation';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { fetchPolicy, formatPolicyDate } from '@/lib/legal';

export const revalidate = 300;

export default async function MobileLegalPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const p = await fetchPolicy(code.toUpperCase());
  if (!p) return notFound();

  return (
    <div className="pb-6">
      <MobilePageHeader title={p.title} subtitle="Legal" />
      <div className="px-4 pt-3">
        <div className="text-[11px] text-slate-400">Last updated · {formatPolicyDate(p.updated_at)}{p.version ? ` · v${p.version}` : ''}</div>
        {p.content_format === 'html' ? (
          <div
            className="mt-3 text-[13px] text-slate-700 leading-relaxed [&_h2]:heading [&_h2]:text-[15px] [&_h2]:text-slate-900 [&_h2]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-2 [&_a]:text-brand-700"
            dangerouslySetInnerHTML={{ __html: p.content }}
          />
        ) : (
          <div className="mt-3 text-[13px] text-slate-700 leading-relaxed space-y-2">
            {p.content.split(/\n{2,}/).map((s, i) => <p key={i}>{s.trim()}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}
