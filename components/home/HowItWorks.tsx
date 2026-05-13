import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Search, Code2, Hammer, Briefcase, ChevronRight, type LucideIcon } from 'lucide-react';

interface Step {
  num:   number;
  title: string;
  desc:  string;
  Icon:  LucideIcon;
}

const STEPS: Step[] = [
  { num: 1, title: 'Choose Your Course',  desc: 'Browse 200+ industry-ready courses across 20 tech domains.',                       Icon: Search    },
  { num: 2, title: 'Learn at Your Pace',  desc: 'HD video lessons, live sessions, mentorship & doubt support in your language.',    Icon: Code2     },
  { num: 3, title: 'Build Real Projects', desc: 'Work on industry-grade capstone projects to build your portfolio.',                 Icon: Hammer    },
  { num: 4, title: 'Get Placed',          desc: '100% placement support with resume building, mock interviews & referrals.',         Icon: Briefcase },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <Eyebrow className="justify-center"><span className="text-center">How It Works</span></Eyebrow>
            <h2 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-tight tracking-tight">
              Your Journey to a Tech Career
            </h2>
            <p className="mt-4 text-slate-600">
              A simple 4-step process to go from beginner to job-ready professional.
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
