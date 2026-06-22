'use client';

import { useState } from 'react';
import { Mail, Send, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { apiBase } from '@/lib/api';

interface NewsletterCms {
  nl_eyebrow?: string | null; nl_heading?: string | null; nl_subtitle?: string | null;
  nl_whatsapp_url?: string | null; nl_telegram_url?: string | null;
  app_eyebrow?: string | null; app_heading?: string | null; app_subtitle?: string | null;
  app_playstore_url?: string | null; app_appstore_url?: string | null;
}

export function Newsletter({ cms }: { cms?: NewsletterCms | null }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const nlEyebrow = cms?.nl_eyebrow || 'Stay in the loop';
  const nlHeading = cms?.nl_heading || 'Get free roadmaps + new batch alerts';
  const nlSubtitle = cms?.nl_subtitle || 'One curated email each week. No spam — unsubscribe in one click.';
  const whatsapp = cms?.nl_whatsapp_url || '';
  const telegram = cms?.nl_telegram_url || '';
  const appEyebrow = cms?.app_eyebrow || 'Get the app';
  const appHeading = cms?.app_heading || 'Learn offline. Anywhere.';
  const appSubtitle = cms?.app_subtitle || "Download lessons, take quizzes and sync your progress when you're back online.";
  const playUrl = cms?.app_playstore_url || '#';
  const appStoreUrl = cms?.app_appstore_url || '#';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setState('error'); setMessage('Please enter a valid email address.'); return; }
    setState('loading');
    try {
      const res = await fetch(`${apiBase()}/newsletter/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, source: 'homepage' }),
      });
      const json = await res.json().catch(() => ({ success: false }));
      if (res.ok && json.success) { setState('done'); setMessage(json.message || 'Subscribed!'); setEmail(''); }
      else { setState('error'); setMessage(json.message || json.error || 'Something went wrong. Please try again.'); }
    } catch {
      setState('error'); setMessage('Network error. Please try again.');
    }
  }

  return (
    <section className="py-12 sm:py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Newsletter */}
            <div className="rounded-md bg-white border border-slate-200 shadow-card p-7">
              <span className="text-[11px] font-semibold tracking-[0.18em] text-brand-600 uppercase">{nlEyebrow}</span>
              <h3 className="mt-2 heading text-2xl text-slate-900">{nlHeading}</h3>
              <p className="mt-2 text-sm text-slate-600">{nlSubtitle}</p>

              {state === 'done' ? (
                <div className="mt-5 flex items-center gap-2 rounded-sm bg-success/5 border border-success/30 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> {message}
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-sm border border-slate-200 px-3 bg-slate-50">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <Button variant="primary" disabled={state === 'loading'}>
                    {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
                  </Button>
                </form>
              )}
              {state === 'error' && <p className="mt-2 text-[12px] text-rose-600">{message}</p>}

              {(whatsapp || telegram) && (
                <div className="mt-5 flex flex-wrap items-center gap-2 pt-5 border-t border-slate-100">
                  <span className="text-[12px] text-slate-500">or join us on</span>
                  {whatsapp && (
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-50 text-emerald-700 text-[12px] font-semibold hover:bg-emerald-100">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                  {telegram && (
                    <a href={telegram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand-50 text-brand-700 text-[12px] font-semibold hover:bg-brand-100">
                      <Send className="h-3.5 w-3.5" /> Telegram
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* App promo */}
            <div className="relative rounded-md overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent text-white p-7 shadow-cardHover">
              <div aria-hidden className="glow bg-white/10 w-[300px] h-[300px] -top-20 -right-20" />
              <div className="relative">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase">{appEyebrow}</span>
                <h3 className="mt-2 heading text-2xl">{appHeading}</h3>
                <p className="mt-2 text-sm text-white/85 max-w-sm">{appSubtitle}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={playUrl} target={playUrl !== '#' ? '_blank' : undefined} rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-black/40 hover:bg-black/60 backdrop-blur px-4 py-2.5 text-sm font-semibold">
                    <span className="text-[10px] opacity-80 leading-none">GET IT ON</span>
                    <span className="font-bold">Google Play</span>
                  </a>
                  <a href={appStoreUrl} target={appStoreUrl !== '#' ? '_blank' : undefined} rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm bg-black/40 hover:bg-black/60 backdrop-blur px-4 py-2.5 text-sm font-semibold">
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
