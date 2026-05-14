import { Calendar, Clock, Radio, Users, Bell, CheckCircle2, Share2 } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

export default function MobileWebinarDetail() {
  return (
    <div>
      <MobilePageHeader
        title="Generative AI for Beginners"
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

      {/* Cover */}
      <div className="px-3">
        <div className="relative aspect-video rounded-md bg-gradient-to-br from-brand-700 via-brand-600 to-accent p-4 overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
              <Bell className="h-3 w-3" /> Starts in 2d 14h
            </div>
            <div className="mt-12 text-white">
              <div className="text-[10px] uppercase tracking-wider opacity-85">Hosted by</div>
              <div className="heading text-xl">Aniket Rao</div>
              <div className="text-[11.5px] opacity-90">Sr. ML Engineer · ex-Google</div>
            </div>
          </div>
        </div>
      </div>

      <section className="px-4 pt-4">
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-700">
          <Radio className="h-3 w-3 text-rose-500 animate-pulse" /> Live Webinar · Free
        </div>
        <h1 className="mt-1 heading text-xl text-slate-900 leading-tight">Generative AI for Beginners</h1>
        <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">A 60-minute crash course on building production-grade GenAI apps. No prior ML experience needed — bring a laptop, leave with a working RAG pipeline.</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile Icon={Calendar} label="Sat, 17 May" />
          <Tile Icon={Clock} label="7:00 PM IST" />
          <Tile Icon={Users} label="1,842 reg." />
        </div>

        <h2 className="heading text-[15px] font-bold text-slate-900 mt-5">What you&apos;ll take away</h2>
        <ul className="mt-2 space-y-1.5">
          {[
            'How LLMs work — embeddings, tokens, attention',
            'Build a working RAG pipeline using LangChain + Pinecone',
            'Choose the right model: GPT-4o vs Claude vs OSS',
            'Production patterns — caching, evals, guardrails',
          ].map((p) => (
            <li key={p} className="flex items-start gap-2 text-[12px] text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Sticky register */}
      <div className="fixed bottom-14 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/70 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1">
            <div className="text-[11px] font-bold text-success uppercase">Free</div>
            <div className="text-[10.5px] text-slate-500">Recording sent if you can&apos;t attend.</div>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all">
            Reserve seat
          </button>
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}

function Tile({ Icon, label }: { Icon: any; label: string }) {
  return (
    <div className="rounded-md bg-white border border-slate-200 p-2 text-center">
      <Icon className="h-4 w-4 text-brand-600 mx-auto" />
      <div className="mt-1 text-[10.5px] font-semibold text-slate-800">{label}</div>
    </div>
  );
}
