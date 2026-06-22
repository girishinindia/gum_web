'use client';

import { useState } from 'react';
import { apiBase } from '@/lib/api';
import { CheckCircle2, Loader2, UploadCloud } from 'lucide-react';

interface Props {
  positionId: number;
  positionTitle: string;
}

const EXPERIENCE = ['Fresher', '0-1 years', '1-2 years', '2-3 years', '3-5 years', '5-8 years', '8+ years'];
const NOTICE = ['Immediate', '15 days', '1 month', '2 months', '3 months'];

const labelCls = 'block text-[13px] font-medium text-slate-700 mb-1';
const baseInput = 'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors';
const okInput = 'border-slate-200 focus:ring-brand-500/30 focus:border-brand-500';
const errInput = 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-400';

type TextField =
  | 'full_name' | 'email' | 'phone' | 'current_location'
  | 'experience_years' | 'notice_period' | 'current_ctc' | 'expected_ctc'
  | 'portfolio_url' | 'linkedin_url' | 'cover_letter';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;
const URL_RE = /^https?:\/\/.+\..+/i;
const MAX_RESUME = 5 * 1024 * 1024;
const RESUME_EXT = /\.(pdf|doc|docx)$/i;

const EMPTY = {
  full_name: '', email: '', phone: '', current_location: '',
  experience_years: '', notice_period: '', current_ctc: '', expected_ctc: '',
  portfolio_url: '', linkedin_url: '', cover_letter: '',
} satisfies Record<TextField, string>;

function validateField(name: TextField, raw: string): string {
  const v = (raw || '').trim();
  switch (name) {
    case 'full_name':
      if (!v) return 'Please enter your full name.';
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
    case 'experience_years':
      if (!v) return 'Please select your experience.';
      return '';
    case 'portfolio_url':
    case 'linkedin_url':
      if (v && !URL_RE.test(v)) return 'Enter a valid URL (https://…).';
      return '';
    case 'current_ctc':
    case 'expected_ctc':
      // Optional, but if filled it must look like a real amount — reject
      // free-text like "ckmnsfc". Accepts "4.5 LPA", "6 LPA", "450000", "₹6,00,000", "6L".
      if (v && (!/\d/.test(v) || !/^[₹$]?\s*\d[\d,]*(\.\d+)?\s*(lpa|l|lakh|lakhs|k|cr|crore|inr|pa|p\.a\.|per\s?annum|\/-)?\s*$/i.test(v)))
        return 'Enter a valid amount (e.g. 4.5 LPA or 450000).';
      return '';
    case 'cover_letter':
      if (v && v.length > 2000) return 'Keep your cover letter under 2000 characters.';
      return '';
    default:
      return '';
  }
}

const REQUIRED_TEXT: TextField[] = ['full_name', 'email', 'phone', 'experience_years', 'current_ctc', 'expected_ctc', 'portfolio_url', 'linkedin_url', 'cover_letter'];

function validateResume(file: File | null): string {
  if (!file || !file.size) return 'Please upload your résumé.';
  if (!RESUME_EXT.test(file.name)) return 'Résumé must be a PDF, DOC, or DOCX file.';
  if (file.size > MAX_RESUME) return 'Résumé must be under 5MB.';
  return '';
}

export function CareerApplyForm({ positionId, positionTitle }: Props) {
  const [values, setValues] = useState<Record<TextField, string>>({ ...EMPTY });
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<TextField | 'resume', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function setField(name: TextField, value: string) {
    setValues((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: validateField(name, value) || undefined }));
  }
  function onBlur(name: TextField) {
    setErrors((p) => ({ ...p, [name]: validateField(name, values[name]) || undefined }));
  }
  function onResume(file: File | null) {
    setResume(file);
    setErrors((p) => ({ ...p, resume: validateResume(file) || undefined }));
  }
  function validateAll(): boolean {
    const next: Partial<Record<TextField | 'resume', string>> = {};
    REQUIRED_TEXT.forEach((f) => { const m = validateField(f, values[f]); if (m) next[f] = m; });
    const r = validateResume(resume); if (r) next.resume = r;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!validateAll()) return;

    const fd = new FormData();
    (Object.keys(values) as TextField[]).forEach((k) => { const v = values[k].trim(); if (v) fd.set(k, v); });
    if (resume) fd.set('resume', resume, resume.name);
    fd.set('position_id', String(positionId));
    fd.set('position_title', positionTitle);

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase()}/job-applications`, { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({ success: false }));
      if (res.ok && json.success) { setDone(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else setFormError(json.message || json.error || 'Something went wrong. Please try again.');
    } catch {
      setFormError('Network error. Please try again.');
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="rounded-md border border-success/30 bg-success/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-3 heading text-lg text-slate-900">Application submitted!</h3>
        <p className="mt-1.5 text-sm text-slate-600">Thanks for applying for <span className="font-semibold">{positionTitle}</span>. Our team will review it and get back to you soon.</p>
      </div>
    );
  }

  const cls = (n: TextField) => `${baseInput} ${errors[n] ? errInput : okInput}`;
  const Err = ({ n }: { n: TextField | 'resume' }) => (errors[n] ? <p className="mt-1 text-[11px] text-rose-600">{errors[n]}</p> : null);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">{formError}</div>}

      <div>
        <h3 className="heading text-sm text-slate-900 mb-2.5">Personal information</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Full name *</label>
            <input value={values.full_name} onChange={(e) => setField('full_name', e.target.value)} onBlur={() => onBlur('full_name')} aria-invalid={!!errors.full_name} className={cls('full_name')} placeholder="Your full name" />
            <Err n="full_name" />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" value={values.email} onChange={(e) => setField('email', e.target.value)} onBlur={() => onBlur('email')} aria-invalid={!!errors.email} className={cls('email')} placeholder="you@example.com" />
            <Err n="email" />
          </div>
          <div>
            <label className={labelCls}>Phone *</label>
            <input type="tel" value={values.phone} onChange={(e) => setField('phone', e.target.value)} onBlur={() => onBlur('phone')} aria-invalid={!!errors.phone} className={cls('phone')} placeholder="+91 XXXXX XXXXX" />
            <Err n="phone" />
          </div>
          <div>
            <label className={labelCls}>Current location</label>
            <input value={values.current_location} onChange={(e) => setField('current_location', e.target.value)} className={cls('current_location')} placeholder="City, State" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="heading text-sm text-slate-900 mb-2.5">Professional details</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Total experience *</label>
            <select value={values.experience_years} onChange={(e) => setField('experience_years', e.target.value)} onBlur={() => onBlur('experience_years')} aria-invalid={!!errors.experience_years} className={cls('experience_years')}>
              <option value="" disabled>Select experience</option>
              {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <Err n="experience_years" />
          </div>
          <div>
            <label className={labelCls}>Notice period</label>
            <select value={values.notice_period} onChange={(e) => setField('notice_period', e.target.value)} className={cls('notice_period')}>
              <option value="">Select notice period</option>
              {NOTICE.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Current CTC (annual)</label>
            <input value={values.current_ctc} onChange={(e) => setField('current_ctc', e.target.value)} onBlur={() => onBlur('current_ctc')} aria-invalid={!!errors.current_ctc} className={cls('current_ctc')} placeholder="e.g. 4.5 LPA" />
            <Err n="current_ctc" />
          </div>
          <div>
            <label className={labelCls}>Expected CTC (annual)</label>
            <input value={values.expected_ctc} onChange={(e) => setField('expected_ctc', e.target.value)} onBlur={() => onBlur('expected_ctc')} aria-invalid={!!errors.expected_ctc} className={cls('expected_ctc')} placeholder="e.g. 6 LPA" />
            <Err n="expected_ctc" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="heading text-sm text-slate-900 mb-2.5">Online profiles</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Portfolio / GitHub</label>
            <input type="url" value={values.portfolio_url} onChange={(e) => setField('portfolio_url', e.target.value)} onBlur={() => onBlur('portfolio_url')} aria-invalid={!!errors.portfolio_url} className={cls('portfolio_url')} placeholder="https://github.com/you" />
            <Err n="portfolio_url" />
          </div>
          <div>
            <label className={labelCls}>LinkedIn</label>
            <input type="url" value={values.linkedin_url} onChange={(e) => setField('linkedin_url', e.target.value)} onBlur={() => onBlur('linkedin_url')} aria-invalid={!!errors.linkedin_url} className={cls('linkedin_url')} placeholder="https://linkedin.com/in/you" />
            <Err n="linkedin_url" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="heading text-sm text-slate-900 mb-2.5">Résumé / CV *</h3>
        <label className={`flex cursor-pointer items-center gap-3 rounded-md border border-dashed px-4 py-3 ${errors.resume ? 'border-rose-300 bg-rose-50/40' : 'border-slate-300 bg-slate-50 hover:border-brand-400'}`}>
          <UploadCloud className="h-5 w-5 text-brand-600 shrink-0" />
          <span className="text-sm text-slate-600">{resume?.name || 'Upload PDF, DOC, or DOCX (max 5MB)'}</span>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => onResume(e.target.files?.[0] || null)} />
        </label>
        <Err n="resume" />
      </div>

      <div>
        <label className={labelCls}>Cover letter</label>
        <textarea value={values.cover_letter} onChange={(e) => setField('cover_letter', e.target.value)} onBlur={() => onBlur('cover_letter')} aria-invalid={!!errors.cover_letter} rows={4} className={cls('cover_letter')} placeholder="Tell us why you'd be a great fit..." />
        <Err n="cover_letter" />
      </div>

      <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-6 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all disabled:opacity-70">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit application'}
      </button>
      <p className="text-[11px] text-slate-400">By submitting, you agree your information will be used for recruitment purposes only.</p>
    </form>
  );
}
