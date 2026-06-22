import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { FEATURES } from '@/lib/homeContent';
import { Languages, Briefcase, IndianRupee, Hammer, MessageSquare, BadgeCheck, type LucideIcon } from 'lucide-react';

const ICON_LIST: LucideIcon[] = [Languages, Briefcase, IndianRupee, Hammer, MessageSquare, BadgeCheck];

interface FeaturesCms {
  feat_eyebrow?: string | null; feat_heading?: string | null; feat_subtitle?: string | null;
  features?: { title?: string; desc?: string }[] | null;
}

export function Features({ cms }: { cms?: FeaturesCms | null }) {
  const eyebrow = cms?.feat_eyebrow || 'Why Us';
  const heading = cms?.feat_heading || "Built for India's Next IT Generation";
  const subtitle = cms?.feat_subtitle || 'Six things we obsess over so you can ship a career, not just complete a course.';
  const items = (cms?.features && cms.features.length)
    ? cms.features.map((x, i) => ({ num: String(i + 1).padStart(2, '0'), title: x.title || '', desc: x.desc || '', icon: '' }))
    : FEATURES;

  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <Eyebrow className="justify-center">{eyebrow}</Eyebrow>
            <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-tight tracking-tight">{heading}</h2>
            <p className="mt-4 text-slate-600">{subtitle}</p>
          </div>
        </Reveal>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((f, i) => {
            const Icon = ICON_LIST[i % ICON_LIST.length] ?? BadgeCheck;
            return (
              <Reveal key={f.num} delay={(i % 3) * 0.08}>
                <div className="group h-full rounded-md bg-white border border-slate-200 shadow-card p-6 hover:-translate-y-1 hover:shadow-cardHover hover:border-brand-200 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 group-hover:from-brand-500 group-hover:to-accent group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[11px] text-slate-300 tracking-wider">{f.num}</span>
                  </div>
                  <h3 className="mt-5 heading text-lg text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
