import { PageHero } from './PageHero';

interface Section { heading: string; body: string[] }
interface Props {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: string;
  /** Static sections — used as a fallback when no CMS content is provided. */
  sections?: Section[];
  /** Dynamic policy body from the CMS. When set, it takes priority over `sections`. */
  content?: string | null;
  contentFormat?: string;
}

/**
 * Shared layout for /privacy, /terms, /refund and /legal/[code].
 * Renders CMS `content` (HTML or paragraph text) when provided; otherwise falls
 * back to the static `sections` baked into each page.
 */
export function LegalPage({ eyebrow, title, updated, intro, sections, content, contentFormat = 'html' }: Props) {
  const paras = content && contentFormat !== 'html'
    ? content.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={`Last updated · ${updated}`} />
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          {intro && (
            <p className="rounded-md bg-white border border-slate-200 shadow-card p-5 text-slate-700 leading-relaxed">{intro}</p>
          )}

          {content ? (
            <div className="mt-8 rounded-md bg-white border border-slate-200 shadow-card p-6 sm:p-8">
              {contentFormat === 'html' ? (
                <div
                  className="prose prose-slate max-w-none text-[14.5px] leading-relaxed [&_h2]:heading [&_h2]:text-xl [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-brand-700 [&_p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="space-y-3 text-[14.5px] text-slate-700 leading-relaxed">
                  {paras.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 space-y-7">
              {(sections || []).map((s, i) => (
                <div key={s.heading} className="rounded-md bg-white border border-slate-200 shadow-card p-6">
                  <h2 className="heading text-xl text-slate-900">{i + 1}. {s.heading}</h2>
                  <div className="mt-3 space-y-3 text-[14.5px] text-slate-700 leading-relaxed">
                    {s.body.map((p, j) => <p key={j}>{p}</p>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
