import { PageHero } from './PageHero';

interface Section { heading: string; body: string[] }
interface Props {
  eyebrow:   string;
  title:     string;
  updated:   string;
  intro?:    string;
  sections:  Section[];
}

/**
 * Shared layout for /privacy, /terms, /refund.
 * Static rendering only — content lives in each page file.
 */
export function LegalPage({ eyebrow, title, updated, intro, sections }: Props) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={`Last updated · ${updated}`} />
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          {intro && (
            <p className="rounded-md bg-white border border-slate-200 shadow-card p-5 text-slate-700 leading-relaxed">{intro}</p>
          )}
          <div className="mt-8 space-y-7">
            {sections.map((s, i) => (
              <div key={s.heading} className="rounded-md bg-white border border-slate-200 shadow-card p-6">
                <h2 className="heading text-xl text-slate-900">{i + 1}. {s.heading}</h2>
                <div className="mt-3 space-y-3 text-[14.5px] text-slate-700 leading-relaxed">
                  {s.body.map((p, j) => <p key={j}>{p}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
