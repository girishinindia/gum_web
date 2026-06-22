import Link from 'next/link';
import { Users, Globe, Award, Heart, Target, Compass } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { api } from '@/lib/api';

export const revalidate = 120;

const STAT_ICONS = [Users, Globe, Award, Heart, Target, Compass];

const DEFAULT = {
  hero_subtitle: "We're a mission-driven team of educators, engineers and operators building India's most accessible IT-skilling platform.",
  stats: [
    { value: '50K+', label: 'Learners' },
    { value: '12+', label: 'Languages' },
    { value: '250+', label: 'Hiring partners' },
    { value: '95%', label: 'Placement rate' },
  ],
  story_eyebrow: 'Our story',
  story_body: "Grow Up More started in 2022 when our founder watched a brilliant cousin drop out of a coding bootcamp — not because she couldn't code, but because the course was in English, and she was thinking in Marathi.\n\nToday, 50,000+ learners across 23 states are training in their language, building real projects, and getting placed at companies like Flipkart, Razorpay, Swiggy and TCS.",
  values_heading: 'What we believe',
  values: [
    { title: 'Accessibility first', description: 'Industry-grade education in 12+ Indian languages.' },
    { title: 'Outcomes, not credits', description: 'We measure ourselves by careers shipped, not lectures viewed.' },
    { title: 'Mentor obsession', description: 'Every cohort gets dedicated mentor time.' },
  ],
};

export default async function MobileAboutPage() {
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
    <div>
      <MobilePageHeader title="About" subtitle="Grow Up More" />
      <div className="px-4 pt-2 space-y-5 pb-6">
        <p className="text-[14px] text-slate-700 leading-relaxed">{v('hero_subtitle', DEFAULT.hero_subtitle)}</p>

        <div className="grid grid-cols-2 gap-2">
          {stats.map((s, i) => {
            const Icon = STAT_ICONS[i % STAT_ICONS.length];
            return (
              <div key={`${s.label}-${i}`} className="rounded-md bg-white border border-slate-200 p-3 text-center">
                <Icon className="h-5 w-5 text-brand-600 mx-auto" />
                <div className="mt-1 heading text-xl text-gradient">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="heading text-[15px] font-bold text-slate-900">{v('story_eyebrow', DEFAULT.story_eyebrow)}</h2>
          {storyParas.map((p, i) => <p key={i} className="mt-2 text-[12.5px] text-slate-700 leading-relaxed">{p}</p>)}
        </div>

        {(missionBody || visionBody) && (
          <div className="space-y-3">
            {missionBody && (
              <div className="rounded-md bg-white border border-slate-200 p-3">
                <h3 className="heading text-[13px] text-slate-900">{String(a.mission_title || 'Our mission')}</h3>
                <p className="mt-1 text-[12px] text-slate-600 leading-relaxed">{missionBody}</p>
              </div>
            )}
            {visionBody && (
              <div className="rounded-md bg-white border border-slate-200 p-3">
                <h3 className="heading text-[13px] text-slate-900">{String(a.vision_title || 'Our vision')}</h3>
                <p className="mt-1 text-[12px] text-slate-600 leading-relaxed">{visionBody}</p>
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="heading text-[15px] font-bold text-slate-900">{v('values_heading', DEFAULT.values_heading)}</h2>
          <div className="mt-2 space-y-2">
            {values.map((val, i) => (
              <div key={`${val.title}-${i}`} className="rounded-md bg-white border border-slate-200 p-3">
                <h3 className="text-[13px] font-semibold text-slate-900">{val.title}</h3>
                <p className="mt-1 text-[12px] text-slate-600 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>

        {ctaHeading && (
          <div className="rounded-md bg-gradient-to-br from-brand-600 to-brand-700 text-white p-4 text-center">
            <h2 className="heading text-[15px]">{ctaHeading}</h2>
            {ctaSubtitle && <p className="mt-1 text-[12px] text-white/85">{ctaSubtitle}</p>}
            <Link href="/m/courses" className="mt-3 inline-block rounded-full bg-white text-brand-700 px-4 py-2 text-[12px] font-bold">Explore courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}
