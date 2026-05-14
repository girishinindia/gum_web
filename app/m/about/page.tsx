import { Users, Globe, Award, Heart } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const STATS = [
  { value: '50K+', label: 'Learners',     Icon: Users },
  { value: '12+',  label: 'Languages',    Icon: Globe },
  { value: '250+', label: 'Hiring partners', Icon: Award },
  { value: '95%',  label: 'Placement rate', Icon: Heart },
];

export default function MobileAboutPage() {
  return (
    <div>
      <MobilePageHeader title="About" subtitle="Grow Up More" />
      <div className="px-4 pt-2 space-y-5 pb-4">
        <p className="text-[14px] text-slate-700 leading-relaxed">
          We&apos;re a mission-driven team of educators, engineers and operators building India&apos;s most accessible IT-skilling platform.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-md bg-white border border-slate-200 p-3 text-center">
              <s.Icon className="h-5 w-5 text-brand-600 mx-auto" />
              <div className="mt-1 heading text-xl text-gradient">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="heading text-[15px] font-bold text-slate-900">Our story</h2>
          <p className="mt-2 text-[12.5px] text-slate-700 leading-relaxed">
            Grow Up More started in 2022 when our founder watched a brilliant cousin drop out of a coding bootcamp — not because she couldn&apos;t code, but because the entire course was in English, and she was thinking in Marathi.
          </p>
          <p className="mt-2 text-[12.5px] text-slate-700 leading-relaxed">
            Today, 50,000+ learners across 23 states are training in their language, building real projects, and getting placed at companies like Flipkart, Razorpay, Swiggy and TCS.
          </p>
        </div>
      </div>
    </div>
  );
}
