import { Reveal } from '@/components/ui/Reveal';
import { TRUSTED_BY } from '@/lib/homeContent';

export function TrustedStrip() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase text-center">
            Trusted by learners hired at
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {TRUSTED_BY.map((b) => (
              <span key={b.name} className="text-slate-400 font-semibold text-lg sm:text-xl tracking-tight grayscale opacity-70 hover:opacity-100 hover:text-brand-700 hover:grayscale-0 transition-all">
                {b.logo}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
