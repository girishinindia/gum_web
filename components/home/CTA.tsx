import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative rounded-lg p-10 lg:p-14 text-center text-white overflow-hidden bg-hero-grad shadow-cardHover">
            <div aria-hidden className="glow bg-white/10 w-[400px] h-[400px] -top-32 -left-20" />
            <div aria-hidden className="glow bg-white/10 w-[400px] h-[400px] -bottom-32 -right-20" />
            <div className="relative">
              <h2 className="heading text-3xl sm:text-5xl">Your next career chapter starts today.</h2>
              <p className="mt-4 max-w-2xl mx-auto text-white/90">
                Join 50,000+ learners already building their futures with Grow Up More. New batches start every Monday.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href="/courses" variant="white" size="lg" className="text-brand-700">
                  Explore Courses <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="glass" size="lg" className="text-white border border-white/40">
                  Talk to an advisor
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
