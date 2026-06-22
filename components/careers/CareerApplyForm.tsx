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
const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500';

export function CareerApplyForm({ positionId, positionTitle }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get('full_name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const exp = String(fd.get('experience_years') || '').trim();
    const resume = fd.get('resume') as File | null;

    if (!name || !email || !phone || !exp) { setError('Please fill all required fields.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (!resume || !resume.size) { setError('Please upload your résumé.'); return; }
    if (resume.size > 5 * 1024 * 1024) { setError('Résumé must be under 5MB.'); return; }

    fd.set('position_id', String(positionId));
    fd.set('position_title', positionTitle);

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase()}/job-applications`, { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({ success: false }));
      if (res.ok && json.success) { setDone(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else setError(json.message || json.error || 'Something went wrong. Please try again.');
    } catch {
      setError('Network error. Please try again.');
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

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">{error}</div>}

      <div>
        <h3 className="heading text-sm text-slate-900 mb-2.5">Personal information</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className={labelCls}>Full name *</label><input name="full_name" required className={inputCls} placeholder="Your full name" /></div>
          <div><label className={labelCls}>Email *</label><input name="email" type="email" required className={inputCls} placeholder="you@example.com" /></div>
          <div><label className={labelCls}>Phone *</label><input name="phone" required className={inputCls} placeholder="+91 XXXXX XXXXX" /></div>
          <div><label className={labelCls}>Current location</label><input name="current_location" className={inputCls} placeholder="City, State" /></div>
        </div>
      </div>

      <div>
        <h3 className="heading text-sm text-slate-900 mb-2.5">Professional details</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Total experience *</label>
            <select name="experience_years" required defaultValue="" className={inputCls}>
              <option value="" disabled>Select experience</option>
              {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Notice period</label>
            <select name="notice_period" defaultValue="" className={inputCls}>
              <option value="">Select notice period</option>
              {NOTICE.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Current CTC (annual)</label><input name="current_ctc" className={inputCls} placeholder="e.g. 4.5 LPA" /></div>
          <div><label className={labelCls}>Expected CTC (annual)</label><input name="expected_ctc" className={inputCls} placeholder="e.g. 6 LPA" /></div>
        </div>
      </div>

      <div>
        <h3 className="heading text-sm text-slate-900 mb-2.5">Online profiles</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className={labelCls}>Portfolio / GitHub</label><input name="portfolio_url" type="url" className={inputCls} placeholder="https://github.com/you" /></div>
          <div><label className={labelCls}>LinkedIn</label><input name="linkedin_url" type="url" className={inputCls} placeholder="https://linkedin.com/in/you" /></div>
        </div>
      </div>

      <div>
        <h3 className="heading text-sm text-slate-900 mb-2.5">Résumé / CV *</h3>
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 hover:border-brand-400">
          <UploadCloud className="h-5 w-5 text-brand-600 shrink-0" />
          <span className="text-sm text-slate-600">{fileName || 'Upload PDF, DOC, or DOCX (max 5MB)'}</span>
          <input name="resume" type="file" accept=".pdf,.doc,.docx" required className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} />
        </label>
      </div>

      <div>
        <label className={labelCls}>Cover letter</label>
        <textarea name="cover_letter" rows={4} className={inputCls} placeholder="Tell us why you'd be a great fit..." />
      </div>

      <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-6 py-2.5 text-sm font-bold shadow-btn active:scale-95 transition-all disabled:opacity-70">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit application'}
      </button>
      <p className="text-[11px] text-slate-400">By submitting, you agree your information will be used for recruitment purposes only.</p>
    </form>
  );
}
