import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, HelpCircle, MessageCircle, LifeBuoy } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { FAQ } from '@/components/home/FAQ';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqLd, breadcrumbLd } from '@/lib/jsonld';
import { fetchSiteFaqs, flattenFaqs } from '@/lib/legal';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about Grow Up More courses, payments, certificates, placements and more.',
};

/**
 * Public FAQ page (June 2026). The header has always linked to /faq, but only
 * the mobile site (/m/faq) had a page — desktop 404'd. Renders the same
 * /public-content/faqs data (admin-managed, translation-aware), grouped by
 * FAQ category, in the standard course-detail frame with a sticky sidebar.
 */
export default async function FaqPage({ searchParams }: { searchParams: Promise<{ language_id?: string }> }) {
  // BUG-18 symmetry: honor ?language_id= here too (Hindi 11 / Gujarati 12 / Marathi 13)
  const sp = await searchParams;
  const parsed = parseInt(sp.language_id || '');
  const langId = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  const groups = await fetchSiteFaqs(langId); // item_type = 'general'
  const all = flattenFaqs(groups);

  return (
    <section className="pt-10 sm:pt-14 pb-16">
      {all.length > 0 && <JsonLd data={faqLd(all)} />}
      <JsonLd data={breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'FAQs', url: '/faq' }])} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span>FAQs</span>
        </div>

        <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
          {/* ════════ LEFT — grouped FAQs ════════ */}
          <div className="min-w-0">
            <Eyebrow>
              <span className="inline-flex items-center gap-1.5">
                <HelpCircle className="h-3 w-3 text-brand-500" /> HELP CENTER
              </span>
            </Eyebrow>
            <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
              Frequently asked questions
            </h1>
            <p className="mt-4 text-slate-600 max-w-2xl">
              Quick answers about courses, payments, certificates and placements. Can&rsquo;t find
              what you need? Raise a support ticket and we&rsquo;ll get back to you.
            </p>

            {groups.length === 0 ? (
              <div className="mt-10 rounded-md bg-white border border-slate-200 p-10 text-center">
                <HelpCircle className="h-8 w-8 mx-auto text-slate-300" />
                <p className="mt-3 heading text-lg text-slate-800">FAQs are being prepared</p>
                <p className="mt-1 text-sm text-slate-500">Check back soon, or contact support with your question.</p>
              </div>
            ) : (
              groups.map((g) => (
                <div key={g.category_id ?? 'general'} id={`faq-cat-${g.category_id ?? 'general'}`} className="mt-10 scroll-mt-36">
                  <h2 className="heading text-2xl text-slate-900">{g.category}</h2>
                  <FAQ items={g.items.map((i) => ({ question: i.question, answer: i.answer }))} inline />
                </div>
              ))
            )}
          </div>

          {/* ════════ RIGHT — sticky sidebar (course-detail pattern) ════════ */}
          <aside className="order-first lg:order-none lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-5">
              {groups.length > 0 && (
                <>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Jump to a topic</div>
                  <ul className="mt-2 space-y-1">
                    {groups.map((g) => (
                      <li key={g.category_id ?? 'general'}>
                        <a
                          href={`#faq-cat-${g.category_id ?? 'general'}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                        >
                          {g.category}
                          <span className="text-[11px] font-bold text-slate-400">{g.items.length}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className={groups.length > 0 ? 'mt-4 pt-4 border-t border-slate-100' : ''}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Still need help?</div>
                <div className="mt-2 space-y-2">
                  <Link href="/support" className="flex items-start gap-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 p-3 transition-colors">
                    <LifeBuoy className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-[13px] font-semibold text-slate-900">Raise a support ticket</span>
                      <span className="block text-[11.5px] text-slate-500">We usually reply within a day</span>
                    </span>
                  </Link>
                  <Link href="/contact" className="flex items-start gap-2.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 p-3 transition-colors">
                    <MessageCircle className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-[13px] font-semibold text-slate-900">Contact us</span>
                      <span className="block text-[11.5px] text-slate-500">Sales &amp; general enquiries</span>
                    </span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Legal</div>
                <Link href="/policies" className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline">
                  Browse all policies <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
