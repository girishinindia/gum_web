import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Users, Globe, Award, Heart, Target, Compass, Lightbulb } from 'lucide-react';
import { api } from '@/lib/api';

export const metadata = {
  title: 'About Us',
  description: 'Grow Up More is a multilingual e-learning platform helping learners build job-ready IT skills with mentorship and placement support.',
  openGraph: { title: 'About Grow Up More', description: 'A multilingual e-learning platform for job-ready IT skills.' },
};

export const revalidate = 120;

const STAT_ICONS = [Users, Globe, Award, Heart, Target, Compass];
const VALUE_ICONS = [Target, Compass, Heart, Lightbulb, Award, Globe];

const DEFAULT = {
  hero_eyebrow: 'About Grow Up More',
  hero_title: "Helping India's next generation launch real tech careers",
  hero_subtitle: "We're a mission-driven team of educators, engineers and operators building India's most accessible IT-skilling platform.",
  stats: [
    { value: '50K+', label: 'Learners' },
    { value: '12+', label: 'Languages' },
    { value: '250+', label: 'Hiring partners' },
    { value: '95%', label: 'Placement rate' },
  ],
  story_eyebrow: 'Our story',
  story_heading: 'From a regret to a movement',
  story_body: "Grow Up More started in 2022 when our founder watched a brilliant cousin drop out of a coding bootcamp — not because she couldn't code, but because the entire course was in English, and she was thinking in Marathi.\n\nIndia produces 1.5 million engineers a year. Less than 10% are job-ready by industry standards. We don't think that's a talent problem — we think that's a translation problem, a pricing problem, and a structure problem. So we set out to fix all three.\n\nToday, 50,000+ learners across 23 states are training in their language, building real projects, and getting placed at companies like Flipkart, Razorpay, Swiggy and TCS — at fees one-tenth of conventional bootcamps.",
  values_eyebrow: 'What we believe',
  values_heading: 'Three things, non-negotiable.',
  values: [
    { title: 'Accessibility first', description: 'Industry-grade education in 12+ Indian languages. Tier-2 / tier-3 students are not an afterthought.' },
    { title: 'Outcomes, not credits', description: 'We measure ourselves by careers shipped, not lectures viewed.' },
    { title: 'Mentor obsession', description: 'Every cohort gets dedicated mentor time. No bot replies, no copy-paste feedback.' },
  ],
};

export default async function AboutPage() {
  const a = ((await api.aboutPage()) || {}) as any;
  const v = (k: string, d: string) => (a[k] && String(a[k]).trim() ? String(a[k]) : d);

  const stats = (Array.isArray(a.stats) && a.stats.length ? a.stats : DEFAULT.stats) as { value: string; label: string }[];
  const values = (Array.isArray(a.values) && a.values.length ? a.values : DEFAULT.values) as { title: string; description: string }[];
  const storyParas = v('story_body', DEFAULT.story_body).split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

  const missionBody = String(a.mission_body || '').trim();
  const visionBody = String(a.vision_body || '').trim();
  const ctaHeading = String(a.cta_heading || '').trim();
  const ctaSubtitle = String(a.cta_subtitle || '').trim();

  return (
    <>
      <PageHero
        eyebrow={v('hero_eyebrow', DEFAULT.hero_eyebrow)}
        title={v('hero_title', DEFAULT.hero_title)}
        subtitle={v('hero_subtitle', DEFAULT.hero_subtitle)}
      />

      {/* Stats */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s, i) => {
              const Icon = STAT_ICONS[i % STAT_ICONS.length];
              return (
                <Reveal key={`${s.label}-${i}`}>
                  <div className="rounded-md bg-white border border-slate-200 shadow-card p-5 text-center">
                    <Icon className="h-6 w-6 text-brand-600 mx-auto" />
                    <div className="mt-2 heading text-2xl text-gradient">{s.value}</div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mt-1">{s.label}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <Eyebrow>{v('story_eyebrow', DEFAULT.story_eyebrow)}</Eyebrow>
          <h2 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">{v('story_heading', DEFAULT.story_heading)}</h2>
          <div className="mt-6 space-y-5 text-[16px] leading-[1.8] text-slate-700">
            {storyParas.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      {(missionBody || visionBody) && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-5">
            {missionBody && (
              <div className="rounded-md bg-white border border-slate-200 shadow-card p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700"><Target className="h-5 w-5" /></div>
                <h3 className="mt-5 heading text-lg text-slate-900">{String(a.mission_title || 'Our mission')}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{missionBody}</p>
              </div>
            )}
            {visionBody && (
              <div className="rounded-md bg-white border border-slate-200 shadow-card p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700"><Compass className="h-5 w-5" /></div>
                <h3 className="mt-5 heading text-lg text-slate-900">{String(a.vision_title || 'Our vision')}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{visionBody}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Core values */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow className="justify-center">{v('values_eyebrow', DEFAULT.values_eyebrow)}</Eyebrow>
            <h2 className="mt-3 heading text-3xl sm:text-4xl text-slate-900">{v('values_heading', DEFAULT.values_heading)}</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {values.map((val, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <Reveal key={`${val.title}-${i}`} delay={i * 0.08}>
                  <div className="h-full rounded-md bg-white border border-slate-200 shadow-card p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700"><Icon className="h-5 w-5" /></div>
                    <h3 className="mt-5 heading text-lg text-slate-900">{val.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{val.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      {ctaHeading && (
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 text-white p-8 sm:p-10 text-center shadow-cardHover">
              <h2 className="heading text-2xl sm:text-3xl">{ctaHeading}</h2>
              {ctaSubtitle && <p className="mt-2 text-sm sm:text-base text-white/85 max-w-2xl mx-auto">{ctaSubtitle}</p>}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/courses" className="rounded-full bg-white text-brand-700 px-6 py-2.5 text-sm font-bold shadow-btn">Explore courses</Link>
                <Link href="/contact" className="rounded-full border border-white/60 text-white px-6 py-2.5 text-sm font-bold">Contact us</Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
