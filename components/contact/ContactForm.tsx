'use client';

import { useState } from 'react';
import { apiBase } from '@/lib/api';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

const labelCls = 'block text-[12px] font-semibold text-slate-700 mb-1.5';
const inputCls = 'w-full px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400';

export function ContactForm({ sourcePage = 'contact' }: { sourcePage?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const message = String(fd.get('message') || '').trim();

    if (!name || !email || !phone || !message) { setError('Please fill all required fields.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }

    const payload = { name, email, phone, website: String(fd.get('website') || '').trim(), message, source_page: sourcePage };
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase()}/contact-enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({ success: false }));
      if (res.ok && json.success) { setDone(true); form.reset(); }
      else setError(json.message || json.error || 'Something went wrong. Please try again.');
    } catch {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="rounded-md bg-white border border-success/30 shadow-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-3 heading text-lg text-slate-900">Message sent!</h3>
        <p className="mt-1.5 text-sm text-slate-600">Thank you for reaching out. We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md bg-white border border-slate-200 shadow-card p-6 sm:p-8 space-y-4">
      {error && <div className="rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3.5 py-2.5">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full name <span className="text-rose-500">*</span></label>
          <input name="name" required className={inputCls} placeholder="Your name" />
        </div>
        <div>
          <label className={labelCls}>Email <span className="text-rose-500">*</span></label>
          <input name="email" type="email" required className={inputCls} placeholder="you@example.com" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Phone <span className="text-rose-500">*</span></label>
          <input name="phone" type="tel" required className={inputCls} placeholder="+91 …" />
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input name="website" type="url" className={inputCls} placeholder="https://…" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Message <span className="text-rose-500">*</span></label>
        <textarea name="message" rows={6} required className={inputCls} placeholder="Tell us a bit about what you need…" />
      </div>
      <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-6 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all disabled:opacity-70">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send message</>}
      </button>
    </form>
  );
}
