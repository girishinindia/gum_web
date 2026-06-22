import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

interface CtaCms {
  cta_heading?: string | null; cta_subtitle?: string | null;
  cta_primary_label?: string | null; cta_primary_href?: string | null;
  cta_secondary_label?: string | null; cta_secondary_href?: string | null;
}

export function CTA({ cms }: { cms?: CtaCms | null }) {
  const heading = cms?.cta_heading || 'Your next career chapter starts today.';
  const subtitle = cms?.cta_subtitle || 'Join 50,000+ learners already building their futures with Grow Up More. New batches start every Monday.';
  const pLabel = cms?.cta_primary_label || 'Explore Courses';
  const pHref = cms?.cta_primary_href || '/courses';
  const sLabel = cms?.cta_secondary_label || 'Talk to an advisor';
  const sHref = cms?.cta_secondary_href || '/contact';
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative rounded-lg p-10 lg:p-14 text-center text-white overflow-hidden bg-hero-grad shadow-cardHover">
            <div aria-hidden className="glow bg-white/10 w-[400px] h-[400px] -top-32 -left-20" />
            <div aria-hidden className="glow bg-white/10 w-[400px] h-[400px] -bottom-32 -right-20" />
            <div className="relative">
              <h2 className="heading text-3xl sm:text-5xl">{heading}</h2>
              <p className="mt-4 max-w-2xl mx-auto text-white/90">
                {subtitle}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href={pHref} variant="white" size="lg" className="text-brand-700">
                  {pLabel} <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href={sHref} variant="glass" size="lg" className="text-white border border-white/40">
                  {sLabel}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
