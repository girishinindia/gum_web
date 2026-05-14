import Link from 'next/link';
import { ShoppingCart, Heart, Layers, Users, Star, CheckCircle2, Share2, BookOpen } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const INCLUDED = [
  { name: 'MERN Full-Stack Engineer',    cover: 'from-brand-700 to-brand-500' },
  { name: 'Cloud & DevOps Essentials',   cover: 'from-emerald-700 to-brand-500' },
  { name: 'System Design Advanced',       cover: 'from-violet-700 to-rose-500' },
  { name: 'Capstone Bootcamp',            cover: 'from-amber-600 to-rose-500' },
];

export default function MobileBundleDetail() {
  return (
    <div>
      <MobilePageHeader
        title="Full-Stack Pro Bundle"
        action={
          <button
            type="button"
            aria-label="Share"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all"
          >
            <Share2 className="h-4 w-4" />
          </button>
        }
      />

      {/* Hero */}
      <div className="px-3">
        <div className="relative h-32 rounded-md bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 overflow-hidden flex items-end p-4">
          <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SAVE 54%</div>
          <div className="text-white">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 backdrop-blur border border-white/25 px-2 py-0.5 rounded-full">
              <Layers className="h-3 w-3" /> 4 courses
            </div>
          </div>
        </div>
      </div>

      <section className="px-4 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Bundle · Full-Stack Career</div>
        <h1 className="mt-1 heading text-2xl text-slate-900 leading-tight">Full-Stack Pro Bundle</h1>
        <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">MERN + DevOps + System Design + Capstone — the complete 6-month roadmap to a Full-Stack Engineer role.</p>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Layers className="h-3 w-3" /> 4 courses</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> 3,200+</span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Star className="h-3 w-3 fill-warn text-warn" /> 4.9</span>
        </div>
      </section>

      {/* What you get */}
      <section className="px-4 mt-5">
        <h2 className="heading text-[15px] font-bold text-slate-900">What this bundle gets you</h2>
        <ul className="mt-2 space-y-1.5">
          {['12-month access to all 4 courses','1:1 mentorship with senior engineers','Live placement-prep workshops','Industry-grade capstone project','Hiring partner intros','Career counsellor support'].map((p) => (
            <li key={p} className="flex items-start gap-2 text-[12px] text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Courses inside */}
      <section className="px-4 mt-5">
        <h2 className="heading text-[15px] font-bold text-slate-900">Courses in this bundle</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {INCLUDED.map((c) => (
            <div key={c.name} className="rounded-md bg-white border border-slate-200 overflow-hidden">
              <div className={`h-16 bg-gradient-to-br ${c.cover} flex items-center justify-center text-white`}>
                <BookOpen className="h-5 w-5 opacity-80" />
              </div>
              <div className="p-2 text-[11px] font-semibold text-slate-900 leading-tight line-clamp-2 min-h-[34px]">{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky buy bar */}
      <div className="fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/70 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="heading text-lg text-slate-900">₹59,999</span>
              <span className="text-[10.5px] text-slate-400 line-through">₹1,29,999</span>
            </div>
            <div className="text-[10.5px] text-success font-semibold">You save ₹70,000</div>
          </div>
          <button aria-label="Wishlist" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 active:scale-95 transition-all">
            <Heart className="h-4 w-4 text-slate-700" />
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all">
            <ShoppingCart className="h-4 w-4" /> Buy
          </button>
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}
