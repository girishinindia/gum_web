import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Search, Code2, Hammer, Briefcase, ChevronRight, type LucideIcon } from 'lucide-react';

interface Step {
  num:   number;
  title: string;
  desc:  string;
  Icon:  LucideIcon;
}

const STEP_ICONS: LucideIcon[] = [Search, Code2, Hammer, Briefcase];

const STEPS_DEFAULT = [
  { title: 'Choose Your Course',  desc: 'Browse 200+ industry-ready courses across 20 tech domains.' },
  { title: 'Learn at Your Pace',  desc: 'HD video lessons, live sessions, mentorship & doubt support in your language.' },
  { title: 'Build Real Projects', desc: 'Work on industry-grade capstone projects to build your portfolio.' },
  { title: 'Get Placed',          desc: '100% placement support with resume building, mock interviews & referrals.' },
];

interface HowItWorksCms {
  hiw_eyebrow?: string | null; hiw_heading?: string | null; hiw_subtitle?: string | null;
  hiw_steps?: { title?: string; desc?: string }[] | null;
}

export function HowItWorks({ cms }: { cms?: HowItWorksCms | null }) {
  const eyebrow = cms?.hiw_eyebrow || 'How It Works';
  const heading = cms?.hiw_heading || 'Your Journey to a Tech Career';
  const subtitle = cms?.hiw_subtitle || 'A simple 4-step process to go from beginner to job-ready professional.';
  const src = (cms?.hiw_steps && cms.hiw_steps.length) ? cms.hiw_steps : STEPS_DEFAULT;
  const STEPS: Step[] = src.map((s, i) => ({ num: i + 1, title: s.title || '', desc: s.desc || '', Icon: STEP_ICONS[i % STEP_ICONS.length] }));

  return (
    <section id="how-it-works" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <Eyebrow className="justify-center"><span className="text-center">{eyebrow}</span></Eyebrow>
            <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-tight tracking-tight">
              {heading}
            </h2>
            <p className="mt-4 text-slate-600">
              {subtitle}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4 relative">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.08}>
              <div className="relative text-center">
                {/* Huge outline number behind */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-6 right-2 sm:right-6 heading text-[110px] sm:text-[120px] leading-none font-extrabold select-none"
                  style={{
                    WebkitTextStroke: '1.5px rgba(14,165,233,0.18)',
                    color: 'transparent',
                  }}
                >
                  {s.num}
                </span>

                {/* Blue gradient circle icon */}
                <div className="relative mx-auto inline-flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700 shadow-btn">
                  <s.Icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="relative mt-5 heading text-xl text-slate-900">{s.title}</h3>
                <p className="relative mt-2 text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight aria-hidden className="hidden lg:block absolute top-8 right-0 translate-x-1/2 h-5 w-5 text-brand-300" />
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
