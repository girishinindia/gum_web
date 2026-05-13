import Link from 'next/link';
import { IndianRupee, Users, Star, TrendingUp, ArrowRight, BookOpen, Wallet } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';

const KPI = [
  { label:'Earnings · this FY', value:'₹12.4L',  Icon:IndianRupee,  accent:'from-brand-500 to-brand-700' },
  { label:'Students',           value:'24,512',  Icon:Users,        accent:'from-emerald-500 to-brand-500' },
  { label:'Avg rating',         value:'4.9',     Icon:Star,         accent:'from-amber-500 to-rose-500' },
  { label:'Active courses',     value:'8',       Icon:BookOpen,     accent:'from-violet-500 to-brand-500' },
];

const QUICKS = [
  { href:'/instructor/earnings',      label:'Earnings',        Icon:TrendingUp, desc:'Course-wise breakdown, monthly trends' },
  { href:'/instructor/payouts',       label:'Payouts',         Icon:Wallet,     desc:'Request payout, view history, TDS' },
  { href:'/instructor/bank-accounts', label:'Bank accounts',   Icon:IndianRupee, desc:'Add / verify bank details' },
];

export default function InstructorDashboard() {
  return (
    <div className="max-w-7xl">
      <Eyebrow>Instructor</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Hi Aniket — here&apos;s your week</h1>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI.map((s) => (
          <div key={s.label} className="rounded-md bg-white border border-slate-200 shadow-card p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${s.accent} text-white shadow-btn`}><s.Icon className="h-4 w-4" /></div>
            <div className="mt-3 heading text-2xl text-slate-900">{s.value}</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-5">
        {QUICKS.map((q) => (
          <Link key={q.href} href={q.href} className="group rounded-md bg-white border border-slate-200 shadow-card p-5 hover:-translate-y-1 hover:shadow-cardHover transition-all">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700"><q.Icon className="h-5 w-5" /></div>
            <h3 className="mt-4 heading text-lg text-slate-900 group-hover:text-brand-700 transition-colors">{q.label}</h3>
            <p className="mt-1 text-[12.5px] text-slate-600">{q.desc}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700">Open <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" /></div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        {/* Earnings chart placeholder */}
        <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
          <h2 className="heading text-lg text-slate-900">Earnings · last 6 months</h2>
          <div className="mt-4 flex items-end gap-2 h-40">
            {[40,55,48,65,78,82].map((v, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500 to-accent" style={{ height: v + '%' }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10.5px] text-slate-500">
            {['Dec','Jan','Feb','Mar','Apr','May'].map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        <div className="rounded-md bg-white border border-slate-200 shadow-card p-5">
          <h2 className="heading text-lg text-slate-900">Recent reviews</h2>
          <ul className="mt-3 space-y-3 text-[13px] text-slate-700">
            <li className="pb-3 border-b border-slate-100"><strong>Rohan M.</strong> · Data Science — &ldquo;Best Hindi-language coverage of stats I&apos;ve found.&rdquo;</li>
            <li className="pb-3 border-b border-slate-100"><strong>Sneha K.</strong> · GenAI Builder — &ldquo;The capstone is brilliant.&rdquo;</li>
            <li><strong>Pooja N.</strong> · Data Science — &ldquo;Loved the mentor 1:1s.&rdquo;</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
