import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, ScrollText, ShieldCheck, FileText } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbLd } from '@/lib/jsonld';
import { fetchPolicyIndex } from '@/lib/legal';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Policies & Legal',
  description: 'All Grow Up More policies — privacy, terms, refunds, instructor, blog and placement policies.',
};

/** Classic URLs keep working; everything else renders via /legal/[code]. */
const CLASSIC_PATH: Record<string, string> = {
  PRIVACY: '/privacy',
  TERMS: '/terms',
  REFUND: '/refund',
};

const POLICY_BLURB: Record<string, string> = {
  PRIVACY: 'What data we collect, how we use it, and the choices you have.',
  TERMS: 'The agreement that governs your use of Grow Up More.',
  REFUND: 'When and how you can get your money back.',
  INSTRUCTOR: 'Rules and revenue terms for instructors on the platform.',
  BLOG: 'Editorial standards and content rules for our blog.',
  PLACEMENT: 'How our placement assistance works and what we promise.',
};

/**
 * Public policies hub (June 2026). Lists every policy type that has a
 * PUBLISHED version (live from /public-content/policies) — previously only
 * privacy/terms/refund were linked in the footer and the rest were unreachable.
 */
export default async function PoliciesPage() {
  const entries = await fetchPolicyIndex();

  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <JsonLd data={breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'Policies', url: '/policies' }])} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span>Policies</span>
        </div>

        <div className="mt-6 max-w-2xl">
          <Eyebrow>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-brand-500" /> LEGAL
            </span>
          </Eyebrow>
          <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
            Policies &amp; legal
          </h1>
          <p className="mt-4 text-slate-600">
            Everything that governs how Grow Up More works — written to be read, not buried.
            Each policy shows its version and the date it took effect.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="mt-10 rounded-md bg-white border border-slate-200 p-10 text-center max-w-2xl">
            <ScrollText className="h-8 w-8 mx-auto text-slate-300" />
            <p className="mt-3 heading text-lg text-slate-800">Policies are being prepared</p>
            <p className="mt-1 text-sm text-slate-500">Published policies will appear here automatically.</p>
          </div>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((p) => {
              const href = CLASSIC_PATH[p.code] || `/legal/${p.code.toLowerCase()}`;
              return (
                <Link
                  key={p.code}
                  href={href}
                  className="group rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-cardHover hover:border-brand-300 transition-all p-5 flex flex-col"
                >
                  <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="mt-3 heading text-lg text-slate-900 group-hover:text-brand-700 transition-colors">{p.name}</h2>
                  <p className="mt-1 text-[12.5px] text-slate-500 leading-relaxed flex-1">
                    {POLICY_BLURB[p.code] || 'Read the full policy.'}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-700">
                    Read policy <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-sm text-slate-500">
          Questions about any policy? <Link href="/faq" className="text-brand-700 font-semibold hover:underline">Check the FAQs</Link> or{' '}
          <Link href="/contact" className="text-brand-700 font-semibold hover:underline">contact us</Link>.
        </div>
      </div>
    </section>
  );
}
