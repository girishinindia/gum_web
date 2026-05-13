import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Users, Globe, Award, Heart, Target, Compass } from 'lucide-react';

const STATS = [
  { value: '50K+',  label: 'Learners',          Icon: Users },
  { value: '12+',   label: 'Languages',         Icon: Globe },
  { value: '250+',  label: 'Hiring partners',   Icon: Award },
  { value: '95%',   label: 'Placement rate',    Icon: Heart },
];

const VALUES = [
  { Icon: Target,  title: 'Accessibility first',     desc: 'Industry-grade education in 12+ Indian languages. Tier-2 / tier-3 students are not an afterthought.' },
  { Icon: Compass, title: 'Outcomes, not credits',   desc: 'We measure ourselves by careers shipped, not lectures viewed.' },
  { Icon: Heart,   title: 'Mentor obsession',        desc: 'Every cohort gets dedicated mentor time. No bot replies, no copy-paste feedback.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Grow Up More"
        title={<>Helping India&apos;s next generation <span className="text-gradient">launch real tech careers</span></>}
        subtitle="We&apos;re a mission-driven team of educators, engineers and operators building India's most accessible IT-skilling platform."
      />

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map((s) => (
              <Reveal key={s.label}>
                <div className="rounded-md bg-white border border-slate-200 shadow-card p-5 text-center">
                  <s.Icon className="h-6 w-6 text-brand-600 mx-auto" />
                  <div className="mt-2 heading text-2xl text-gradient">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 mt-1">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <Eyebrow>Our story</Eyebrow>
          <h2 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">From a regret to a movement</h2>
          <div className="mt-6 space-y-5 text-[16px] leading-[1.8] text-slate-700">
            <p>Grow Up More started in 2022 when our founder watched a brilliant cousin drop out of a coding bootcamp — not because she couldn&apos;t code, but because the entire course was in English, and she was thinking in Marathi.</p>
            <p>India produces 1.5 million engineers a year. Less than 10% are job-ready by industry standards. We don&apos;t think that&apos;s a talent problem — we think that&apos;s a translation problem, a pricing problem, and a structure problem. So we set out to fix all three.</p>
            <p>Today, 50,000+ learners across 23 states are training in their language, building real projects, and getting placed at companies like Flipkart, Razorpay, Swiggy and TCS — at fees one-tenth of conventional bootcamps.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow className="justify-center">What we believe</Eyebrow>
            <h2 className="mt-3 heading text-3xl sm:text-4xl text-slate-900">Three things, non-negotiable.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-md bg-white border border-slate-200 shadow-card p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700">
                    <v.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 heading text-lg text-slate-900">{v.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
