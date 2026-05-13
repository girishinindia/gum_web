import Link from 'next/link';
import { Calendar, Clock, Radio, Users, ChevronRight, Bell, Share2, CheckCircle2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';

export default function WebinarDetailPage() {
  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link><ChevronRight className="h-3 w-3" />
          <Link href="/webinars" className="hover:text-brand-700">Webinars</Link><ChevronRight className="h-3 w-3" />
          <span>Generative AI for Beginners</span>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-10">
          <div>
            <Eyebrow><span className="inline-flex items-center gap-1.5"><Radio className="h-3 w-3 text-rose-500 animate-pulse" /> LIVE WEBINAR</span></Eyebrow>
            <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">
              Generative AI for <span className="text-gradient">Beginners</span>
            </h1>
            <p className="mt-4 text-slate-600 max-w-2xl">
              A 60-minute crash course on building production-grade GenAI apps. No prior ML experience needed — bring a laptop, leave with a working RAG pipeline.
            </p>

            <div className="mt-6 rounded-md bg-gradient-to-br from-brand-700 via-brand-600 to-accent text-white p-6 aspect-video flex flex-col justify-between overflow-hidden relative">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider">
                  <Bell className="h-3 w-3" /> Starts in 2d 14h
                </div>
              </div>
              <div className="relative">
                <div className="text-[11px] uppercase tracking-wider opacity-80">Hosted by</div>
                <div className="heading text-2xl mt-1">Aniket Rao</div>
                <div className="text-sm opacity-90">Sr. ML Engineer · ex-Google</div>
              </div>
            </div>

            <h2 className="mt-8 heading text-2xl text-slate-900">What you&apos;ll take away</h2>
            <ul className="mt-3 space-y-2.5">
              {[
                'How LLMs work under the hood — embeddings, tokens, attention',
                'Build a working RAG pipeline using LangChain + Pinecone',
                'Choose the right model: GPT-4o vs Claude vs open-source',
                'Production patterns — caching, evals, guardrails',
                'Career paths in GenAI for 2026',
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {p}</li>
              ))}
            </ul>
          </div>

          <Reveal>
            <div className="rounded-md bg-white border border-slate-200 shadow-cardHover p-6 lg:sticky lg:top-24 self-start">
              <div className="text-[11px] font-bold uppercase tracking-wider text-success">FREE</div>
              <div className="heading text-xl text-slate-900 mt-1">Reserve your seat</div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-700"><Calendar className="h-4 w-4 text-brand-600" /> Sat, 17 May 2026</div>
                <div className="flex items-center gap-2 text-slate-700"><Clock className="h-4 w-4 text-brand-600" /> 7:00 PM IST · 60 min</div>
                <div className="flex items-center gap-2 text-slate-700"><Users className="h-4 w-4 text-brand-600" /> 1,842 registered</div>
              </div>

              <form className="mt-5 space-y-2.5">
                <input type="text"  placeholder="Full name" className="w-full px-3 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400" />
                <input type="email" placeholder="Email"     className="w-full px-3 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400" />
                <input type="tel"   placeholder="Phone (WhatsApp)" className="w-full px-3 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400" />
                <Button variant="primary" className="w-full rounded-full">Reserve seat</Button>
                <Button variant="outline" className="w-full rounded-full"><Share2 className="h-4 w-4" /> Invite a friend</Button>
              </form>

              <div className="mt-5 pt-5 border-t border-slate-100 text-[11px] text-slate-500">
                Recording will be sent to your email if you can&apos;t attend live.
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 text-center">
          <h3 className="heading text-lg text-slate-900">Looking for more?</h3>
          <ButtonLink href="/webinars" variant="outline" size="md" className="mt-3 rounded-full">Browse all webinars</ButtonLink>
        </div>
      </div>
    </section>
  );
}
