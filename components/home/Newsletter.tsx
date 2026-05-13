'use client';

import { Mail, Send, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';

export function Newsletter() {
  return (
    <section className="py-12 sm:py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Newsletter */}
            <div className="rounded-md bg-white border border-slate-200 shadow-card p-7">
              <span className="text-[11px] font-semibold tracking-[0.18em] text-brand-600 uppercase">Stay in the loop</span>
              <h3 className="mt-2 heading text-2xl text-slate-900">Get free roadmaps + new batch alerts</h3>
              <p className="mt-2 text-sm text-slate-600">One curated email each week. No spam — unsubscribe in one click.</p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-5 flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-slate-50">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
                <Button variant="primary">Subscribe</Button>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-2 pt-5 border-t border-slate-100">
                <span className="text-[12px] text-slate-500">or join us on</span>
                <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-50 text-emerald-700 text-[12px] font-semibold hover:bg-emerald-100">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand-50 text-brand-700 text-[12px] font-semibold hover:bg-brand-100">
                  <Send className="h-3.5 w-3.5" /> Telegram
                </a>
              </div>
            </div>

            {/* App promo */}
            <div className="relative rounded-md overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent text-white p-7 shadow-cardHover">
              <div aria-hidden className="glow bg-white/10 w-[300px] h-[300px] -top-20 -right-20" />
              <div className="relative">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase">Get the app</span>
                <h3 className="mt-2 heading text-2xl">Learn offline. Anywhere.</h3>
                <p className="mt-2 text-sm text-white/85 max-w-sm">Download lessons, take quizzes and sync your progress when you&apos;re back online.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#" className="inline-flex items-center gap-2 rounded-sm bg-black/40 hover:bg-black/60 backdrop-blur px-4 py-2.5 text-sm font-semibold">
                    <span className="text-[10px] opacity-80 leading-none">GET IT ON</span>
                    <span className="font-bold">Google Play</span>
                  </a>
                  <a href="#" className="inline-flex items-center gap-2 rounded-sm bg-black/40 hover:bg-black/60 backdrop-blur px-4 py-2.5 text-sm font-semibold">
                    <span className="text-[10px] opacity-80 leading-none">Download on the</span>
                    <span className="font-bold">App Store</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
