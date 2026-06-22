'use client';

import { useState } from 'react';
import { apiBase } from '@/lib/api';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

const labelCls = 'block text-[12px] font-semibold text-slate-700 mb-1.5';
const baseInput = 'w-full px-3.5 py-2.5 rounded-sm border text-sm focus:outline-none focus:ring-2 transition-colors';
const okInput = 'border-slate-200 focus:ring-brand-200 focus:border-brand-400';
const errInput = 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-400';

type Field = 'name' | 'email' | 'phone' | 'website' | 'message';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;
const URL_RE = /^https?:\/\/.+\..+/i;

function validateField(name: Field, raw: string): string {
  const v = (raw || '').trim();
  switch (name) {
    case 'name':
      if (!v) return 'Please enter your name.';
      if (v.length < 2) return 'Name is too short.';
      return '';
    case 'email':
      if (!v) return 'Please enter your email.';
      if (!EMAIL_RE.test(v)) return 'Enter a valid email address.';
      return '';
    case 'phone':
      if (!v) return 'Please enter your phone number.';
      if (!PHONE_RE.test(v) || v.replace(/\D/g, '').length < 7) return 'Enter a valid phone number.';
      return '';
    case 'website':
      if (v && !URL_RE.test(v)) return 'Enter a valid URL (https://…).';
      return '';
    case 'message':
      if (!v) return 'Please enter a message.';
      if (v.length < 10) return 'Message must be at least 10 characters.';
      return '';
    default:
      return '';
  }
}

const FIELDS: Field[] = ['name', 'email', 'phone', 'website', 'message'];

export function ContactForm({ sourcePage = 'contact' }: { sourcePage?: string }) {
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', phone: '', website: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function setField(name: Field, value: string) {
    setValues((p) => ({ ...p, [name]: value }));
    // Clear an existing error as the user corrects it.
    if (errors[name]) setErrors((p) => ({ ...p, [name]: validateField(name, value) || undefined }));
  }
  function onBlur(name: Field) {
    setErrors((p) => ({ ...p, [name]: validateField(name, values[name]) || undefined }));
  }
  function validateAll(): boolean {
    const next: Partial<Record<Field, string>> = {};
    FIELDS.forEach((f) => { const m = validateField(f, values[f]); if (m) next[f] = m; });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!validateAll()) return;

    const payload = {
      name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(),
      website: values.website.trim(), message: values.message.trim(), source_page: sourcePage,
    };
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase()}/contact-enquiries`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({ success: false }));
      if (res.ok && json.success) { setDone(true); }
      else setFormError(json.message || json.error || 'Something went wrong. Please try again.');
    } catch {
      setFormError('Network error. Please try again.');
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

  const cls = (n: Field) => `${baseInput} ${errors[n] ? errInput : okInput}`;
  const Err = ({ n }: { n: Field }) => (errors[n] ? <p className="mt-1 text-[11px] text-rose-600">{errors[n]}</p> : null);

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-md bg-white border border-slate-200 shadow-card p-6 sm:p-8 space-y-4">
      {formError && <div className="rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3.5 py-2.5">{formError}</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full name <span className="text-rose-500">*</span></label>
          <input name="name" value={values.name} onChange={(e) => setField('name', e.target.value)} onBlur={() => onBlur('name')}
            aria-invalid={!!errors.name} className={cls('name')} placeholder="Your name" />
          <Err n="name" />
        </div>
        <div>
          <label className={labelCls}>Email <span className="text-rose-500">*</span></label>
          <input name="email" type="email" value={values.email} onChange={(e) => setField('email', e.target.value)} onBlur={() => onBlur('email')}
            aria-invalid={!!errors.email} className={cls('email')} placeholder="you@example.com" />
          <Err n="email" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Phone <span className="text-rose-500">*</span></label>
          <input name="phone" type="tel" value={values.phone} onChange={(e) => setField('phone', e.target.value)} onBlur={() => onBlur('phone')}
            aria-invalid={!!errors.phone} className={cls('phone')} placeholder="+91 …" />
          <Err n="phone" />
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input name="website" type="url" value={values.website} onChange={(e) => setField('website', e.target.value)} onBlur={() => onBlur('website')}
            aria-invalid={!!errors.website} className={cls('website')} placeholder="https://…" />
          <Err n="website" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Message <span className="text-rose-500">*</span></label>
        <textarea name="message" rows={6} value={values.message} onChange={(e) => setField('message', e.target.value)} onBlur={() => onBlur('message')}
          aria-invalid={!!errors.message} className={cls('message')} placeholder="Tell us a bit about what you need…" />
        <Err n="message" />
      </div>
      <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-6 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all disabled:opacity-70">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send message</>}
      </button>
    </form>
  );
}
