import { Linkedin } from 'lucide-react';
import Link from 'next/link';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const LEADERSHIP = [
  { name: 'Vikram Iyer',   role: 'Founder & CEO',           initial: 'V', accent: 'from-brand-500 to-brand-700' },
  { name: 'Nandita Rao',   role: 'Co-founder · Head of Ed', initial: 'N', accent: 'from-rose-500 to-amber-500' },
  { name: 'Rohit Sharma',  role: 'CTO',                     initial: 'R', accent: 'from-emerald-500 to-brand-500' },
  { name: 'Shweta Kapoor', role: 'Head of Placements',      initial: 'S', accent: 'from-violet-500 to-brand-500' },
];

export default function MobileTeamPage() {
  return (
    <div>
      <MobilePageHeader title="Team" subtitle="People behind the platform" />
      <div className="px-3 pt-2 grid grid-cols-2 gap-3 pb-4">
        {LEADERSHIP.map((p) => (
          <div key={p.name} className="rounded-md bg-white border border-slate-200 shadow-card p-3 text-center">
            <div className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-br ${p.accent} text-white heading text-xl flex items-center justify-center`}>{p.initial}</div>
            <h3 className="mt-2 heading text-[13px] font-bold text-slate-900">{p.name}</h3>
            <p className="text-[10.5px] text-brand-700 font-semibold">{p.role}</p>
            <div className="mt-2 flex justify-center">
              <Link href="#" className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><Linkedin className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
